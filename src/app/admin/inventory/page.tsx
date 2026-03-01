'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const categories = ['ทั้งหมด', 'ผัก', 'สมุนไพร', 'ผลไม้', 'โปรตีน', 'ธัญพืช'];

function getStockStatus(stock: number): { label: string; color: string; bg: string } {
    if (stock > 100) return { label: 'พร้อมส่ง', color: 'var(--color-success)', bg: 'rgba(16,185,129,0.1)' };
    if (stock > 50) return { label: 'ปกติ', color: 'var(--color-primary)', bg: 'rgba(45,106,79,0.1)' };
    if (stock > 0) return { label: 'ใกล้หมด', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'หมด', color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.1)' };
}

export default function InventoryPage() {
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Community State
    const [communities, setCommunities] = useState<any[]>([]);
    const [showCommunityModal, setShowCommunityModal] = useState(false);
    const [editingCommunity, setEditingCommunity] = useState<any>(null);
    const [communityFormData, setCommunityFormData] = useState({
        name: '',
        address: '',
        note: '',
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        nameEnglish: '',
        category: 'ผัก',
        image: '🥗',
        community: 'ทั่วไป',
        inStock: 0,
        pricePer100g: 0,
        note: '',
        calories100g: 0,
        protein100g: 0,
        carbs100g: 0,
        fat100g: 0,
    });

    const fetchIngredients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/ingredients');
            const data = await res.json();
            if (data.success) {
                setIngredients(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch ingredients', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCommunities = async () => {
        try {
            const res = await fetch('/api/admin/communities');
            const data = await res.json();
            if (data.success) setCommunities(data.data);
        } catch (error) {
            console.error('Failed to fetch communities', error);
        }
    };

    useEffect(() => {
        fetchIngredients();
        fetchCommunities();
    }, []);

    const filteredIngredients = ingredients.filter((item) => {
        const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
        const matchSearch =
            item.name?.includes(searchQuery) ||
            item.nameEnglish?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.community?.includes(searchQuery) ||
            item.note?.includes(searchQuery);
        return matchCategory && matchSearch;
    });

    const totalStock = ingredients.reduce((sum, i) => sum + (i.inStock || 0), 0);
    const lowStockItems = ingredients.filter((i) => (i.inStock || 0) < 80);

    const handleSave = async () => {
        if (!formData.name) return alert('กรุณาระบุชื่อวัตถุดิบ');

        try {
            const url = editingItem
                ? `/api/admin/ingredients/${editingItem.id || editingItem._id}`
                : '/api/admin/ingredients';
            const method = editingItem ? 'PUT' : 'POST';

            const dataToSave = { ...formData };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                fetchIngredients();
            } else {
                alert(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
            }
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาด');
        }
    };

    const handleSaveCommunity = async () => {
        if (!communityFormData.name) return alert('กรุณาระบุชื่อชุมชน');
        try {
            const url = editingCommunity
                ? `/api/admin/communities/${editingCommunity.id || editingCommunity._id}`
                : '/api/admin/communities';
            const method = editingCommunity ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(communityFormData)
            });
            const data = await res.json();
            if (data.success) {
                setShowCommunityModal(false);
                fetchCommunities();
                if (!editingCommunity) {
                    setFormData(prev => ({ ...prev, community: data.data.name }));
                }
            } else {
                alert(data.error || 'เกิดข้อผิดพลาดในการบันทึกชุมชน');
            }
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาด');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ยืนยันการลบวัตถุดิบนี้?')) return;
        try {
            const res = await fetch(`/api/admin/ingredients/${id}`, { method: 'DELETE' });
            if (res.ok) fetchIngredients();
        } catch (error) {
            console.error(error);
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({
            name: '', nameEnglish: '', category: 'ผัก', image: '🥗', community: 'ทั่วไป',
            inStock: 0, pricePer100g: 0, note: '',
            calories100g: 0, protein100g: 0, carbs100g: 0, fat100g: 0
        });
        setShowModal(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name || '',
            nameEnglish: item.nameEnglish || '',
            category: item.category || 'ผัก',
            image: item.image || '🥗',
            community: item.community || 'ทั่วไป',
            inStock: item.inStock || 0,
            pricePer100g: item.pricePer100g || item.pricePerUnit || 0,
            note: item.note || '',
            calories100g: item.calories100g || 0,
            protein100g: item.protein100g || 0,
            carbs100g: item.carbs100g || 0,
            fat100g: item.fat100g || 0,
        });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-3">
                        <Link href="/admin" className="hover:text-[var(--color-primary)]">
                            แดชบอร์ด
                        </Link>
                        <span>/</span>
                        <span>จัดการสต็อก</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient mb-2">
                                📋 จัดการสต็อกสินค้า
                            </h1>
                            <p className="text-[var(--color-text-light)]">
                                อัปเดตวัตถุดิบและสมุนไพร (แสดงหน่วยเป็นกรัม)
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/admin/recipes" className="btn-outline !py-2 !px-4 text-sm">
                                จัดการสูตรอาหาร 🥗
                            </Link>
                            <Link href="/admin/mealsets" className="btn-outline !py-2 !px-4 text-sm">
                                จัดการเซ็ต 🍱
                            </Link>
                            <button
                                onClick={() => {
                                    setEditingCommunity(null);
                                    setCommunityFormData({ name: '', address: '', note: '' });
                                    setShowCommunityModal(true);
                                }}
                                className="btn-outline !py-2 !px-4 text-sm"
                            >
                                + เพิ่มชุมชนผู้ผลิต
                            </button>
                            <button
                                onClick={openAddModal}
                                className="btn-primary !py-2 !px-4 text-sm"
                            >
                                + เพิ่มวัตถุดิบ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4 animate-fade-in">
                        <div className="text-sm text-[var(--color-text-light)]">รายการทั้งหมด</div>
                        <div className="text-2xl font-bold text-[var(--color-primary)]">{ingredients.length}</div>
                    </div>
                    <div className="glass-card p-4 animate-fade-in delay-100">
                        <div className="text-sm text-[var(--color-text-light)]">สต็อกรวม (กรัม)</div>
                        <div className="text-2xl font-bold text-[var(--color-primary)]">{totalStock}</div>
                    </div>
                    <div className="glass-card p-4 animate-fade-in delay-200">
                        <div className="text-sm text-[var(--color-text-light)]">ใกล้หมด</div>
                        <div className="text-2xl font-bold text-[var(--color-warning)]">{lowStockItems.length}</div>
                    </div>
                    <div className="glass-card p-4 animate-fade-in delay-300">
                        <div className="text-sm text-[var(--color-text-light)]">ชุมชนผู้ผลิตทั้งหมด</div>
                        <div className="text-2xl font-bold text-[var(--color-primary)]">{communities.length}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-4 mb-6 animate-fade-in delay-200">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="🔍 ค้นหาวัตถุดิบ หรือ โน้ต..."
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all text-sm"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {categories.map((cat: string) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat
                                        ? 'gradient-primary text-white shadow-md'
                                        : 'bg-white border border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-primary)]/30'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden animate-fade-in delay-300">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--color-text-light)] w-16">
                                        ลำดับ
                                    </th>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-[var(--color-text-light)]">
                                        วัตถุดิบ
                                    </th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        ประเภท / ชุมชน
                                    </th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        โน้ต
                                    </th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        คงเหลือ
                                    </th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        ราคา/หน่วย
                                    </th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        สถานะ
                                    </th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        จัดการ
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-[var(--color-text-muted)]">
                                            กำลังโหลด...
                                        </td>
                                    </tr>
                                ) : filteredIngredients.map((item) => {
                                    const status = getStockStatus(item.inStock || 0);
                                    return (
                                        <tr
                                            key={item.id || item._id}
                                            className="border-b border-[var(--color-border)] last:border-none hover:bg-[var(--color-bg-section)]/50 transition-colors"
                                        >
                                            <td className="py-4 px-4 text-center text-sm font-medium text-[var(--color-text-muted)]">
                                                {String(filteredIngredients.indexOf(item) + 1).padStart(3, '0')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-section)] flex items-center justify-center text-xl">
                                                        {item.image || '📦'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{item.name}</div>
                                                        <div className="text-xs text-[var(--color-text-muted)]">
                                                            {item.nameEnglish}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-xs px-2 py-1 bg-[var(--color-bg-section)] rounded-full inline-block mb-1">
                                                    {item.category}
                                                </div>
                                                <div className="text-xs text-[var(--color-text-light)] truncate max-w-[120px]">
                                                    {item.community}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm text-[var(--color-text-light)]">
                                                    {item.note || '-'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-bold">
                                                    {item.inStock || 0} {/* Force display as grams implicitly or explicitly */} กรัม
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-medium text-[var(--color-primary)]">
                                                    ฿{item.pricePer100g || 0}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span
                                                    className="text-xs px-3 py-1 rounded-full font-medium"
                                                    style={{ color: status.color, backgroundColor: status.bg }}
                                                >
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => openEditModal(item)} className="text-sm text-[var(--color-primary)] hover:underline">
                                                        แก้ไข
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id || item._id)} className="text-sm text-[var(--color-danger)] hover:underline">
                                                        ลบ
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {!loading && filteredIngredients.length === 0 && (
                        <div className="p-8 text-center text-[var(--color-text-muted)]">
                            ไม่พบรายการที่ค้นหา
                        </div>
                    )}
                </div>
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card !bg-white p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">{editingItem ? '✏️ แก้ไขวัตถุดิบ' : '🌿 เพิ่มวัตถุดิบใหม่'}</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium mb-1">ไอคอน (Emoji)</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-center text-xl"
                                    />
                                </div>
                                <div className="col-span-2 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">ชื่อ (TH)</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">ชื่อ (EN)</label>
                                        <input
                                            type="text"
                                            value={formData.nameEnglish}
                                            onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">ประเภท</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                    >
                                        <option>ผัก</option>
                                        <option>สมุนไพร</option>
                                        <option>ผลไม้</option>
                                        <option>โปรตีน</option>
                                        <option>ธัญพืช</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">จำนวนสต็อก (กรัม)</label>
                                    <input
                                        type="number"
                                        value={formData.inStock}
                                        onChange={(e) => setFormData({ ...formData, inStock: Number(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">ราคา/100กรัม</label>
                                    <input
                                        type="number"
                                        value={formData.pricePer100g}
                                        onChange={(e) => setFormData({ ...formData, pricePer100g: Number(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                    />
                                </div>
                            </div>

                            <div className="glass-card !bg-white p-4 border border-[var(--color-border)] space-y-3">
                                <h4 className="text-sm font-bold text-[var(--color-primary)]">ข้อมูลโภชนาการ (ต่อ 100 กรัม)</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    <div>
                                        <label className="block text-xs text-[var(--color-text-light)] mb-1">แคลอรี่</label>
                                        <input
                                            type="number"
                                            value={formData.calories100g}
                                            onChange={(e) => setFormData({ ...formData, calories100g: Number(e.target.value) })}
                                            className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-sm text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[var(--color-text-light)] mb-1">โปรตีน (g)</label>
                                        <input
                                            type="number"
                                            value={formData.protein100g}
                                            onChange={(e) => setFormData({ ...formData, protein100g: Number(e.target.value) })}
                                            className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-sm text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[var(--color-text-light)] mb-1">คาร์บ (g)</label>
                                        <input
                                            type="number"
                                            value={formData.carbs100g}
                                            onChange={(e) => setFormData({ ...formData, carbs100g: Number(e.target.value) })}
                                            className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-sm text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[var(--color-text-light)] mb-1">ไขมัน (g)</label>
                                        <input
                                            type="number"
                                            value={formData.fat100g}
                                            onChange={(e) => setFormData({ ...formData, fat100g: Number(e.target.value) })}
                                            className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] text-sm text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">ชุมชนผู้ผลิต / แหล่งที่มา</label>
                                    <select
                                        value={formData.community}
                                        onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                    >
                                        <option value="ทั่วไป">ทั่วไป</option>
                                        {communities.map((c: any) => (
                                            <option key={c.id || c._id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingCommunity(null);
                                        setCommunityFormData({ name: '', address: '', note: '' });
                                        setShowCommunityModal(true);
                                    }}
                                    className="btn-outline !px-4 !py-2 text-sm whitespace-nowrap"
                                >
                                    + เพิ่ม
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">โน้ต / หมายเหตุ</label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="เช่น ของมีน้อย, กำลังขาดตลาด..."
                                    className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm h-20"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn-outline flex-1 justify-center !py-2.5"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary flex-1 justify-center !py-2.5"
                            >
                                {editingItem ? 'บันทึก' : 'เพิ่ม ✓'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Community Modal */}
            {showCommunityModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-fade-in">
                    <div className="glass-card !bg-white p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">{editingCommunity ? '✏️ แก้ไขชุมชนผู้ผลิต' : '🏡 เพิ่มชุมชนผู้ผลิต'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">ชื่อชุมชน</label>
                                <input
                                    type="text"
                                    value={communityFormData.name}
                                    onChange={(e) => setCommunityFormData({ ...communityFormData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ที่อยู่ (ตัวเลือก)</label>
                                <textarea
                                    value={communityFormData.address}
                                    onChange={(e) => setCommunityFormData({ ...communityFormData, address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm h-16"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">โน้ต / หมายเหตุ (ตัวเลือก)</label>
                                <textarea
                                    value={communityFormData.note}
                                    onChange={(e) => setCommunityFormData({ ...communityFormData, note: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm h-16"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCommunityModal(false)}
                                className="btn-outline flex-1 justify-center !py-2.5"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSaveCommunity}
                                className="btn-primary flex-1 justify-center !py-2.5"
                            >
                                บันทึก ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
