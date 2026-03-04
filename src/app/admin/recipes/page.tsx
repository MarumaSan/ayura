'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminRecipesPage() {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        image: '🍽️',
        mealType: 'เช้า',
        cookTime: 20,
        servings: 1,
        steps: [''],
    });

    const [rxRows, setRxRows] = useState<{ ingredientId: string; gramsUsed: number; note: string }[]>([
        { ingredientId: '', gramsUsed: 0, note: '' }
    ]);

    const [calcPreview, setCalcPreview] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
    });

    const fetchAll = async () => {
        setLoading(true);
        try {
            // Get admin token from localStorage
            const profile = localStorage.getItem('ayuraProfile');
            let token = '';
            if (profile) {
                try {
                    const parsed = JSON.parse(profile);
                    token = parsed.userId || parsed.id || '';
                } catch {
                    // Failed to parse profile
                }
            }

            const [msRes, ingRes] = await Promise.all([
                fetch('/api/admin/recipes', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch('/api/admin/ingredients', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            ]);
            const msJson = await msRes.json();
            const ingJson = await ingRes.json();

            if (msJson.success) setRecipes(msJson.data);
            if (ingJson.success) setIngredients(ingJson.data);
        } catch (error) {
            // Silently handle fetch error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // Effect for active nutrition calculation
    useEffect(() => {
        let calories = 0, protein = 0, carbs = 0, fat = 0;
        rxRows.forEach(row => {
            if (row.ingredientId && row.gramsUsed > 0) {
                const ing = ingredients.find(i => i.id === row.ingredientId);
                if (ing) {
                    const factor = row.gramsUsed / 100;
                    calories += (ing.calories100g || ing.calories_100g || 0) * factor;
                    protein += (ing.protein100g || ing.protein_100g || 0) * factor;
                    carbs += (ing.carbs100g || ing.carbs_100g || 0) * factor;
                    fat += (ing.fat100g || ing.fat_100g || 0) * factor;
                }
            }
        });
        setCalcPreview({
            calories: Math.round(calories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat)
        });
    }, [rxRows, ingredients]);

    const handleSave = async () => {
        if (!formData.name) return alert('กรุณาระบุชื่อเรื่อง');
        const validRows = rxRows.filter(r => r.ingredientId && r.gramsUsed > 0);

        const payload = {
            id: editingItem ? undefined : formData.id,
            name: formData.name,
            image: formData.image,
            mealType: formData.mealType,
            cookTime: formData.cookTime,
            servings: formData.servings,
            steps: formData.steps.filter(s => s.trim() !== ''),
            recipeIngredients: validRows
        };

        try {
            const url = editingItem ? `/api/admin/recipes/${editingItem.id || editingItem._id}` : '/api/admin/recipes';
            const res = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setIsEditing(false);
                fetchAll();
            } else {
                alert('บันทึกไม่สำเร็จ: ' + data.error);
            }
        } catch (error: any) {
            alert('บันทึกไม่สำเร็จ: ' + error.message);
        }
    };

    const handleHardDelete = async (item: any) => {
        if (!confirm(`⚠️ ยืนยันการลบสูตรอาหาร "${item.name}" อย่างถาวร?`)) return;
        const res = await fetch(`/api/admin/recipes/${item.id || item._id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            fetchAll();
        } else {
            alert('เกิดข้อผิดพลาดในการลบ: ' + data.error);
        }
    };

    const openCreate = () => {
        setEditingItem(null);
        setFormData({
            id: '',
            name: '',
            image: '🍽️',
            mealType: 'เช้า',
            cookTime: 20,
            servings: 1,
            steps: [''],
        });
        setRxRows([{ ingredientId: '', gramsUsed: 0, note: '' }]);
        setIsEditing(true);
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            id: item.id || item._id,
            name: item.name,
            image: item.image || '🍽️',
            mealType: item.mealType || item.meal_type || 'เช้า',
            cookTime: item.cookTime || item.cook_time || 20,
            servings: item.servings || 1,
            steps: item.steps && item.steps.length > 0 ? item.steps : [''],
        });

        if (item.recipeIngredients && item.recipeIngredients.length > 0) {
            setRxRows(item.recipeIngredients);
        } else {
            setRxRows([{ ingredientId: '', gramsUsed: 0, note: '' }]);
        }
        setIsEditing(true);
    };

    const addIngredientRow = () => {
        setRxRows([...rxRows, { ingredientId: '', gramsUsed: 0, note: '' }]);
    };
    const updateIngredientRow = (index: number, field: string, value: any) => {
        const newRows = [...rxRows];
        (newRows[index] as any)[field] = value;
        setRxRows(newRows);
    };
    const removeIngredientRow = (index: number) => {
        const newRows = rxRows.filter((_, i) => i !== index);
        if (newRows.length === 0) newRows.push({ ingredientId: '', gramsUsed: 0, note: '' });
        setRxRows(newRows);
    };

    const addStepRow = () => {
        setFormData({ ...formData, steps: [...formData.steps, ''] });
    };
    const updateStepRow = (index: number, value: string) => {
        const newSteps = [...formData.steps];
        newSteps[index] = value;
        setFormData({ ...formData, steps: newSteps });
    };
    const removeStepRow = (index: number) => {
        const newSteps = formData.steps.filter((_, i) => i !== index);
        if (newSteps.length === 0) newSteps.push('');
        setFormData({ ...formData, steps: newSteps });
    };

    const mealTypeColor = (type: string) => {
        const t = type || '';
        if (t === 'เช้า') return 'bg-orange-100 text-orange-700';
        if (t === 'กลางวัน') return 'bg-green-100 text-green-700';
        if (t === 'เย็น') return 'bg-purple-100 text-purple-700';
        if (t === 'ว่าง') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gradient mb-2">จัดการสูตรอาหาร 🥗</h1>
                        <p className="text-[var(--color-text-light)]">เพิ่มและแก้ไขสูตรอาหารสำหรับการจัดอาหารรายสัปดาห์</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/admin/mealsets" className="btn-outline !py-2 !px-4 text-sm">กลับไปหน้า Mealset 📦</Link>
                        <button onClick={openCreate} className="btn-primary !py-2 !px-4 text-sm">
                            + เพิ่มสูตรอาหารใหม่
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--color-bg-section)] border-b border-[var(--color-border)]">
                                    <th className="p-4 font-bold text-sm text-[var(--color-text-muted)] w-1/4">สูตรอาหาร</th>
                                    <th className="p-4 font-bold text-sm text-[var(--color-text-muted)]">มื้ออาหาร</th>
                                    <th className="p-4 font-bold text-sm text-[var(--color-text-muted)]">เวลาที่ใช้ / เสิร์ฟ</th>
                                    <th className="p-4 font-bold text-sm text-[var(--color-text-muted)]">โภชนาการ (ต่อ 1 เสิร์ฟ)</th>
                                    <th className="p-4 font-bold text-sm text-[var(--color-text-muted)] text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-[var(--color-text-muted)]">
                                            กำลังโหลดข้อมูล...
                                        </td>
                                    </tr>
                                ) : recipes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-[var(--color-text-muted)]">
                                            ยังไม่มีสูตรอาหารในระบบ
                                        </td>
                                    </tr>
                                ) : recipes.map((r) => (
                                    <tr key={r.id || r._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-section)] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl">{r.image}</div>
                                                <div>
                                                    <div className="font-bold text-md text-[var(--color-text)]">{r.name}</div>
                                                    <div className="text-xs text-[var(--color-text-muted)] font-mono">{r.id || r._id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${mealTypeColor(r.mealType || r.meal_type)}`}>
                                                {r.mealType || r.meal_type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-sm text-[var(--color-text-light)]">
                                            ⏱ <span className="font-bold">{r.cookTime || r.cook_time || 20}</span> นาที <br />
                                            🍽 สำหรับ <span className="font-bold">{r.servings || 1}</span> ท่าน
                                        </td>
                                        <td className="p-4 text-xs">
                                            <div className="flex gap-2 text-[var(--color-text-light)] font-medium">
                                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{Number(r.calories || 0).toFixed(0)} kcal</span>
                                                <span>P: {r.protein || 0}g</span>
                                                <span>C: {r.carbs || 0}g</span>
                                                <span>F: {r.fat || 0}g</span>
                                            </div>
                                            <div className="text-[10px] text-[var(--color-text-muted)] mt-1">ประกอบด้วย {r.recipeIngredients?.length || 0} วัตถุดิบ</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => openEdit(r)} className="text-sm text-[var(--color-primary)] hover:underline">แก้ไข</button>
                                                <button onClick={() => handleHardDelete(r)} className="text-sm text-gray-400 hover:text-red-600 hover:underline">ลบถาวร</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Edit / Create */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                            <h2 className="text-xl font-bold">{editingItem ? 'แก้ไขสูตรอาหาร' : 'สร้างสูตรอาหารใหม่'}</h2>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-6">
                                {/* Row 1: Basic Stats */}
                                <div className="grid grid-cols-5 gap-3">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium mb-1">รูปภาพ (Emoji)</label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl text-center text-xl border border-[var(--color-border)]"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">ID (เว้นว่างเพื่อสุ่ม)</label>
                                        <input
                                            type="text"
                                            value={formData.id}
                                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                            disabled={!!editingItem}
                                            placeholder="recipe-xxx"
                                            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">ชื่อสําหรับเรียก <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="ไข่เจียวหมูสับ"
                                            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Recipe metadata */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">ประเภทมื้ออาหาร</label>
                                        <select
                                            value={formData.mealType}
                                            onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                        >
                                            <option value="เช้า">มื้อเช้า</option>
                                            <option value="กลางวัน">มื้อกลางวัน</option>
                                            <option value="เย็น">มื้อเย็น</option>
                                            <option value="ว่าง">ของว่าง</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">เวลาในการทำ (นาที)</label>
                                        <input
                                            type="number"
                                            value={formData.cookTime}
                                            onChange={(e) => setFormData({ ...formData, cookTime: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">จำนวนที่ได้ (เสิร์ฟ)</label>
                                        <input
                                            type="number"
                                            value={formData.servings}
                                            onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Ingredients */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-[var(--color-primary)]">
                                            🧺 วัตถุดิบที่ใช้ (Ingredients)
                                        </label>
                                        <button onClick={addIngredientRow} className="text-xs btn-outline !px-3 !py-1 bg-white">
                                            + เพิ่มวัตถุดิบ
                                        </button>
                                    </div>
                                    <div className="bg-[var(--color-bg-section)] rounded-2xl p-4 border border-[var(--color-border)]">
                                        {/* Header labels */}
                                        <div className="grid grid-cols-12 gap-2 text-xs text-[var(--color-text-light)] font-medium px-1 mb-2">
                                            <div className="col-span-5">วัตถุดิบ</div>
                                            <div className="col-span-2 text-center">จำนวนกรัมที่ใช้</div>
                                            <div className="col-span-4">หมายเหตุ / วิธีเตรียม</div>
                                            <div className="col-span-1"></div>
                                        </div>

                                        <div className="space-y-2">
                                            {rxRows.map((row, idx) => {
                                                const ingInfo = ingredients.find((i) => i.id === row.ingredientId);
                                                return (
                                                    <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-white rounded-xl p-2 border border-[var(--color-border)]">
                                                        <div className="col-span-5">
                                                            <select
                                                                value={row.ingredientId}
                                                                onChange={(e) => updateIngredientRow(idx, 'ingredientId', e.target.value)}
                                                                className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-xs bg-gray-50 focus:bg-white"
                                                            >
                                                                <option value="">-- เลือกวัตถุดิบ --</option>
                                                                {ingredients.map((i) => (
                                                                    <option key={i.id} value={i.id}>{i.image} {i.name}</option>
                                                                ))}
                                                            </select>
                                                            {ingInfo && (
                                                                <div className="text-[10px] text-[var(--color-text-muted)] mt-1 px-1">
                                                                    P: {ingInfo.protein100g || 0}g · C: {ingInfo.carbs100g || 0}g · F: {ingInfo.fat100g || 0}g / 100g
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-span-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={row.gramsUsed || ''}
                                                                onChange={(e) => updateIngredientRow(idx, 'gramsUsed', Number(e.target.value))}
                                                                placeholder="150"
                                                                className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-center bg-gray-50 focus:bg-white"
                                                            />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <input
                                                                type="text"
                                                                value={row.note || ''}
                                                                onChange={(e) => updateIngredientRow(idx, 'note', e.target.value)}
                                                                placeholder="เช่น หั่นเต๋าเล็กๆ"
                                                                className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-xs bg-gray-50 focus:bg-white"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 flex justify-center mt-1">
                                                            <button
                                                                onClick={() => removeIngredientRow(idx)}
                                                                disabled={rxRows.length === 1}
                                                                className="text-red-400 hover:text-red-600 text-lg leading-none disabled:opacity-30"
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Auto Calculation inside ingredient box */}
                                        <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                                            <div className="text-xs font-bold text-[var(--color-primary)]">คำนวณโภชนาการรวม (ต่อ 1 สูตร) อัตโนมัติ:</div>
                                            <div className="flex gap-2">
                                                <span className="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-xs">🔥 {calcPreview.calories} kcal</span>
                                                <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">💪 Protein {calcPreview.protein}g</span>
                                                <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full text-xs">🌾 Carbs {calcPreview.carbs}g</span>
                                                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-xs">🥑 Fat {calcPreview.fat}g</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 4: Steps */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-orange-600">
                                            🍳 ขั้นตอนวิธีทำ (Steps)
                                        </label>
                                        <button onClick={addStepRow} className="text-xs btn-outline !px-3 !py-1 !border-orange-500 !text-orange-600">
                                            + เพิ่มขั้นตอน
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.steps.map((step, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={step}
                                                    onChange={(e) => updateStepRow(idx, e.target.value)}
                                                    placeholder={`อธิบายขั้นตอนที่ ${idx + 1}`}
                                                    className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-sm"
                                                />
                                                <button
                                                    onClick={() => removeStepRow(idx)}
                                                    disabled={formData.steps.length === 1}
                                                    className="text-red-400 hover:text-red-600 text-2xl px-2 disabled:opacity-30"
                                                >&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-[var(--color-border)] flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setIsEditing(false)} className="btn-outline">ยกเลิก</button>
                            <button onClick={handleSave} className="btn-primary">
                                บันทึกสูตรอาหาร ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
