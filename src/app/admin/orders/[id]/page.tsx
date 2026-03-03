'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminAuthToken, createAuthHeaders } from '@/lib/authHelpers';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = getAdminAuthToken();
                const headers = createAuthHeaders(token);

                // Fetch all orders and find the specific one
                const res = await fetch('/api/admin/orders', { headers });
                const json = await res.json();
                
                if (json.success) {
                    const foundOrder = json.data.find((o: any) => o.id === orderId || o._id === orderId);
                    setOrder(foundOrder || null);
                }
            } catch (err) {
                // Silently handle order fetch error
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    const updateOrderStatus = async (newStatus: string) => {
        try {
            const token = getAdminAuthToken();
            const headers = createAuthHeaders(token);

            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status: newStatus })
            });
            
            if (res.ok) {
                setOrder({ ...order, status: newStatus });
            }
        } catch (err) {
            // Silently handle status update error
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-8">กำลังโหลด...</div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-8">ไม่พบออเดอร์</div>
                    <button onClick={() => router.back()} className="btn-primary">
                        กลับไปหน้าออเดอร์
                    </button>
                </div>
            </div>
        );
    }

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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => router.back()} className="text-[var(--color-primary)] hover:underline mb-4">
                        ← กลับไปหน้าออเดอร์
                    </button>
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        📦 รายละเอียดออเดอร์
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">{order.id || order._id}</span>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Order Info */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">ข้อมูลลูกค้า</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">ชื่อลูกค้า</p>
                            <p className="font-medium">{order.customerName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">เบอร์โทร</p>
                            <p className="font-medium">{order.phone || '-'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-[var(--color-text-light)]">ที่อยู่</p>
                            <p className="font-medium">{order.address}</p>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">รายละเอียดออเดอร์</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">เซ็ตอาหาร</p>
                            <p className="font-medium">{order.mealSetName || order.mealSetId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">ขนาดกล่อง</p>
                            <p className="font-medium">ไซส์ {order.boxSize || 'M'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">ระยะเวลา</p>
                            <p className="font-medium">{order.plan === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">วิธีชำระ</p>
                            <p className="font-medium">{order.paymentMethod === 'PROMPTPAY' ? 'PromptPay' : 'Wallet'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">ราคา</p>
                            <p className="font-bold text-[var(--color-primary)]">฿{order.totalPrice?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">วันที่สั่งซื้อ</p>
                            <p className="font-medium">{new Date(order.createdAt).toLocaleString('th-TH')}</p>
                        </div>
                    </div>
                </div>

                {/* Box Contents */}
                {order.boxContents && order.boxContents.length > 0 && (
                    <div className="glass-card p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">🥗 ของในกล่อง</h2>
                        <div className="space-y-2">
                            {order.boxContents.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{item.image}</span>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-[var(--color-text-muted)]">
                                        {item.totalGrams > 0 ? `${item.totalGrams} กรัม` : '-'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">จัดการออเดอร์</h2>
                    <div className="flex gap-3">
                        {order.status === 'รอยืนยันการชำระเงิน' && (
                            <button onClick={() => updateOrderStatus('รออนุมัติ')} className="btn-primary">
                                ✅ ยืนยันรับเงิน
                            </button>
                        )}
                        {order.status === 'รออนุมัติ' && (
                            <button onClick={() => updateOrderStatus('รอจัดส่ง')} className="btn-primary">
                                ✅ อนุมัติออเดอร์
                            </button>
                        )}
                        {order.status === 'รอจัดส่ง' && (
                            <button onClick={() => updateOrderStatus('กำลังขนส่ง')} className="btn-primary">
                                🚛 จัดส่งสินค้า
                            </button>
                        )}
                        {order.status === 'กำลังขนส่ง' && (
                            <button onClick={() => updateOrderStatus('จัดส่งสำเร็จ')} className="btn-primary">
                                🏁 ส่งสำเร็จ
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
