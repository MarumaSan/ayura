'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ingredients } from '@/lib/mockData';
import { Ingredient } from '@/lib/types';

const categories = ['ทั้งหมด', 'ผัก', 'สมุนไพร', 'ผลไม้', 'โปรตีน', 'ธัญพืช'];

function getStockStatus(stock: number): { label: string; color: string; bg: string } {
    if (stock > 100) return { label: 'พร้อมส่ง', color: 'var(--color-success)', bg: 'rgba(16,185,129,0.1)' };
    if (stock > 50) return { label: 'ปกติ', color: 'var(--color-primary)', bg: 'rgba(45,106,79,0.1)' };
    if (stock > 0) return { label: 'ใกล้หมด', color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'หมด', color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.1)' };
}

export default function InventoryPage() {
    const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredIngredients = ingredients.filter((item) => {
        const matchCategory = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
        const matchSearch =
            item.name.includes(searchQuery) ||
            item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.community.includes(searchQuery);
        return matchCategory && matchSearch;
    });

    const totalStock = ingredients.reduce((sum, i) => sum + i.inStock, 0);
    const lowStockItems = ingredients.filter((i) => i.inStock < 80);

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
                                อัปเดตวัตถุดิบและสมุนไพรที่พร้อมจัดส่ง
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary !py-2 !px-4 text-sm"
                        >
                            + เพิ่มวัตถุดิบ
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-4 animate-fade-in">
                        <div className="text-sm text-[var(--color-text-light)]">รายการทั้งหมด</div>
                        <div className="text-2xl font-bold text-[var(--color-primary)]">{ingredients.length}</div>
                    </div>
                    <div className="glass-card p-4 animate-fade-in delay-100">
                        <div className="text-sm text-[var(--color-text-light)]">สต็อกรวม</div>
                        <div className="text-2xl font-bold text-[var(--color-primary)]">{totalStock}</div>
                    </div>
                    <div className="glass-card p-4 animate-fade-in delay-200">
                        <div className="text-sm text-[var(--color-text-light)]">ใกล้หมด</div>
                        <div className="text-2xl font-bold text-[var(--color-warning)]">{lowStockItems.length}</div>
                    </div>
                    <div className="glass-card p-4 animate-fade-in delay-300">
                        <div className="text-sm text-[var(--color-text-light)]">ชุมชนผู้ผลิต</div>
                        <div className="text-2xl font-bold text-[var(--color-secondary)]">4</div>
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
                                placeholder="🔍 ค้นหาวัตถุดิบ..."
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all text-sm"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {categories.map((cat) => (
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
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-[var(--color-text-light)]">
                                        วัตถุดิบ
                                    </th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        ประเภท
                                    </th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        ชุมชน
                                    </th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        คงเหลือ
                                    </th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--color-text-light)]">
                                        ราคา
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
                                {filteredIngredients.map((item, i) => {
                                    const status = getStockStatus(item.inStock);
                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-b border-[var(--color-border)] last:border-none hover:bg-[var(--color-bg-section)]/50 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-section)] flex items-center justify-center text-xl">
                                                        {item.image}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{item.name}</div>
                                                        <div className="text-xs text-[var(--color-text-muted)]">
                                                            {item.nameEn}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs px-2 py-1 bg-[var(--color-bg-section)] rounded-full">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm text-[var(--color-text-light)]">
                                                    {item.community}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-bold">
                                                    {item.inStock} {item.unit}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-medium text-[var(--color-primary)]">
                                                    ฿{item.pricePerUnit}
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
                                                    <button className="text-sm text-[var(--color-primary)] hover:underline">
                                                        แก้ไข
                                                    </button>
                                                    <button className="text-sm text-[var(--color-danger)] hover:underline">
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
                    {filteredIngredients.length === 0 && (
                        <div className="p-8 text-center text-[var(--color-text-muted)]">
                            ไม่พบรายการที่ค้นหา
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card !bg-white p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">🌿 เพิ่มวัตถุดิบใหม่</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">ชื่อวัตถุดิบ</label>
                                <input
                                    type="text"
                                    placeholder="เช่น ผักเชียงดา"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">ประเภท</label>
                                    <select className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm">
                                        <option>ผัก</option>
                                        <option>สมุนไพร</option>
                                        <option>ผลไม้</option>
                                        <option>โปรตีน</option>
                                        <option>ธัญพืช</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">จำนวน</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ชุมชนผู้ผลิต</label>
                                <select className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm">
                                    <option>ศูนย์ศิลปาชีพบางไทร</option>
                                    <option>ฟาร์มตัวอย่างหุบกะพง</option>
                                    <option>กลุ่มวิสาหกิจชุมชนแม่กลอง</option>
                                    <option>สหกรณ์การเกษตรดอยคำ</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="btn-outline flex-1 justify-center !py-2.5"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="btn-primary flex-1 justify-center !py-2.5"
                            >
                                เพิ่ม ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
