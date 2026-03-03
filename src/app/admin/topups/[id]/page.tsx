'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminAuthToken, createAuthHeaders } from '@/lib/authHelpers';

export default function TopupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const topupId = params.id as string;
    
    const [topup, setTopup] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopup = async () => {
            try {
                const token = getAdminAuthToken();
                const headers = createAuthHeaders(token);

                const res = await fetch('/api/admin/topup', { headers });
                const json = await res.json();
                
                if (json.success) {
                    const foundTopup = json.data.find((t: any) => 
                        t._id == topupId || t.id == topupId
                    );
                    setTopup(foundTopup || null);
                }
            } catch (err) {
                // Silently handle fetch error
            } finally {
                setLoading(false);
            }
        };

        if (topupId) fetchTopup();
    }, [topupId]);

    const processTopup = async (action: 'approve' | 'reject') => {
        try {
            const token = getAdminAuthToken();
            const headers = createAuthHeaders(token);

            const res = await fetch(`/api/admin/topup/${topupId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ action })
            });
            
            if (res.ok) {
                setTopup({ ...topup, status: action === 'approve' ? 'approved' : 'rejected' });
            }
        } catch (err) {
            // Silently handle process error
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

    if (!topup) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-8">ไม่พบรายการเติมเงิน</div>
                    <button onClick={() => router.back()} className="btn-primary">
                        กลับไปหน้าแดชบอร์ด
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => router.back()} className="text-[var(--color-primary)] hover:underline mb-4">
                        ← กลับไปหน้าแดชบอร์ด
                    </button>
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        💸 รายละเอียดการเติมเงิน
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-bold">รหัสรายการ: {topup._id}</span>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                            topup.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            topup.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                            'bg-orange-100 text-orange-700'
                        }`}>
                            {topup.status === 'approved' ? '✅ อนุมัติแล้ว' : 
                             topup.status === 'rejected' ? '❌ ปฏิเสธแล้ว' : 
                             '⏳ รอยืนยัน'}
                        </span>
                    </div>
                </div>

                {/* Topup Info */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">ข้อมูลการเติมเงิน</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">ผู้ใช้</p>
                            <p className="font-medium">{topup.userName || topup.userId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">จำนวนเงิน</p>
                            <p className="font-bold text-[var(--color-primary)]">฿{topup.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">วันที่ขอเติม</p>
                            <p className="font-medium">{new Date(topup.createdAt).toLocaleString('th-TH')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-light)]">สถานะ</p>
                            <p className="font-medium">
                                {topup.status === 'approved' ? 'อนุมัติแล้ว' : 
                                 topup.status === 'rejected' ? 'ปฏิเสธแล้ว' : 
                                 'รอยืนยัน'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {topup.status === 'pending' && (
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">จัดการการเติมเงิน</h2>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                            <p className="text-sm text-yellow-800">
                                ⚠️ กรุณาตรวจสอบสลิปโอนเงิน PromptPay ก่อนอนุมัติการเติมเงิน
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => processTopup('approve')} 
                                className="btn-primary"
                            >
                                ✅ อนุมัติการเติมเงิน (฿{topup.amount?.toLocaleString()})
                            </button>
                            <button 
                                onClick={() => processTopup('reject')} 
                                className="btn-outline !border-red-300 !text-red-600 hover:!bg-red-50"
                            >
                                ❌ ปฏิเสธการเติมเงิน
                            </button>
                        </div>
                    </div>
                )}

                {/* Success/Rejected Message */}
                {topup.status !== 'pending' && (
                    <div className="glass-card p-6">
                        <div className={`text-center p-6 rounded-xl ${
                            topup.status === 'approved' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                            <div className="text-4xl mb-3">
                                {topup.status === 'approved' ? '✅' : '❌'}
                            </div>
                            <h3 className="text-lg font-bold mb-2">
                                {topup.status === 'approved' ? 'อนุมัติการเติมเงินแล้ว' : 'ปฏิเสธการเติมเงินแล้ว'}
                            </h3>
                            <p className="text-sm">
                                {topup.status === 'approved' 
                                    ? `เติมเงิน ฿${topup.amount?.toLocaleString()} ให้ ${topup.userName || topup.userId} เรียบร้อยแล้ว`
                                    : `ปฏิเสธการเติมเงิน ฿${topup.amount?.toLocaleString()} แล้ว`
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
