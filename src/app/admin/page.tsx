'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [topups, setTopups] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, topupsRes, usersRes] = await Promise.all([
                    fetch('/api/admin/orders'),
                    fetch('/api/admin/topup'),
                    fetch('/api/admin/users'),
                ]);
                const ordersJson = await ordersRes.json();
                const topupsJson = await topupsRes.json();

                if (ordersJson.success) setOrders(ordersJson.data);
                if (topupsJson.success) setTopups(topupsJson.data);

                // Users endpoint may not exist yet — handle gracefully
                if (usersRes.ok) {
                    const usersJson = await usersRes.json();
                    if (usersJson.success) setUsers(usersJson.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalOrders = orders.length;
    const orderRevenue = orders.filter(o => o.status !== 'ยกเลิก').reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalWalletBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
    const totalRevenue = orderRevenue + totalWalletBalance;
    const pendingOrders = orders.filter(
        (o) => ['รอยืนยันการชำระเงิน', 'รออนุมัติ', 'รอจัดส่ง', 'กำลังขนส่ง'].includes(o.status)
    ).length;
    const totalMembers = users.length;

    const stats = [
        {
            icon: '📦',
            label: 'ออเดอร์ทั้งหมด',
            value: totalOrders,
            sub: `${pendingOrders} รอดำเนินการ`,
            color: 'var(--color-primary)',
            bg: 'var(--color-primary)',
        },
        {
            icon: '💰',
            label: 'รายได้รวม',
            value: `฿${totalRevenue.toLocaleString()}`,
            sub: totalOrders > 0 ? `เฉลี่ย ฿${Math.round(orderRevenue / totalOrders)}/ออเดอร์` : '-',
            color: 'var(--color-secondary)',
            bg: 'var(--color-secondary)',
        },
        {
            icon: '👥',
            label: 'สมาชิกทั้งหมด',
            value: totalMembers,
            sub: `ข้อมูลจากระบบ`,
            color: 'var(--color-accent)',
            bg: 'var(--color-accent)',
        },
        {
            icon: '💸',
            label: 'เงินใน Wallet รวม',
            value: `฿${totalWalletBalance.toLocaleString()}`,
            sub: `${topups.filter(t => t.status === 'pending').length} รายการเติมเงินใหม่`,
            color: 'var(--color-primary-light)',
            bg: 'var(--color-primary-light)',
        },
    ];

    const recentOrders = orders.slice(0, 5);

    const statusColor = (status: string) => {
        if (status === 'จัดส่งสำเร็จ') return 'bg-green-100 text-green-700';
        if (status === 'กำลังขนส่ง') return 'bg-yellow-100 text-yellow-600';
        if (status === 'รอยืนยันการชำระเงิน') return 'bg-orange-100 text-orange-700';
        if (status === 'รออนุมัติ') return 'bg-purple-100 text-purple-600';
        if (status === 'รอจัดส่ง') return 'bg-blue-100 text-blue-600';
        if (status === 'ยกเลิก') return 'bg-red-100 text-red-600';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient mb-2">
                                🏠 แดชบอร์ดชุมชน
                            </h1>
                            <p className="text-[var(--color-text-light)]">
                                ภาพรวมระบบ Ayura สำหรับผู้ดูแลและชุมชนผู้ผลิต
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/admin/inventory" className="btn-outline !py-2 !px-4 text-sm">
                                จัดการสต็อก 📋
                            </Link>
                            <Link href="/admin/recipes" className="btn-outline !py-2 !px-4 text-sm">
                                จัดการสูตรอาหาร 🥗
                            </Link>
                            <Link href="/admin/mealsets" className="btn-outline !py-2 !px-4 text-sm">
                                จัดการเซ็ต 🍱
                            </Link>
                            <Link href="/admin/orders" className="btn-primary !py-2 !px-4 text-sm">
                                ดูออเดอร์ 📦
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="glass-card p-5 hover-lift animate-fade-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-3xl">{stat.icon}</span>
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                    style={{ backgroundColor: stat.bg }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-2xl font-bold" style={{ color: stat.color }}>
                                {loading ? '...' : stat.value}
                            </div>
                            <div className="text-sm text-[var(--color-text-light)]">{stat.label}</div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-1">{loading ? '' : stat.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="glass-card p-6 animate-fade-in delay-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                📦 ออเดอร์ล่าสุด
                            </h3>
                            <Link href="/admin/orders" className="text-sm text-[var(--color-primary)] hover:underline">
                                ดูทั้งหมด →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-center py-4 text-sm text-[var(--color-text-muted)]">กำลังโหลด...</div>
                            ) : recentOrders.length === 0 ? (
                                <div className="text-center py-4 text-sm text-[var(--color-text-muted)]">ยังไม่มีออเดอร์</div>
                            ) : recentOrders.map((order) => (
                                <div
                                    key={order.id || order._id}
                                    className="flex items-center justify-between p-4 bg-[var(--color-bg)] rounded-xl hover:bg-[var(--color-bg-section)] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold">
                                            {order.customerName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{order.customerName}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">{order.id || order._id}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-[var(--color-primary)]">
                                            ฿{order.totalPrice?.toLocaleString()}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Topups */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 animate-fade-in delay-300">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                💸 เติมเงินล่าสุด
                            </h3>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-4 text-sm text-[var(--color-text-muted)]">กำลังโหลด...</div>
                                ) : topups.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-[var(--color-text-muted)]">ยังไม่มีรายการเติมเงิน</div>
                                ) : topups.slice(0, 5).map((t) => (
                                    <div key={t._id} className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl">
                                        <div>
                                            <div className="text-sm font-medium">{t.userName || t.userId}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">
                                                {new Date(t.createdAt).toLocaleString('th-TH')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-[var(--color-primary)]">฿{t.amount?.toLocaleString()}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'approved' ? 'bg-green-100 text-green-700' : t.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {t.status === 'approved' ? '✅' : t.status === 'rejected' ? '❌' : '⏳'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Revenue Breakdown */}
                        <div className="glass-card p-6 animate-fade-in delay-400">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                📊 สรุปรายได้
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <span>📦</span>
                                        <span className="text-sm">รายได้จากออเดอร์</span>
                                    </div>
                                    <span className="text-sm font-bold text-[var(--color-primary)]">฿{orderRevenue.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <span>💸</span>
                                        <span className="text-sm">เงินคงเหลือใน Wallet</span>
                                    </div>
                                    <span className="text-sm font-bold text-purple-600">฿{totalWalletBalance.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <span>💰</span>
                                        <span className="text-sm font-bold">รวมทั้งหมด</span>
                                    </div>
                                    <span className="text-lg font-bold text-[var(--color-secondary)]">฿{totalRevenue.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
