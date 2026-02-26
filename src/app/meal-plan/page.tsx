'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type SubscriptionTier = 'weekly' | 'monthly';

const DAY_SHORT = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];

const mealTypeLabels: Record<string, { label: string; emoji: string; time: string }> = {
    'เช้า': { label: 'มื้อเช้า', emoji: '🌅', time: '07:00 - 08:30' },
    'กลางวัน': { label: 'มื้อกลางวัน', emoji: '☀️', time: '12:00 - 13:00' },
    'เย็น': { label: 'มื้อเย็น', emoji: '🌙', time: '18:00 - 19:00' },
    'ว่าง': { label: 'อาหารว่าง', emoji: '🍵', time: '15:00 - 16:00' },
};

export default function MealPlanPage() {
    const [tier, setTier] = useState<SubscriptionTier>('weekly');
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [selectedDay, setSelectedDay] = useState(0);
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

    const tierInfo = {
        weekly: {
            label: 'รายสัปดาห์',
            emoji: '📦',
            price: '฿559',
            duration: '7 วัน',
            meals: '3 มื้อ + ว่าง',
            highlight: true,
        },
        monthly: {
            label: 'รายเดือน',
            emoji: '📦📦📦📦',
            price: '฿2,012',
            duration: '30 วัน (4 สัปดาห์)',
            meals: '3 มื้อ + ว่าง',
            highlight: false
        },
    };

    const subscription = {
        weeks: [
            {
                weekNumber: 1,
                avgCaloriesPerDay: 1950,
                totalProtein: 145,
                totalCarbs: 210,
                totalFat: 52,
                days: Array(7).fill(0).map((_, i) => ({
                    dayLabel: `วันที่ ${i + 1}`,
                    totalCalories: 1950,
                    totalProtein: 145,
                    totalCarbs: 210,
                    totalFat: 52,
                    meals: [
                        { type: 'เช้า', recipe: { id: `r1-${i}`, name: 'แซนด์วิชไก่', description: 'แซนด์วิชไก่ย่างไขมันต่ำ', calories: 450, protein: 40, carbs: 30, fat: 12, cookTime: '10 นาที', image: '🥪', items: [], instructions: [] } },
                        { type: 'กลางวัน', recipe: { id: `r2-${i}`, name: 'ข้าวผัดต้มยำ', description: 'ข้าวกล้องผัดต้มยำกุ้ง', calories: 600, protein: 35, carbs: 70, fat: 15, cookTime: '30 นาที', image: '🍛', items: [], instructions: [] } }
                    ]
                }))
            }
        ]
    };

    const currentWeek = subscription.weeks[selectedWeek];
    const currentDay = currentWeek.days[selectedDay];

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        🍽️ แผนอาหารสุขภาพ
                    </h1>
                    <p className="text-[var(--color-text-light)]">
                        ข้อมูลจำลองแบบ Static (ลบระบบอัลกอริทึมจากฝั่ง Backend แล้ว)
                    </p>
                </div>

                {/* Tier Selector */}
                <div className="glass-card p-6 mb-6 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        📋 เลือกแผนสมาชิก
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(Object.entries(tierInfo) as [SubscriptionTier, typeof tierInfo['weekly']][]).map(([key, info]) => (
                            <button
                                key={key}
                                onClick={() => setTier(key)}
                                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 hover-lift ${tier === key
                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-lg shadow-[var(--color-primary)]/10'
                                    : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/30'
                                    }`}
                            >
                                {info.highlight && (
                                    <div className="absolute -top-3 right-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
                                        แนะนำ ⭐
                                    </div>
                                )}
                                <div className="text-2xl mb-2">{info.emoji}</div>
                                <div className="font-bold text-base mb-1">{info.label}</div>
                                <div className="text-2xl font-bold text-[var(--color-primary)] mb-1">{info.price}</div>
                                <div className="text-xs text-[var(--color-text-muted)] space-y-0.5">
                                    <div>📅 {info.duration}</div>
                                    <div>🍽️ {info.meals}</div>
                                </div>
                                {tier === key && (
                                    <div className="absolute top-3 left-3 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Navigation & Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Day Navigation */}
                        <div className="glass-card p-5 animate-fade-in delay-100">
                            <h4 className="font-bold mb-3 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                📅 เลือกวัน
                            </h4>
                            <div className="grid grid-cols-7 gap-1.5">
                                {currentWeek.days.map((day, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setSelectedDay(i); setExpandedRecipe(null); }}
                                        className={`py-3 px-1 rounded-xl text-center transition-all ${selectedDay === i
                                            ? 'bg-[var(--color-primary)] text-white shadow-md scale-105'
                                            : 'bg-[var(--color-bg-section)] text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/10'
                                            }`}
                                    >
                                        <div className="text-xs font-bold">{DAY_SHORT[i]}</div>
                                        <div className={`text-[10px] mt-0.5 ${selectedDay === i ? 'opacity-90' : 'opacity-60'}`}>
                                            {day.totalCalories}
                                        </div>
                                        <div className={`text-[9px] ${selectedDay === i ? 'opacity-75' : 'opacity-40'}`}>kcal</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Daily Summary */}
                        <div className="glass-card p-5 animate-fade-in delay-200">
                            <h4 className="font-bold mb-3 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                📊 สรุป{currentDay.dayLabel}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-orange-50 rounded-xl text-center">
                                    <div className="text-xl font-bold text-orange-600">{currentDay.totalCalories}</div>
                                    <div className="text-[10px] text-orange-400 font-medium">kcal</div>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl text-center">
                                    <div className="text-xl font-bold text-red-600">{currentDay.totalProtein}g</div>
                                    <div className="text-[10px] text-red-400 font-medium">โปรตีน</div>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-xl text-center">
                                    <div className="text-xl font-bold text-amber-600">{currentDay.totalCarbs}g</div>
                                    <div className="text-[10px] text-amber-400 font-medium">คาร์บ</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-xl text-center">
                                    <div className="text-xl font-bold text-green-600">{currentDay.totalFat}g</div>
                                    <div className="text-[10px] text-green-400 font-medium">ไขมัน</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Meal Cards */}
                    <div className="lg:col-span-2">
                        {/* Current Day Header */}
                        <div className="glass-card p-5 mb-4 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--color-primary-dark)]">
                                        {currentDay.dayLabel}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-muted)]">
                                        {currentDay.meals.length} เมนู • {currentDay.totalCalories} kcal
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Meal Cards */}
                        <div className="space-y-4">
                            {currentDay.meals.map((meal, i) => {
                                const mealInfo = mealTypeLabels[meal.type] || mealTypeLabels['เช้า'];
                                const isExpanded = expandedRecipe === `${selectedWeek}-${selectedDay}-${meal.recipe.id}`;

                                return (
                                    <div
                                        key={`${selectedWeek}-${selectedDay}-${meal.recipe.id}`}
                                        className="glass-card overflow-hidden animate-fade-in"
                                        style={{ animationDelay: `${i * 80}ms` }}
                                    >
                                        <div
                                            className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                            onClick={() => setExpandedRecipe(isExpanded ? null : `${selectedWeek}-${selectedDay}-${meal.recipe.id}`)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center text-3xl flex-shrink-0">
                                                    {meal.recipe.image}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                            {mealInfo.emoji} {mealInfo.label}
                                                        </span>
                                                        <span className="text-xs text-[var(--color-text-muted)]">
                                                            {mealInfo.time}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-base">{meal.recipe.name}</h4>
                                                    <p className="text-xs text-[var(--color-text-light)] mt-1 line-clamp-1">
                                                        {meal.recipe.description}
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-lg font-bold text-[var(--color-primary)]">
                                                        {meal.recipe.calories}
                                                        <span className="text-xs font-normal text-[var(--color-text-muted)] ml-0.5">kcal</span>
                                                    </div>
                                                    <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                                        ⏱️ {meal.recipe.cookTime}
                                                    </div>
                                                    <div className="text-lg mt-1">
                                                        {isExpanded ? '▲' : '▼'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-3 text-xs">
                                                <span className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full text-red-600">
                                                    P {meal.recipe.protein}g
                                                </span>
                                                <span className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full text-amber-600">
                                                    C {meal.recipe.carbs}g
                                                </span>
                                                <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full text-green-600">
                                                    F {meal.recipe.fat}g
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
