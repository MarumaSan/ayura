'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const rewards = [
    { id: 'rd1', name: 'ส่วนลด 100 บาท ค่าส่ง', description: 'นำแต้มเป็นส่วนลดค่าจัดส่งสำหรับกล่องสัปดาห์ถัดไป', pointsRequired: 1000, image: '🚚' },
    { id: 'rd2', name: 'ฟรี น้ำผลไม้สกัดเย็น', description: 'เลือกน้ำผลไม้สกัดเย็นตามต้องการ 1 ขวด', pointsRequired: 1000, image: '🧃' },
    { id: 'rd3', name: 'เซ็ตสมุนไพรพรีเมียม', description: 'สมุนไพรอบแห้งคัดเกรด จาก 4 ชุมชน', pointsRequired: 2500, image: '🌿' },
    { id: 'rd4', name: 'ส่วนลด 20% ออร์เดอร์ถัดไป', description: 'ใช้ได้กับทุกเซ็ตอาหาร ไม่จำกัดมูลค่า', pointsRequired: 4000, image: '🏷️' },
    { id: 'rd5', name: 'กล่องสุขภาพรายสัปดาห์ฟรี 1 กล่อง', description: 'เซ็ตอาหารรายสัปดาห์ ฟรีทั้งกล่อง', pointsRequired: 8000, image: '📦' },
];

const howToEarn = [
    { icon: '📦', title: 'สั่งกล่องรายสัปดาห์', points: '+100', desc: 'ต่อกล่องที่สั่ง' },
    { icon: '📦', title: 'สั่งกล่องรายเดือน', points: '+500', desc: 'ต่อเดือนที่สั่ง' },
    { icon: '👤', title: 'แนะนำเพื่อน', points: '+300', desc: 'เมื่อเพื่อนสั่งครั้งแรก' },
];

export default function HealthPointsPage() {
    const [userName, setUserName] = useState('ผู้ใช้');
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchPointsData = async (email: string) => {
            try {
                const res = await fetch(`/api/user/points?email=${email}`);
                if (res.ok) {
                    const data = await res.json();
                    setUserName(data.user.name);
                    setPoints(data.user.points);
                    setStreak(data.user.streak);
                    setRecentActivity(data.recentActivity || []);
                }
            } catch (error) {
                console.error("Failed to fetch points data", error);
            } finally {
                setIsLoading(false);
            }
        };

        const stored = localStorage.getItem('ayura-profile');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUserName(parsed.name || 'ผู้ใช้');
            if (parsed.email) {
                fetchPointsData(parsed.email);
                return;
            }
        }
        setIsLoading(false);
    }, []);

    const handleRedeem = (reward: typeof rewards[0]) => {
        if (points >= reward.pointsRequired) {
            setRedeemSuccess(reward.name);
            setTimeout(() => setRedeemSuccess(null), 3000);
        }
    };

    const nextReward = rewards.find(r => r.pointsRequired > points) || rewards[rewards.length - 1];
    const progressToNext = Math.min(100, (points / nextReward.pointsRequired) * 100);
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
                                            <span className="text-xs text-[var(--color-text-muted)]">{points}/{nextReward.pointsRequired} แต้ม</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-700"
                                                style={{ width: `${progressToNext}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                            🎯 อีก <strong>{(nextReward.pointsRequired - points).toLocaleString()}</strong> แต้ม จะได้ {nextReward.image} {nextReward.name}
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
                                {rewards.map((reward) => {
                                    const canRedeem = points >= reward.pointsRequired;
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
                                                            ⭐ {reward.pointsRequired.toLocaleString()} แต้ม
                                                        </span>
                                                        {canRedeem ? (
                                                            <button
                                                                onClick={() => handleRedeem(reward)}
                                                                className="text-xs bg-[var(--color-primary)] text-white px-3 py-1 rounded-full font-medium hover:opacity-90 transition-opacity"
                                                            >
                                                                แลกเลย
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                                ขาดอีก {(reward.pointsRequired - points).toLocaleString()}
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
        </div>
    );
}
