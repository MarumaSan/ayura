'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
const ingredients = [
    { id: 'i1', name: 'อกไก่ออร์แกนิก', nameEn: 'Organic Chicken Breast', category: 'โปรตีน', image: '🍗', community: 'สหกรณ์การเกษตรดอยคำ', inStock: 150, unit: 'ชิ้น', pricePerUnit: 189 },
    { id: 'i2', name: 'ผักเชียงดา', nameEn: 'Gymnema', category: 'ผัก', image: '🥬', community: 'ฟาร์มตัวอย่างหุบกะพง', inStock: 120, unit: 'กำ', pricePerUnit: 85 },
    { id: 'i3', name: 'ขิงสด', nameEn: 'Ginger', category: 'สมุนไพร', image: '🫚', community: 'ศูนย์ศิลปาชีพบางไทร', inStock: 200, unit: 'กิโลกรัม', pricePerUnit: 55 },
    { id: 'i4', name: 'ใบเตย', nameEn: 'Pandan', category: 'สมุนไพร', image: '🍃', community: 'กลุ่มวิสาหกิจชุมชนแม่กลอง', inStock: 180, unit: 'กำ', pricePerUnit: 35 },
    { id: 'i5', name: 'ข้าวกล้อง', nameEn: 'Brown Rice', category: 'ธัญพืช', image: '🌾', community: 'ทุ่งกุลาร้องไห้', inStock: 300, unit: 'กก.', pricePerUnit: 145 },
];
const statusFilters = ['ทั้งหมด', 'รออนุมัติ', 'รอจัดส่ง', 'กำลังจัดเตรียม', 'จัดส่งแล้ว', 'จัดส่งสำเร็จ'];

