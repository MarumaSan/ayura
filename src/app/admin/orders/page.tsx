'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const statusFilters = ['ทั้งหมด', 'รอยืนยันการชำระเงิน', 'รออนุมัติ', 'รอจัดส่ง', 'กำลังขนส่ง', 'จัดส่งสำเร็จ'];

export default function OrdersPage() {
    const [selectedStatus, setSelectedStatus] = useState('ทั้งหมด');
    const [orders, setOrders] = useState<any[]>([]);
    const [topupRequests, setTopupRequests] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'topups'>('orders');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [showRevenueBreakdown, setShowRevenueBreakdown] = useState(false);

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
                const usersJson = await usersRes.json();

                if (ordersJson.success) setOrders(ordersJson.data);
                if (topupsJson.success) setTopupRequests(topupsJson.data);
                if (usersJson.success) setUsers(usersJson.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === orderId || o._id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const processTopup = async (topupId: string, action: 'approve' | 'reject') => {
        try {
            const res = await fetch(`/api/admin/topup/${topupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                setTopupRequests(topupRequests.map(t => t._id === topupId ? { ...t, status: action === 'approve' ? 'approved' : 'rejected' } : t));
            }
        } catch (err) {
            console.error('Failed to process topup', err);
        }
    };

    const filteredOrders =
        selectedStatus === 'ทั้งหมด'
            ? orders
            : orders.filter((o) => o.status === selectedStatus);

    // Revenue calculations
    const orderRevenue = orders
        .filter(o => o.status !== 'ยกเลิก')
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalWalletBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
    const totalRevenue = orderRevenue + totalWalletBalance;

    const pendingPaymentCount = orders.filter(o => o.status === 'รอยืนยันการชำระเงิน').length;
    const pendingTopupCount = topupRequests.filter(t => t.status === 'pending').length;

    const statusColor = (status: string) => {
        if (status === 'จัดส่งสำเร็จ') return 'bg-green-100 text-green-700';
        if (status === 'กำลังขนส่ง') return 'bg-yellow-100 text-yellow-600';
        if (status === 'รอยืนยันการชำระเงิน') return 'bg-orange-100 text-orange-700';
        if (status === 'รออนุมัติ') return 'bg-purple-100 text-purple-600';
        if (status === 'รอจัดส่ง') return 'bg-blue-100 text-blue-600';
        if (status === 'ยกเลิก') return 'bg-red-100 text-red-600';
        return 'bg-gray-100 text-gray-600';
    };

    const planLabel = (plan: string) => plan === 'weekly' ? 'รายสัปดาห์ (7 วัน)' : 'รายเดือน (30 วัน)';

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
                        <span>คำสั่งซื้อ</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient mb-2">
                                📦 จัดการคำสั่งซื้อ
                            </h1>
                            <p className="text-[var(--color-text-light)]">
                                ยืนยันการชำระเงินและจัดการออเดอร์
                            </p>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/admin/recipes" className="btn-outline !py-2 !px-4 text-sm">
                                จัดการสูตรอาหาร 🥗
                            </Link>
                            <Link href="/admin/mealsets" className="btn-outline !py-2 !px-4 text-sm">
                                จัดการเซ็ต 🍱
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card p-5 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl text-white">📦</div>
                            <div>
                                <div className="text-2xl font-bold text-[var(--color-primary)]">{orders.length}</div>
                                <div className="text-sm text-[var(--color-text-light)]">ออเดอร์ทั้งหมด</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5 animate-fade-in delay-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl text-white">⏳</div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">{pendingPaymentCount}</div>
                                <div className="text-sm text-[var(--color-text-light)]">รอยืนยันการชำระ</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5 animate-fade-in delay-150">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-2xl text-white">💸</div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{pendingTopupCount}</div>
                                <div className="text-sm text-[var(--color-text-light)]">รอยืนยันเติมเงิน</div>
                            </div>
                        </div>
                    </div>
                    {/* Revenue Card with Breakdown */}
                    <div
                        className="glass-card p-5 animate-fade-in delay-200 cursor-pointer hover:shadow-lg transition-shadow relative"
                        onClick={() => setShowRevenueBreakdown(!showRevenueBreakdown)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center text-2xl text-white">💰</div>
                            <div>
                                <div className="text-2xl font-bold text-[var(--color-secondary)]">฿{totalRevenue.toLocaleString()}</div>
                                <div className="text-sm text-[var(--color-text-light)]">รายได้รวม <span className="text-xs">🔽</span></div>
                            </div>
                        </div>
                        {showRevenueBreakdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-[var(--color-border)] p-4 animate-fade-in">
                                <h4 className="text-sm font-bold mb-3 text-[var(--color-text)]">💰 รายละเอียดรายได้</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[var(--color-text-light)]">📦 รายได้จากออเดอร์</span>
                                        <span className="font-bold text-[var(--color-primary)]">฿{orderRevenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[var(--color-text-light)]">💸 เงินคงเหลือใน Wallet</span>
                                        <span className="font-bold text-purple-600">฿{totalWalletBalance.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-[var(--color-border)] pt-2 mt-2 flex items-center justify-between text-sm font-bold">
                                        <span>รวมทั้งหมด</span>
                                        <span className="text-[var(--color-secondary)]">฿{totalRevenue.toLocaleString()}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">* รายได้รวม = เงินที่ซื้อออเดอร์แล้ว + เงินที่ยังเหลืออยู่ในวอลเลทของผู้ใช้ทุกคน</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Switch */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'orders' ? 'gradient-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-primary)]/30'}`}
                    >
                        📦 คำสั่งซื้อ
                        {pendingPaymentCount > 0 && <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingPaymentCount}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('topups')}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'topups' ? 'gradient-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-primary)]/30'}`}
                    >
                        💸 เติมเงิน Wallet
                        {pendingTopupCount > 0 && <span className="ml-2 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingTopupCount}</span>}
                    </button>
                </div>

                {activeTab === 'orders' && (
                    <>
                        {/* Filter Tabs */}
                        <div className="flex gap-2 mb-4 flex-wrap animate-fade-in">
                            {statusFilters.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedStatus === status
                                        ? 'gradient-primary text-white shadow-md'
                                        : 'bg-white border border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-primary)]/30'
                                        }`}
                                >
                                    {status}
                                    {status !== 'ทั้งหมด' && (
                                        <span className="ml-1 text-xs opacity-70">
                                            ({orders.filter((o) => o.status === status).length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Orders List */}
                        <div className="space-y-3 animate-fade-in">
                            {loading ? (
                                <div className="text-center py-8 text-[var(--color-text-light)]">กำลังโหลดข้อมูล...</div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="glass-card p-8 text-center text-[var(--color-text-muted)]">ไม่มีออเดอร์ในสถานะนี้</div>
                            ) : filteredOrders.map((order) => {
                                const isExpanded = expandedOrder === (order.id || order._id);
                                return (
                                    <div key={order.id || order._id} className="glass-card overflow-hidden hover-lift transition-all">
                                        {/* Order Header — always visible */}
                                        <div
                                            className="p-5 cursor-pointer"
                                            onClick={() => setExpandedOrder(isExpanded ? null : (order.id || order._id))}
                                        >
                                            <div className="flex items-center justify-between gap-6">
                                                {/* Left: Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                                        <span className="text-sm font-bold text-[var(--color-primary)]">
                                                            {order.id || order._id}
                                                        </span>
                                                        <span className={`text-[10px] px-3 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full">
                                                            {order.paymentMethod === 'PROMPTPAY' ? '📱 PromptPay' : '💰 Wallet'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm font-bold truncate text-gray-700">{order.customerName}</div>
                                                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-3">
                                                        <span className="truncate max-w-[200px]">📍 {order.address || 'ไม่ระบุ'}</span>
                                                        {order.phone && <span>📞 {order.phone}</span>}
                                                    </div>
                                                </div>

                                                {/* Middle: Price and Date Stack */}
                                                <div className="text-right flex flex-col items-end gap-1 min-w-[120px]">
                                                    <div className="text-xl font-bold text-[var(--color-primary)] leading-none">
                                                        ฿{order.totalPrice?.toLocaleString()}
                                                    </div>
                                                    <div className="text-[10px] font-medium text-gray-500">
                                                        📅 วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleDateString('th-TH')}
                                                    </div>
                                                    <div className="text-[9px] text-gray-400 leading-none">
                                                        {planLabel(order.plan)}
                                                    </div>
                                                    {order.targetDeliveryDate && !['จัดส่งสำเร็จ', 'ยกเลิก'].includes(order.status) && (
                                                        <div className="mt-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold border border-red-200 shadow-sm animate-pulse-slow">
                                                            ⚠️ สั่งล่วงหน้า: ส่งภายใน {new Date(order.targetDeliveryDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right: Action Section (No background container) */}
                                                <div
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="min-w-[120px] flex items-center justify-end"
                                                >
                                                    {order.status === 'รอยืนยันการชำระเงิน' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id || order._id, 'รออนุมัติ')}
                                                            className="text-xs font-bold py-2.5 px-4 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 transition-all flex items-center gap-1"
                                                        >
                                                            <span>✅</span> ยืนยันรับเงิน
                                                        </button>
                                                    )}
                                                    {order.status === 'รออนุมัติ' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id || order._id, 'รอจัดส่ง')}
                                                            className="text-xs font-bold py-2.5 px-4 rounded-xl bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition-all flex items-center gap-1"
                                                        >
                                                            <span>✅</span> อนุมัติออเดอร์
                                                        </button>
                                                    )}
                                                    {order.status === 'รอจัดส่ง' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id || order._id, 'กำลังขนส่ง')}
                                                            className="text-xs font-bold py-2.5 px-4 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-100 hover:bg-yellow-100 transition-all flex items-center gap-1"
                                                        >
                                                            <span>🚛</span> จัดส่งสินค้า
                                                        </button>
                                                    )}
                                                    {order.status === 'กำลังขนส่ง' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id || order._id, 'จัดส่งสำเร็จ')}
                                                            className="text-xs font-bold py-2.5 px-4 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-1"
                                                        >
                                                            <span>🏁</span> ส่งสำเร็จ
                                                        </button>
                                                    )}
                                                    {order.status === 'จัดส่งสำเร็จ' && (
                                                        <div className="px-4 py-2 rounded-xl bg-green-50 text-green-600 border border-green-100 text-[10px] font-bold flex items-center gap-1">
                                                            <span>✅</span> สำเร็จแล้ว
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expand Button / Toggle (Arrows only) */}
                                            <div className="flex justify-end mt-1">
                                                <button className="text-[12px] text-[var(--color-primary)] opacity-50 hover:opacity-100 transition-opacity">
                                                    {isExpanded ? '▲' : '▼'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Order Details — expanded */}
                                        {isExpanded && (
                                            <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-section)]/50 p-5 animate-fade-in">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    {/* Info Column */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-bold text-[var(--color-primary)] mb-2">📋 ข้อมูลการจัดส่ง</h4>
                                                        <div className="bg-white rounded-xl p-3 text-sm space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-[var(--color-text-light)]">📍 ที่อยู่</span>
                                                                <span className="text-right max-w-[60%]">{order.address || 'ไม่ระบุ'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-[var(--color-text-light)]">📞 เบอร์โทร</span>
                                                                <span>{order.phone || 'ไม่ระบุ'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-[var(--color-text-light)]">📦 เซ็ต</span>
                                                                <span className="font-medium">{order.mealSetName || order.mealSetId}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-[var(--color-text-light)]">📐 ขนาด</span>
                                                                <span className="font-medium">ไซส์ {order.boxSize || 'M'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-[var(--color-text-light)]">📅 ระยะเวลา</span>
                                                                <span>{planLabel(order.plan)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-[var(--color-text-light)]">💰 ราคา</span>
                                                                <span className="font-bold text-[var(--color-primary)]">฿{order.totalPrice?.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Box Contents Column */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-bold text-[var(--color-primary)] mb-2">🥗 ของในกล่อง</h4>
                                                        {order.boxContents && order.boxContents.length > 0 ? (
                                                            <div className="bg-white rounded-xl p-3">
                                                                <div className="space-y-2">
                                                                    {order.boxContents.map((item: any, idx: number) => (
                                                                        <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-lg">{item.image}</span>
                                                                                <span>{item.name}</span>
                                                                            </div>
                                                                            <span className="text-[var(--color-text-muted)] font-mono text-xs">
                                                                                {item.totalGrams > 0 ? `${item.totalGrams} กรัม` : '-'}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white rounded-xl p-4 text-sm text-[var(--color-text-muted)] text-center">
                                                                ไม่มีข้อมูลของในกล่อง
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {activeTab === 'topups' && (
                    <div className="space-y-3 animate-fade-in">
                        <p className="text-sm text-[var(--color-text-muted)] mb-4">
                            รายการคำขอเติมเงินที่รอการยืนยัน — ตรวจสอบสลิปโอนเงินจาก PromptPay แล้วกดยืนยัน
                        </p>
                        {loading ? (
                            <div className="text-center py-8 text-[var(--color-text-light)]">กำลังโหลดข้อมูล...</div>
                        ) : topupRequests.length === 0 ? (
                            <div className="glass-card p-8 text-center text-[var(--color-text-muted)]">ไม่มีรายการเติมเงินที่รอยืนยัน</div>
                        ) : topupRequests.map((req) => (
                            <div key={req._id} className="glass-card p-5 hover-lift transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-sm font-bold">{req.userName || req.userId}</span>
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {req.status === 'approved' ? '✅ อนุมัติแล้ว' : req.status === 'rejected' ? '❌ ปฏิเสธแล้ว' : '⏳ รอยืนยัน'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(req.createdAt).toLocaleString('th-TH')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-[var(--color-primary)]">฿{req.amount?.toLocaleString()}</div>
                                    </div>
                                </div>

                                {req.status === 'pending' && (
                                    <div className="flex gap-3 mt-4 pt-3 border-t border-[var(--color-border)]">
                                        <button
                                            onClick={() => processTopup(req._id, 'approve')}
                                            className="flex-1 py-2.5 bg-green-100 text-green-700 rounded-xl text-sm font-bold hover:bg-green-200 transition-colors"
                                        >
                                            ✅ ยืนยันรับเงิน (เติม ฿{req.amount?.toLocaleString()} ให้ {req.userName})
                                        </button>
                                        <button
                                            onClick={() => processTopup(req._id, 'reject')}
                                            className="px-4 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors"
                                        >
                                            ❌ ปฏิเสธ
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
}
