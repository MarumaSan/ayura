'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const howToEarn = [
    { icon: '📦', title: 'สั่งกล่องรายสัปดาห์', points: '+100', desc: 'ต่อกล่องที่สั่ง' },
    { icon: '📦', title: 'สั่งกล่องรายเดือน', points: '+500', desc: 'ต่อเดือนที่สั่ง' },
    { icon: '👤', title: 'แนะนำเพื่อน', points: '+50', desc: 'เมื่อเพื่อนใช้รหัสอ้างอิง' },
];

export default function HealthPointsPage() {
    const [userName, setUserName] = useState('ผู้ใช้');
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
    const [redeemError, setRedeemError] = useState<string | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [redeemedRewards, setRedeemedRewards] = useState<any[]>([]);
    const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
    const [rewardsCatalog, setRewardsCatalog] = useState<any[]>([]);
    const [selectedReward, setSelectedReward] = useState<any>(null);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryPhone, setDeliveryPhone] = useState('');

    useEffect(() => {
        const fetchPointsData = async (email: string) => {
            try {
                const [pointsRes, rewardsRes] = await Promise.all([
                    fetch(`/api/user/points?email=${email}`),
                    fetch(`/api/user/rewards?email=${email}`)
                ]);
                
                if (pointsRes.ok) {
                    const data = await pointsRes.json();
                    setUserName(data.user.name);
                    setPoints(data.user.points);
                    setStreak(data.user.streak);
                    setRecentActivity(data.recentActivity || []);
                }
                
                if (rewardsRes.ok) {
                    const rewardsData = await rewardsRes.json();
                    setRedeemedRewards(rewardsData.redemptions || []);
                    setActiveCoupons(rewardsData.activeCoupons || []);
                }
            } catch (error) {
                // Silently handle fetch error
            } finally {
                setIsLoading(false);
            }
        };

        const fetchRewardsCatalog = async () => {
            try {
                const res = await fetch('/api/rewards/catalog');
                if (res.ok) {
                    const data = await res.json();
                    setRewardsCatalog(data.rewards || []);
                }
            } catch (error) {
                // Silently handle catalog fetch error
            }
        };

        const stored = localStorage.getItem('ayuraProfile');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUserName(parsed.name || 'ผู้ใช้');
            if (parsed.email) {
                setUserEmail(parsed.email);
                fetchPointsData(parsed.email);
                fetchRewardsCatalog();
                return;
            }
        }
        setIsLoading(false);
    }, []);

    const handleRedeemClick = (reward: any) => {        
        if (!userEmail) {
            setRedeemError('กรุณาเข้าสู่ระบบก่อน');
            setTimeout(() => setRedeemError(null), 3000);
            return;
        }
        
        if (!reward || !reward.id) {
            setRedeemError('ข้อมูลรางวัลไม่ถูกต้อง');
            setTimeout(() => setRedeemError(null), 3000);
            return;
        }
        
        const requiredPoints = reward.points_required || 0;
        if (points < requiredPoints) {
            setRedeemError('แต้มไม่พอสำหรับแลกรางวัลนี้');
            setTimeout(() => setRedeemError(null), 3000);
            return;
        }

        setSelectedReward(reward);
        
        // For item rewards, show delivery modal
        const rewardType = reward.type?.toLowerCase();
        
        if (rewardType === 'item') {
            setShowDeliveryModal(true);
        } else if (rewardType === 'discount') {
            // For discount rewards, redeem immediately
            processRedeem(reward);
        } else {
            setRedeemError('ประเภทรางวัลไม่ถูกต้อง: ' + reward.type);
            setTimeout(() => setRedeemError(null), 3000);
        }
    };

    const processRedeem = async (reward: any, address?: string, phone?: string) => {
        setIsRedeeming(true);
        setRedeemError(null);
        
        try {
            const payload: any = { 
                email: userEmail, 
                rewardId: reward.id 
            };
            
            // Add delivery info for item rewards
            if (reward.type === 'item' && address && phone) {
                payload.deliveryAddress = address;
                payload.deliveryPhone = phone;
            }
            
            const res = await fetch('/api/user/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                setPoints(data.remainingPoints);
                setRedeemSuccess(reward.name);
                
                // Add to redeemed rewards list
                setRedeemedRewards(prev => [{
                    id: data.redemption.id,
                    reward_id: reward.id,
                    reward_name: reward.name,
                    points_used: reward.points_required,
                    status: reward.type === 'item' ? 'active' : 'active',
                    redeemed_at: new Date().toISOString(),
                    reward_type: reward.type,
                    coupon_code: data.couponCode
                }, ...prev]);
                
                // Add coupon to active coupons if it's a discount
                if (reward.type === 'discount' && data.couponCode) {
                    setActiveCoupons(prev => [{
                        id: data.redemption.id,
                        coupon_code: data.couponCode,
                        discount_type: reward.discount_type,
                        discount_value: reward.discount_value,
                        reward_name: reward.name,
                        created_at: new Date().toISOString()
                    }, ...prev]);
                }
                
                setTimeout(() => setRedeemSuccess(null), 3000);
                
                // Close modal
                setShowDeliveryModal(false);
                setDeliveryAddress('');
                setDeliveryPhone('');
            } else {
                setRedeemError(data.error || 'ไม่สามารถแลกรางวัลได้');
                setTimeout(() => setRedeemError(null), 3000);
            }
        } catch (error) {
            setRedeemError('เกิดข้อผิดพลาด กรุณาลองใหม่');
            setTimeout(() => setRedeemError(null), 3000);
        } finally {
            setIsRedeeming(false);
        }
    };

    const submitDelivery = () => {
        if (!deliveryAddress.trim() || !deliveryPhone.trim()) {
            setRedeemError('กรุณากรอกที่อยู่และเบอร์โทรศัพท์');
            setTimeout(() => setRedeemError(null), 3000);
            return;
        }
        
        if (!/^[0-9]{10}$/.test(deliveryPhone)) {
            setRedeemError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก');
            setTimeout(() => setRedeemError(null), 3000);
            return;
        }
        
        if (selectedReward) {
            processRedeem(selectedReward, deliveryAddress, deliveryPhone);
        }
    };

    const nextReward = rewardsCatalog.find(r => r.points_required > points) || rewardsCatalog[rewardsCatalog.length - 1];
    const progressToNext = nextReward ? Math.min(100, (points / nextReward.points_required) * 100) : 0;
    const totalEarned = recentActivity.length > 0 ? recentActivity[0].points : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-spin-slow mb-4">⭐</div>
                    <p className="text-[var(--color-text-light)]">กำลังโหลดข้อมูลแต้มสะสม...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            {/* Redeem Success Toast */}
            {redeemSuccess && (
                <div className="fixed top-24 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-fade-in flex items-center gap-3">
                    <span className="text-xl">🎉</span>
                    <div>
                        <p className="font-bold text-sm">แลกรางวัลสำเร็จ!</p>
                        <p className="text-xs text-green-100">{redeemSuccess}</p>
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {redeemError && (
                <div className="fixed top-24 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-fade-in flex items-center gap-3">
                    <span className="text-xl">❌</span>
                    <div>
                        <p className="font-bold text-sm">แลกรางวัลไม่สำเร็จ</p>
                        <p className="text-xs text-red-100">{redeemError}</p>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-2">⭐ แต้มสะสมสุขภาพ</h1>
                    <p className="text-[var(--color-text-light)]">
                        สะสมแต้มจากทุกการสั่งซื้อ แล้วแลกรับสิทธิประโยชน์พิเศษ
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Left (main) ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Points Card */}
                        <div className="glass-card p-8 animate-fade-in bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Big points display */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex flex-col items-center justify-center shadow-xl">
                                        <span className="text-4xl">⭐</span>
                                        <span className="text-4xl font-bold text-white leading-none mt-1">
                                            {points.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-white/80 mt-1">แต้มสะสม</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-muted)] mt-3">สวัสดี, {userName} 👋</p>
                                </div>

                                {/* Stats */}
                                <div className="flex-1 space-y-4 w-full">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                                            <div className="text-2xl mb-1">🔥</div>
                                            <div className="text-2xl font-bold text-orange-500">{streak}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">สัปดาห์ติดต่อกัน</div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
                                            <div className="text-2xl mb-1">📈</div>
                                            <div className="text-2xl font-bold text-[var(--color-primary)]">+{totalEarned}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">แต้มที่ได้รับล่าสุด</div>
                                        </div>
                                    </div>

                                    {/* Progress to next reward */}
                                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-[var(--color-primary-dark)]">ความคืบหน้าสู่รางวัลถัดไป</span>
                                            <span className="text-xs text-[var(--color-text-muted)]">{points}/{nextReward?.points_required || 0} แต้ม</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-700"
                                                style={{ width: `${progressToNext}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                            🎯 อีก <strong>{(nextReward?.points_required - points > 0 ? nextReward?.points_required - points : 0).toLocaleString()}</strong> แต้ม จะได้ {nextReward?.image} {nextReward?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How to Earn */}
                        <div className="glass-card p-6 animate-fade-in delay-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                💡 วิธีสะสมแต้ม
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {howToEarn.map((item, i) => (
                                    <div key={i} className="bg-[var(--color-bg-section)] rounded-xl p-4 text-center">
                                        <div className="text-2xl mb-2">{item.icon}</div>
                                        <div className="text-base font-bold text-[var(--color-primary)]">{item.points}</div>
                                        <div className="text-xs font-medium text-[var(--color-text)] mt-0.5">{item.title}</div>
                                        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Redeemed Rewards */}
                        {redeemedRewards.length > 0 && (
                            <div className="glass-card p-6 animate-fade-in delay-200">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                    🎁 รางวัลที่แลกไว้
                                </h3>
                                <div className="space-y-2">
                                    {redeemedRewards.slice(0, 5).map((item, i) => (
                                        <div key={item.id || i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-text)]">{item.reward_name}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">
                                                    แลกเมื่อ {new Date(item.redeemed_at).toLocaleDateString('th-TH', { 
                                                        year: '2-digit', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                item.status === 'active' 
                                                    ? item.reward_type === 'discount' || item.coupon_code
                                                        ? 'bg-green-100 text-green-700' // Discount coupon ready to use
                                                        : 'bg-orange-100 text-orange-700' // Item waiting for delivery
                                                    : item.status === 'delivered'
                                                        ? 'bg-green-100 text-green-700'
                                                        : item.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {item.status === 'active' 
                                                    ? item.reward_type === 'discount' || item.coupon_code 
                                                        ? 'พร้อมใช้' 
                                                        : 'รอจัดส่ง' 
                                                    : item.status === 'delivered' 
                                                        ? 'สำเร็จ' 
                                                        : item.status === 'cancelled' 
                                                            ? 'ยกเลิก' 
                                                            : item.status === 'used' 
                                                                ? 'ใช้แล้ว' 
                                                                : 'หมดอายุ'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="glass-card p-6 animate-fade-in delay-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                📋 ประวัติการได้รับแต้ม
                            </h3>
                            <div className="space-y-2">
                                {recentActivity.length === 0 ? (
                                    <p className="text-sm text-center text-[var(--color-text-muted)] py-4">ยังไม่มีประวัติการได้รับแต้ม</p>
                                ) : (
                                    recentActivity.map((item, i) => (
                                        <div key={item.id || i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-text)]">{item.action}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">{item.date}</p>
                                            </div>
                                            <span className="text-base font-bold text-green-600">+{item.points}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Rewards Catalog ── */}
                    <div className="space-y-5">
                        <div className="glass-card p-6 animate-fade-in delay-300">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                🎁 แลกของรางวัล
                            </h3>
                            <div className="space-y-3">
                                {rewardsCatalog.map((reward) => {
                                    const canRedeem = points >= reward.points_required;
                                    return (
                                        <div
                                            key={reward.id}
                                            className={`p-4 rounded-xl border transition-all ${canRedeem
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                                : 'border-[var(--color-border)] bg-gray-50 opacity-70'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl flex-shrink-0">{reward.image}</div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold leading-snug">{reward.name}</h4>
                                                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug">{reward.description}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs font-semibold text-[var(--color-secondary)]">
                                                            ⭐ {reward.points_required.toLocaleString()} แต้ม
                                                        </span>
                                                        {canRedeem ? (
                                                            <button
                                                                onClick={() => handleRedeemClick(reward)}
                                                                disabled={isRedeeming}
                                                                className="text-xs bg-[var(--color-primary)] text-white px-3 py-1 rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isRedeeming ? 'กำลังแลก...' : 'แลกเลย'}
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                                ขาดอีก {(reward.points_required - points).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CTA buttons */}
                        {/* Active Coupons */}
                        {activeCoupons.length > 0 && (
                            <div className="glass-card p-6 animate-fade-in delay-250">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                    🎟️ คูปองส่วนลดของคุณ
                                </h3>
                                <div className="space-y-2">
                                    {activeCoupons.map((coupon) => (
                                        <div key={coupon.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div>
                                                <p className="text-sm font-medium text-green-800">{coupon.reward_name}</p>
                                                <p className="text-xs text-green-600">รหัส: {coupon.coupon_code}</p>
                                            </div>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(coupon.coupon_code)}
                                                className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
                                            >
                                                คัดลอก
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Link href="/meal-plan" className="btn-primary w-full justify-center !py-3 text-sm">
                                สั่งกล่องเพิ่มแต้ม 📦
                            </Link>
                            <Link href="/dashboard" className="btn-outline w-full justify-center !py-3 text-sm">
                                ดูกล่องสุขภาพ 🌿
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Modal for Item Rewards */}
            {showDeliveryModal && selectedReward && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-2">กรอกที่อยู่จัดส่ง</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            รางวัล: {selectedReward.name} ({selectedReward.points_required} แต้ม)
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">ที่อยู่จัดส่ง</label>
                                <textarea
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    placeholder="กรอกที่อยู่เต็มรูปแบบ"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    rows={3}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">เบอร์โทรศัพท์ (10 หลัก)</label>
                                <input
                                    type="tel"
                                    value={deliveryPhone}
                                    onChange={(e) => setDeliveryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="กรอกเบอร์โทร 10 หลัก"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    maxLength={10}
                                />
                            </div>
                            
                            {redeemError && (
                                <p className="text-sm text-red-500">{redeemError}</p>
                            )}
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowDeliveryModal(false);
                                    setDeliveryAddress('');
                                    setDeliveryPhone('');
                                    setRedeemError(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isRedeeming}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={submitDelivery}
                                disabled={isRedeeming || !deliveryAddress.trim() || deliveryPhone.length !== 10}
                                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isRedeeming ? 'กำลังแลก...' : 'ยืนยันการแลก'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
