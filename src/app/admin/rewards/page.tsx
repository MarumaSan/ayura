'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminRewardsPage() {
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('active');

    useEffect(() => {
        fetchRedemptions();
    }, [status]);

    const fetchRedemptions = async () => {
        try {
            const res = await fetch(`/api/admin/redemptions?status=${status}`);
            if (res.ok) {
                const data = await res.json();
                setRedemptions(data.redemptions || []);
            }
        } catch (error) {
            // Silently handle fetch error
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (redemptionId: number, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/redemptions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ redemptionId, status: newStatus })
            });
            
            const data = await res.json();

            if (res.ok) {
                fetchRedemptions();
            } else {
                alert('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่ทราบสาเหตุ'));
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    const pendingCount = redemptions.filter(r => r.status === 'active').length;
    const deliveredCount = redemptions.filter(r => r.status === 'delivered').length;

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
                        <span>จัดการรางวัล</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient mb-2">
                                🎁 จัดการรางวัลที่แลกรับ
                            </h1>
                            <p className="text-[var(--color-text-light)]">
                                ตรวจสอบและจัดส่งรางวัลที่ผู้ใช้แลกแต้ม
                            </p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/admin/orders" className="btn-outline !py-2 !px-4 text-sm">
                                ดูออเดอร์ 📦
                            </Link>
                            <Link href="/admin/mealsets" className="btn-outline !py-2 !px-4 text-sm">
                                จัดการเซ็ต 🍱
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="glass-card p-5 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl text-white">🎁</div>
                            <div>
                                <div className="text-2xl font-bold text-[var(--color-primary)]">{redemptions.length}</div>
                                <div className="text-sm text-[var(--color-text-light)]">รางวัลทั้งหมด</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5 animate-fade-in delay-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl text-white">⏳</div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                                <div className="text-sm text-[var(--color-text-light)]">รอจัดส่ง</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5 animate-fade-in delay-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-2xl text-white">✅</div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{deliveredCount}</div>
                                <div className="text-sm text-[var(--color-text-light)]">จัดส่งแล้ว</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Switch */}
                <div className="flex gap-3 mb-6">
                    {['active', 'delivered', 'cancelled'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                status === s 
                                    ? 'bg-[var(--color-primary)] text-white shadow-md' 
                                    : 'bg-white text-[var(--color-text)] hover:bg-[var(--color-bg-section)]'
                            }`}
                        >
                            {s === 'active' && '🎁 รอจัดส่ง'}
                            {s === 'delivered' && '✅ จัดส่งแล้ว'}
                            {s === 'cancelled' && '❌ ยกเลิก'}
                        </button>
                    ))}
                </div>

                {/* Redemptions List */}
                <div className="glass-card p-6 animate-fade-in">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="text-4xl animate-spin-slow mb-4">🎁</div>
                            <p className="text-[var(--color-text-light)]">กำลังโหลด...</p>
                        </div>
                    ) : redemptions.length === 0 ? (
                        <div className="text-center py-8 text-[var(--color-text-muted)]">
                            <div className="text-4xl mb-4">📭</div>
                            <p>ไม่มีรายการ</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {redemptions.map((redemption) => (
                                <div 
                                    key={redemption.id} 
                                    className="p-4 bg-white rounded-xl border border-[var(--color-border)] hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">
                                                    {redemption.reward_name?.includes('น้ำผลไม้') ? '🧃' : 
                                                     redemption.reward_name?.includes('สมุนไพร') ? '🌿' : 
                                                     redemption.reward_name?.includes('กล่อง') ? '📦' : '🎁'}
                                                </span>
                                                <h3 className="font-bold text-lg">{redemption.reward_name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                    redemption.status === 'active' ? 'bg-orange-100 text-orange-600' :
                                                    redemption.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                    'bg-red-100 text-red-600'
                                                }`}>
                                                    {redemption.status === 'active' ? 'รอจัดส่ง' :
                                                     redemption.status === 'delivered' ? 'จัดส่งแล้ว' : 'ยกเลิก'}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-[var(--color-text-muted)]">ผู้ใช้:</span>
                                                    <span className="ml-1 font-medium">{redemption.users?.name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[var(--color-text-muted)]">อีเมล:</span>
                                                    <span className="ml-1">{redemption.users?.email}</span>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <span className="text-[var(--color-text-muted)]">ที่อยู่:</span>
                                                    <span className="ml-1">{redemption.delivery_address}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[var(--color-text-muted)]">โทร:</span>
                                                    <span className="ml-1">{redemption.delivery_phone}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[var(--color-text-muted)]">แลกเมื่อ:</span>
                                                    <span className="ml-1">{new Date(redemption.redeemed_at).toLocaleString('th-TH')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {status === 'active' && (
                                            <div className="flex sm:flex-col gap-2">
                                                <button
                                                    onClick={() => updateStatus(redemption.id, 'delivered')}
                                                    className="btn-primary !py-2 !px-4 text-sm flex items-center justify-center gap-1"
                                                >
                                                    <span>✅</span>
                                                    <span>จัดส่งแล้ว</span>
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(redemption.id, 'cancelled')}
                                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <span>❌</span>
                                                    <span>ยกเลิก</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
