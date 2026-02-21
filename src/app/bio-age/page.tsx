'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockUser, bioAgeHistory, rewards } from '@/lib/mockData';
import { UserProfile } from '@/lib/types';

export default function BioAgePage() {
    const [user, setUser] = useState<UserProfile>(mockUser);
    const [animatedBioAge, setAnimatedBioAge] = useState(user.realAge);

    useEffect(() => {
        const stored = localStorage.getItem('ayura-profile');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser({
                ...mockUser,
                name: parsed.name || mockUser.name,
                age: parsed.age || mockUser.age,
                realAge: parsed.age || mockUser.realAge,
                element: parsed.element || mockUser.element,
                healthGoals: parsed.healthGoals || mockUser.healthGoals,
            });
        }

        // Animate bio age
        const timer = setTimeout(() => {
            setAnimatedBioAge(user.bioAge);
        }, 500);
        return () => clearTimeout(timer);
    }, [user.bioAge]);

    const bioAgeReduction = user.realAge - user.bioAge;
    const progressPercent = Math.max(0, Math.min(100, ((user.realAge - user.bioAge) / user.realAge) * 100));

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-2">แต้มอายุชีวภาพ</h1>
                    <p className="text-[var(--color-text-light)]">
                        ยิ่งกินดี ยิ่งแข็งแรง อายุชีวภาพยิ่งลดลง!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Bio-Age Display */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Age Card */}
                        <div className="glass-card p-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                {/* Circular Bio Age */}
                                <div className="flex flex-col items-center">
                                    <div className="relative w-48 h-48">
                                        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                                            <circle
                                                cx="100"
                                                cy="100"
                                                r="85"
                                                stroke="#e5e7eb"
                                                strokeWidth="12"
                                                fill="none"
                                            />
                                            <circle
                                                cx="100"
                                                cy="100"
                                                r="85"
                                                stroke="url(#gradient)"
                                                strokeWidth="12"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={`${progressPercent * 5.34} 534`}
                                                className="transition-all duration-1000 ease-out"
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="var(--color-primary)" />
                                                    <stop offset="100%" stopColor="var(--color-secondary-light)" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-xs text-[var(--color-text-muted)]">อายุชีวภาพ</span>
                                            <span className="text-5xl font-bold text-[var(--color-primary)]">
                                                {animatedBioAge}
                                            </span>
                                            <span className="text-sm text-[var(--color-text-light)]">ปี</span>
                                        </div>
                                    </div>
                                    <div className="text-center mt-2">
                                        <span className="text-sm text-[var(--color-text-light)]">
                                            อายุจริง: <strong>{user.realAge}</strong> ปี
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="p-4 bg-[var(--color-success)]/10 rounded-xl flex items-center gap-4">
                                        <div className="text-3xl">🎯</div>
                                        <div>
                                            <div className="text-sm text-[var(--color-text-light)]">ลดอายุชีวภาพไปแล้ว</div>
                                            <div className="text-2xl font-bold text-[var(--color-success)]">
                                                {bioAgeReduction} ปี
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-[var(--color-bg)] rounded-xl text-center">
                                            <div className="text-2xl mb-1">🔥</div>
                                            <div className="text-2xl font-bold text-[var(--color-primary)]">
                                                {user.streak}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)]">สัปดาห์ติดต่อกัน</div>
                                        </div>
                                        <div className="p-4 bg-[var(--color-bg)] rounded-xl text-center">
                                            <div className="text-2xl mb-1">⭐</div>
                                            <div className="text-2xl font-bold text-[var(--color-secondary)]">
                                                {user.points.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)]">แต้มสะสม</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio Age Trend Chart */}
                        <div className="glass-card p-6 animate-fade-in delay-100">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                📈 แนวโน้มอายุชีวภาพ
                            </h3>
                            <div className="relative h-64">
                                {/* Simple bar chart */}
                                <div className="absolute inset-0 flex items-end gap-3 px-2">
                                    {bioAgeHistory.map((entry, i) => {
                                        const maxAge = 35;
                                        const minAge = 25;
                                        const bioHeight = ((entry.bioAge - minAge) / (maxAge - minAge)) * 100;
                                        const realHeight = ((entry.realAge - minAge) / (maxAge - minAge)) * 100;

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full flex items-end gap-1 h-48">
                                                    {/* Real age bar */}
                                                    <div
                                                        className="flex-1 bg-gray-200 rounded-t-lg transition-all duration-500 relative group"
                                                        style={{ height: `${realHeight}%` }}
                                                    >
                                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {entry.realAge}
                                                        </div>
                                                    </div>
                                                    {/* Bio age bar */}
                                                    <div
                                                        className="flex-1 gradient-primary rounded-t-lg transition-all duration-500 relative group"
                                                        style={{
                                                            height: `${bioHeight}%`,
                                                            animationDelay: `${i * 100}ms`,
                                                        }}
                                                    >
                                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {entry.bioAge}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                                                    {entry.week.replace('สัปดาห์ ', 'W')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-gray-200" />
                                    <span className="text-xs text-[var(--color-text-muted)]">อายุจริง</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded gradient-primary" />
                                    <span className="text-xs text-[var(--color-text-muted)]">อายุชีวภาพ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Rewards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Current Points */}
                        <div className="glass-card p-6 text-center animate-fade-in delay-200">
                            <div className="text-4xl mb-2">⭐</div>
                            <div className="text-3xl font-bold text-[var(--color-secondary)]">
                                {user.points.toLocaleString()}
                            </div>
                            <div className="text-sm text-[var(--color-text-light)]">แต้มสะสมทั้งหมด</div>
                            <div className="mt-4 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-section)] p-3 rounded-xl">
                                💡 ได้แต้มจากการสั่งกล่องทุกสัปดาห์ และทำตามเป้าหมายสุขภาพ
                            </div>
                        </div>

                        {/* Reward Cards */}
                        <div className="glass-card p-6 animate-fade-in delay-300">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                🎁 แลกของรางวัล
                            </h3>
                            <div className="space-y-3">
                                {rewards.map((reward) => {
                                    const canRedeem = user.points >= reward.pointsRequired;
                                    return (
                                        <div
                                            key={reward.id}
                                            className={`p-4 rounded-xl border transition-all ${canRedeem
                                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 hover-lift cursor-pointer'
                                                    : 'border-[var(--color-border)] bg-gray-50 opacity-70'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl">{reward.image}</div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold">{reward.name}</h4>
                                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                        {reward.description}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs font-medium text-[var(--color-secondary)]">
                                                            ⭐ {reward.pointsRequired.toLocaleString()} แต้ม
                                                        </span>
                                                        {canRedeem ? (
                                                            <button className="text-xs bg-[var(--color-primary)] text-white px-3 py-1 rounded-full font-medium hover:opacity-90 transition-opacity">
                                                                แลกเลย
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                                ต้องการอีก {(reward.pointsRequired - user.points).toLocaleString()}
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

                        {/* Quick Actions */}
                        <div className="space-y-3">
                            <Link href="/dashboard" className="btn-primary w-full justify-center !py-3 text-sm">
                                ดูกล่องสุขภาพ 📦
                            </Link>
                            <Link href="/assessment" className="btn-outline w-full justify-center !py-3 text-sm">
                                ประเมินสุขภาพใหม่ 🔄
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
