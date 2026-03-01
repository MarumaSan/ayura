'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type BoxIngredientRow = {
    ingredientId: string;
    gramsPerWeek: number;
    note: string;
};

type CalcPreview = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    priceGuide: number; // คำนวณราคาวัตถุดิบรวม/สัปดาห์
};

const EMPTY_FORM = {
    id: '',
    name: '',
    description: '',
    image: '📦',
    priceWeekly: 0,
    priceMonthly: 0,
    isActive: true,
};

export default function AdminMealSetsPage() {
    const [mealSets, setMealSets] = useState<any[]>([]);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [boxRows, setBoxRows] = useState<BoxIngredientRow[]>([
        { ingredientId: '', gramsPerWeek: 0, note: '' },
    ]);
    const [calcPreview, setCalcPreview] = useState<CalcPreview>({
        calories: 0, protein: 0, carbs: 0, fat: 0, priceGuide: 0,
    });
    const [saving, setSaving] = useState(false);

    /* ───── Fetch ───── */
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [msRes, ingRes] = await Promise.all([
                fetch('/api/admin/mealsets'),
                fetch('/api/admin/ingredients'),
            ]);
            const msJson = await msRes.json();
            const ingJson = await ingRes.json();
            if (msJson.success) setMealSets(msJson.data);
            if (ingJson.success) setIngredients(ingJson.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ───── Live calculation preview ───── */
    useEffect(() => {
        let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalPrice = 0;
        for (const row of boxRows) {
            const ing = ingredients.find((i) => i.id === row.ingredientId);
            if (!ing || row.gramsPerWeek <= 0) continue;
            const factor = row.gramsPerWeek / 100;
            totalCal += (ing.calories100g || 0) * factor;
            totalProtein += (ing.protein100g || 0) * factor;
            totalCarbs += (ing.carbs100g || 0) * factor;
            totalFat += (ing.fat100g || 0) * factor;
            totalPrice += (ing.pricePer100g || 0) * factor;
        }
        setCalcPreview({
            calories: Math.round(totalCal / 7),
            protein: Math.round(totalProtein / 7),
            carbs: Math.round(totalCarbs / 7),
            fat: Math.round(totalFat / 7),
            priceGuide: Math.round(totalPrice),
        });
    }, [boxRows, ingredients]);

    /* ───── Modal helpers ───── */
    const openAdd = () => {
        setEditingItem(null);
        setFormData({ ...EMPTY_FORM });
        setBoxRows([{ ingredientId: '', gramsPerWeek: 0, note: '' }]);
        setShowModal(true);
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            id: item.id || '',
            name: item.name || '',
            description: item.description || '',
            image: item.image || '📦',
            priceWeekly: item.priceWeekly || 0,
            priceMonthly: item.priceMonthly || 0,
            isActive: item.isActive ?? true,
        });
        const rows: BoxIngredientRow[] = (item.boxIngredients || []).map((b: any) => ({
            ingredientId: b.ingredientId || '',
            gramsPerWeek: b.gramsPerWeek || 0,
            note: b.note || '',
        }));
        setBoxRows(rows.length > 0 ? rows : [{ ingredientId: '', gramsPerWeek: 0, note: '' }]);
        setShowModal(true);
    };

    /* ───── Box row management ───── */
    const updateRow = (idx: number, field: keyof BoxIngredientRow, value: any) => {
        setBoxRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };
    const addRow = () => setBoxRows((prev) => [...prev, { ingredientId: '', gramsPerWeek: 0, note: '' }]);
    const removeRow = (idx: number) => setBoxRows((prev) => prev.filter((_, i) => i !== idx));

    /* ───── Save ───── */
    const handleSave = async () => {
        if (!formData.id.trim()) return alert('กรุณาระบุ ID ของเซ็ต');
        if (!formData.name.trim()) return alert('กรุณาระบุชื่อเซ็ต');
        const validRows = boxRows.filter((r) => r.ingredientId && r.gramsPerWeek > 0);
        if (validRows.length === 0) return alert('กรุณาเพิ่มวัตถุดิบอย่างน้อย 1 รายการ');

        setSaving(true);
        try {
            const url = editingItem ? `/api/admin/mealsets/${editingItem.id || editingItem._id}` : '/api/admin/mealsets';
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, boxIngredients: validRows }),
            });
            const data = await res.json();

            if (data.success) {
                setShowModal(false);
                fetchAll();
            } else {
                alert(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
            }
        } catch (e) {
            console.error(e);
            alert('เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    /* ───── Delete (soft & hard) ───── */
    const handleDelete = async (item: any) => {
        if (!confirm(`ยืนยันการปิดการใช้งานเซ็ต "${item.name}"?`)) return;
        const res = await fetch(`/api/admin/mealsets/${item.id || item._id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            fetchAll();
        } else {
            alert('เกิดข้อผิดพลาดในการปิดใช้งาน: ' + data.error);
        }
    };

    const handleHardDelete = async (item: any) => {
        if (!confirm(`⚠️ ยืนยันการลบเซ็ต "${item.name}" อย่างถาวร? \nข้อมูลวัตถุดิบที่อยู่ในเซ็ตนี้จะถูกลบไปด้วยและไม่สามารถกู้คืนได้`)) return;
        const res = await fetch(`/api/admin/mealsets/${item.id || item._id}?hard=true`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            fetchAll();
        } else {
            alert('เกิดข้อผิดพลาดในการลบ: ' + data.error);
        }
    };

    /* ───── Restore ───── */
    const handleRestore = async (item: any) => {
        const res = await fetch(`/api/admin/mealsets/${item.id || item._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, isActive: true }),
        });
        const data = await res.json();
        if (data.success) fetchAll();
    };

    /* ───── Render ───── */
    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-3">
                        <Link href="/admin" className="hover:text-[var(--color-primary)]">แดชบอร์ด</Link>
                        <span>/</span>
                        <span>จัดการเซ็ตอาหาร</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient mb-2">🍱 จัดการ Meal Sets</h1>
                            <p className="text-[var(--color-text-light)]">เพิ่ม แก้ไข หรือปิดใช้งานเซ็ตอาหารสุขภาพ</p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0 items-start sm:items-center">
                            <Link href="/admin/recipes" className="btn-outline !py-2 !px-4 text-sm whitespace-nowrap">
                                จัดการสูตรอาหาร 🥗
                            </Link>
                            <button onClick={openAdd} className="btn-primary !py-2 !px-5 text-sm self-start sm:self-auto whitespace-nowrap">
                                + เพิ่มเซ็ตใหม่
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'เซ็ตทั้งหมด', value: mealSets.length, color: 'var(--color-primary)' },
                        { label: 'เปิดใช้งาน', value: mealSets.filter((m) => m.isActive).length, color: 'var(--color-success)' },
                        { label: 'ปิดใช้งาน', value: mealSets.filter((m) => !m.isActive).length, color: 'var(--color-danger)' },
                        { label: 'Ingredient ทั้งหมด', value: ingredients.length, color: 'var(--color-accent)' },
                    ].map((s, i) => (
                        <div key={i} className="glass-card p-4 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                            <div className="text-sm text-[var(--color-text-light)]">{s.label}</div>
                            <div className="text-2xl font-bold" style={{ color: s.color }}>
                                {loading ? '…' : s.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden animate-fade-in delay-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    {['เซ็ต', 'วัตถุดิบ', 'สารอาหาร (ต่อวัน)', 'ราคา', 'สถานะ', 'จัดการ'].map((h) => (
                                        <th key={h} className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-[var(--color-text-muted)]">กำลังโหลด...</td></tr>
                                ) : mealSets.length === 0 ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-[var(--color-text-muted)]">ยังไม่มีเซ็ตอาหาร</td></tr>
                                ) : mealSets.map((ms) => (
                                    <tr key={ms._id} className="border-b border-[var(--color-border)] last:border-none hover:bg-[var(--color-bg-section)]/50 transition-colors">
                                        {/* ชื่อ */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-section)] flex items-center justify-center text-xl">{ms.image || '📦'}</div>
                                                <div>
                                                    <div className="text-sm font-semibold">{ms.name}</div>
                                                    <div className="text-xs text-[var(--color-text-muted)]">{ms.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* วัตถุดิบ */}
                                        <td className="py-4 px-4">
                                            <div className="text-sm font-bold">{(ms.boxIngredients || []).length} รายการ</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">
                                                {(ms.boxIngredients || []).slice(0, 3).map((b: any) => {
                                                    const ing = ingredients.find((i) => i.id === b.ingredientId);
                                                    return ing ? ing.name : b.ingredientId;
                                                }).join(', ')}{(ms.boxIngredients || []).length > 3 ? '...' : ''}
                                            </div>
                                        </td>
                                        {/* สารอาหาร */}
                                        <td className="py-4 px-4">
                                            <div className="text-xs space-y-0.5">
                                                <div>🔥 <span className="font-semibold">{ms.avgNutrition?.calories || 0}</span> kcal</div>
                                                <div>💪 <span className="font-semibold">{ms.avgNutrition?.protein || 0}</span>g protein</div>
                                                <div>🌾 <span className="font-semibold">{ms.avgNutrition?.carbs || 0}</span>g carbs</div>
                                                <div>🥑 <span className="font-semibold">{ms.avgNutrition?.fat || 0}</span>g fat</div>
                                            </div>
                                        </td>
                                        {/* ราคา */}
                                        <td className="py-4 px-4">
                                            <div className="text-sm font-bold text-[var(--color-primary)]">฿{ms.priceWeekly?.toLocaleString()}/สัปดาห์</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">฿{ms.priceMonthly?.toLocaleString()}/เดือน</div>
                                        </td>
                                        {/* สถานะ */}
                                        <td className="py-4 px-4">
                                            {ms.isActive ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">เปิด</span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">ปิด</span>
                                            )}
                                        </td>
                                        {/* จัดการ */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => openEdit(ms)} className="text-sm text-[var(--color-primary)] hover:underline">แก้ไข</button>
                                                {ms.isActive ? (
                                                    <button onClick={() => handleDelete(ms)} className="text-sm text-[var(--color-danger)] hover:underline">ปิด</button>
                                                ) : (
                                                    <button onClick={() => handleRestore(ms)} className="text-sm text-green-600 hover:underline">เปิดใช้</button>
                                                )}
                                                <button onClick={() => handleHardDelete(ms)} className="text-sm text-gray-400 hover:text-red-600 hover:underline">ลบถาวร</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ─── Add / Edit Modal ─── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card !bg-white p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-5">
                            {editingItem ? '✏️ แก้ไขเซ็ตอาหาร' : '🍱 เพิ่มเซ็ตอาหารใหม่'}
                        </h3>

                        <div className="space-y-5">
                            {/* Row 1 : icon + id + name */}
                            <div className="grid grid-cols-6 gap-3">
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium mb-1">ไอคอน</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-center text-2xl"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">ID (unique)</label>
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        placeholder="ms-health"
                                        disabled={!!editingItem}
                                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm disabled:bg-gray-50 disabled:text-gray-400"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium mb-1">ชื่อเซ็ต</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="เซ็ตสุขภาพดี"
                                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                    />
                                </div>
                            </div>

                            {/* Row 2 : description */}
                            <div>
                                <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="เซ็ตอาหารสำหรับ..."
                                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm resize-none h-16"
                                />
                            </div>

                            {/* Row 3 : prices */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">ราคา/สัปดาห์ (฿)</label>
                                    <input
                                        type="number"
                                        value={formData.priceWeekly}
                                        onChange={(e) => setFormData({ ...formData, priceWeekly: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">ราคา/เดือน (฿)</label>
                                    <input
                                        type="number"
                                        value={formData.priceMonthly}
                                        onChange={(e) => setFormData({ ...formData, priceMonthly: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                    />
                                </div>
                            </div>

                            {/* ─── Box Ingredients ─── */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-[var(--color-primary)]">
                                        🧺 วัตถุดิบในกล่อง (boxIngredients)
                                    </label>
                                    <button onClick={addRow} className="text-xs btn-outline !px-3 !py-1">
                                        + เพิ่มแถว
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {/* Header labels */}
                                    <div className="grid grid-cols-12 gap-2 text-xs text-[var(--color-text-light)] font-medium px-1">
                                        <div className="col-span-4">วัตถุดิบ</div>
                                        <div className="col-span-2 text-center">กรัม/สัปดาห์</div>
                                        <div className="col-span-5">หมายเหตุ (note)</div>
                                        <div className="col-span-1"></div>
                                    </div>

                                    {boxRows.map((row, idx) => {
                                        const ingInfo = ingredients.find((i) => i.id === row.ingredientId);
                                        return (
                                            <div
                                                key={idx}
                                                className="grid grid-cols-12 gap-2 items-start bg-[var(--color-bg-section)] rounded-xl p-2 border border-[var(--color-border)]"
                                            >
                                                {/* Ingredient Dropdown */}
                                                <div className="col-span-4">
                                                    <select
                                                        value={row.ingredientId}
                                                        onChange={(e) => updateRow(idx, 'ingredientId', e.target.value)}
                                                        className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-xs bg-white"
                                                    >
                                                        <option value="">-- เลือกวัตถุดิบ --</option>
                                                        {ingredients.map((i) => (
                                                            <option key={i.id} value={i.id}>
                                                                {i.image} {i.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {ingInfo && (
                                                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5 px-1 leading-tight">
                                                            <div>฿{ingInfo.pricePer100g}/100g · {ingInfo.calories100g} kcal/100g</div>
                                                            <div className="mt-0.5 opacity-80">P: {ingInfo.protein100g || 0}g · C: {ingInfo.carbs100g || 0}g · F: {ingInfo.fat100g || 0}g</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Grams */}
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={row.gramsPerWeek}
                                                        onChange={(e) => updateRow(idx, 'gramsPerWeek', Number(e.target.value))}
                                                        className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-center bg-white"
                                                    />
                                                    {ingInfo && row.gramsPerWeek > 0 && (
                                                        <div className="text-[10px] text-[var(--color-primary)] mt-0.5 text-center">
                                                            ≈ ฿{Math.round(ingInfo.pricePer100g * row.gramsPerWeek / 100)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Note */}
                                                <div className="col-span-5">
                                                    <input
                                                        type="text"
                                                        value={row.note}
                                                        onChange={(e) => updateRow(idx, 'note', e.target.value)}
                                                        placeholder="เช่น ล้างสะอาดแล้ว, ออร์แกนิค..."
                                                        className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-xs bg-white"
                                                    />
                                                </div>

                                                {/* Remove */}
                                                <div className="col-span-1 flex justify-center mt-1.5">
                                                    <button
                                                        onClick={() => removeRow(idx)}
                                                        disabled={boxRows.length === 1}
                                                        className="text-red-400 hover:text-red-600 text-lg leading-none disabled:opacity-30"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ─── Live Calculation Preview ─── */}
                            <div className="rounded-xl bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 border border-[var(--color-primary)]/20 p-4">
                                <div className="text-sm font-bold text-[var(--color-primary)] mb-3 flex items-center gap-2">
                                    🧮 ค่าที่คำนวณได้ (Preview อัตโนมัติ)
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Nutrition */}
                                    <div>
                                        <div className="text-xs text-[var(--color-text-muted)] mb-1 font-medium">สารอาหารเฉลี่ยต่อวัน</div>
                                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                                            {[
                                                { icon: '🔥', label: 'Cal', val: `${calcPreview.calories} kcal` },
                                                { icon: '💪', label: 'Protein', val: `${calcPreview.protein}g` },
                                                { icon: '🌾', label: 'Carbs', val: `${calcPreview.carbs}g` },
                                                { icon: '🥑', label: 'Fat', val: `${calcPreview.fat}g` },
                                            ].map((n) => (
                                                <div key={n.label} className="flex items-center gap-1 bg-white rounded-lg px-2 py-1.5 border border-[var(--color-border)]">
                                                    <span>{n.icon}</span>
                                                    <span className="text-[var(--color-text-muted)]">{n.label}</span>
                                                    <span className="font-bold ml-auto">{n.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Price guide */}
                                    <div>
                                        <div className="text-xs text-[var(--color-text-muted)] mb-1 font-medium">ราคาต้นทุนวัตถุดิบ (แนะนำ)</div>
                                        <div className="bg-white rounded-xl border border-[var(--color-border)] px-4 py-3 text-center">
                                            <div className="text-2xl font-extrabold text-[var(--color-primary)]">
                                                ฿{calcPreview.priceGuide.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)]">ต่อสัปดาห์ (ราคาวัตถุดิบรวม)</div>
                                            {formData.priceWeekly > 0 && (
                                                <div className={`text-xs mt-1 font-medium ${formData.priceWeekly >= calcPreview.priceGuide ? 'text-green-600' : 'text-red-500'}`}>
                                                    {formData.priceWeekly >= calcPreview.priceGuide
                                                        ? `กำไร ฿${formData.priceWeekly - calcPreview.priceGuide}`
                                                        : `⚠️ ขาดทุน ฿${calcPreview.priceGuide - formData.priceWeekly}`}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                                    * คำนวณจากข้อมูล pricePer100g และสารอาหารต่อ 100g ใน ingredient database · จะบันทึก avgNutrition อัตโนมัติ
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="btn-outline flex-1 justify-center !py-2.5">
                                ยกเลิก
                            </button>
                            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center !py-2.5 disabled:opacity-60">
                                {saving ? 'กำลังบันทึก...' : editingItem ? 'บันทึก ✓' : 'เพิ่มเซ็ต ✓'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