export default function OrdersPage() {
    const [selectedStatus, setSelectedStatus] = useState('ทั้งหมด');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/admin/orders');
                const json = await res.json();
                if (json.success) {
                    setOrders(json.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const filteredOrders =
        selectedStatus === 'ทั้งหมด'
            ? orders
            : orders.filter((o) => o.status === selectedStatus);

    const totalBoxes = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    // Calculate ingredients needed for pending orders
    const pendingOrders = orders.filter(
        (o) => o.status === 'รอจัดส่ง' || o.status === 'กำลังจัดเตรียม'
    );
    const ingredientNeeded: Record<string, { name: string; count: number; image: string }> = {};
    pendingOrders.forEach((order) => {
        (order.box?.items || []).map((item: any) => item.ingredient).filter(Boolean).forEach((item: any) => {
            if (ingredientNeeded[item.id]) {
                ingredientNeeded[item.id].count++;
            } else {
                ingredientNeeded[item.id] = { name: item.name, count: 1, image: item.image };
            }
        });
    });

    // Zero waste calculation
    const totalStockUsed = pendingOrders.reduce(
        (sum: number, o: any) => sum + (o.box?.items || []).map((item: any) => item.ingredient).filter(Boolean).length,
        0
    );
    const totalStock = ingredients.reduce((sum: number, i: any) => sum + i.inStock, 0);
    const usageRate = Math.round((totalStockUsed / totalStock) * 100);

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
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        📦 จัดการคำสั่งซื้อ
                    </h1>
                    <p className="text-[var(--color-text-light)]">
                        สรุปยอดและจัดการออเดอร์รายสัปดาห์
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="glass-card p-5 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl text-white">
                                📦
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[var(--color-primary)]">{totalBoxes}</div>
                                <div className="text-sm text-[var(--color-text-light)]">กล่องทั้งหมดสัปดาห์นี้</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5 animate-fade-in delay-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center text-2xl text-white">
                                💰
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[var(--color-secondary)]">
                                    ฿{totalRevenue.toLocaleString()}
                                </div>
                                <div className="text-sm text-[var(--color-text-light)]">รายได้รวม</div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-5 animate-fade-in delay-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[var(--color-success)] flex items-center justify-center text-2xl text-white">
                                ♻️
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[var(--color-success)]">92%</div>
                                <div className="text-sm text-[var(--color-text-light)]">Zero Waste Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Orders Table */}
                    <div className="lg:col-span-2">
                        {/* Filter Tabs */}
                        <div className="flex gap-2 mb-4 flex-wrap animate-fade-in delay-200">
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
                        <div className="space-y-3 animate-fade-in delay-300">
                            {loading ? (
                                <div className="text-center py-8 text-[var(--color-text-light)]">กำลังโหลดข้อมูล...</div>
                            ) : filteredOrders.map((order) => (
                                <div key={order.id} className="glass-card p-5 hover-lift transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-[var(--color-primary)]">
                                                    {order.id}
                                                </span>
                                                <span
                                                    className={`text-xs px-3 py-1 rounded-full font-medium ${order.status === 'สำเร็จ'
                                                        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                                                        : order.status === 'จัดส่งแล้ว'
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : order.status === 'กำลังจัดเตรียม'
                                                                ? 'bg-yellow-100 text-yellow-600'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="text-sm mt-1">{order.customerName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-[var(--color-primary)]">
                                                ฿{order.totalPrice}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)]">
                                                {order.plan === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        {(order.box?.items || []).map((item: any) => item.ingredient).filter(Boolean).map((item: any) => (
                                            <div
                                                key={item.id}
                                                className="w-8 h-8 rounded-lg bg-[var(--color-bg-section)] flex items-center justify-center text-lg"
                                                title={item.name}
                                            >
                                                {item.image}
                                            </div>
                                        ))}
                                        <span className="text-xs text-[var(--color-text-muted)] ml-1">
                                            {(order.box?.items || []).map((item: any) => item.ingredient).filter(Boolean).length} ชิ้น
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mt-2">
                                        <span>📍 {order.address?.slice(0, 40) || 'ไม่ระบุ'}...</span>
                                        <span>📅 {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-[var(--color-border)]">
                                        <div className="text-xs text-[var(--color-text-light)]">อัปเดตสถานะ:</div>
                                        {order.status === 'รออนุมัติ' && (
                                            <button onClick={() => updateOrderStatus(order.id, 'รอจัดส่ง')} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
                                                ✅ อนุมัติออเดอร์ (รอจัดส่ง)
                                            </button>
                                        )}
                                        {order.status === 'รอจัดส่ง' && (
                                            <button onClick={() => updateOrderStatus(order.id, 'กำลังจัดเตรียม')} className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition-colors">
                                                📦 กำลังจัดเตรียม
                                            </button>
                                        )}
                                        {order.status === 'กำลังจัดเตรียม' && (
                                            <button onClick={() => updateOrderStatus(order.id, 'จัดส่งแล้ว')} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">
                                                🚚 จัดส่งแล้ว
                                            </button>
                                        )}
                                        {order.status === 'จัดส่งแล้ว' && (
                                            <button onClick={() => updateOrderStatus(order.id, 'จัดส่งสำเร็จ')} className="text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-success)]/20 transition-colors">
                                                🏁 จัดส่งสำเร็จ
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Preparation Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Ingredients to Prepare */}
                        <div className="glass-card p-6 animate-fade-in delay-300">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                🥬 วัตถุดิบที่ต้องเตรียม
                            </h3>
                            <p className="text-xs text-[var(--color-text-muted)] mb-4">
                                สำหรับออเดอร์ที่รอจัดส่งและกำลังจัดเตรียม ({pendingOrders.length} ออเดอร์)
                            </p>
                            <div className="space-y-2">
                                {Object.values(ingredientNeeded).map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{item.image}</span>
                                            <span className="text-sm">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-[var(--color-primary)]">
                                            x{item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Zero Waste Indicator */}
                        <div className="glass-card p-6 animate-fade-in delay-400">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                ♻️ Zero Waste Monitor
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-[var(--color-text-light)]">อัตราการใช้วัตถุดิบ</span>
                                        <span className="font-bold text-[var(--color-success)]">92%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[var(--color-success)] rounded-full transition-all duration-1000"
                                            style={{ width: '92%' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-[var(--color-text-light)]">ส่งมอบตรงเวลา</span>
                                        <span className="font-bold text-[var(--color-primary)]">88%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full gradient-primary rounded-full transition-all duration-1000"
                                            style={{ width: '88%' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-[var(--color-text-light)]">ความพึงพอใจ</span>
                                        <span className="font-bold text-[var(--color-secondary)]">95%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full gradient-gold rounded-full transition-all duration-1000"
                                            style={{ width: '95%' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-[var(--color-success)]/10 rounded-xl">
                                <p className="text-xs text-[var(--color-success)] leading-relaxed">
                                    🌱 สัปดาห์นี้ใช้วัตถุดิบอย่างมีประสิทธิภาพ
                                    ลดการสูญเสียได้ดีกว่าเป้าหมาย!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
