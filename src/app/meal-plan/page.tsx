'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateMealPlanSubscription, generateWeeklyBox } from '@/lib/aiRecommendation';
import { ingredients } from '@/lib/data/ingredients';
import { HealthGoal, MealPlanSubscription, SubscriptionTier, WeeklyBox } from '@/lib/types';
import { PricingManager } from '@/lib/pricingManager';

const getTierInfo = (pricing: PricingManager): Record<SubscriptionTier, {
    label: string;
    emoji: string;
    price: string;
    duration: string;
    meals: string;
    color: string;
    highlight?: boolean;
}> => ({
    weekly: {
        label: 'รายสัปดาห์',
        emoji: '📦',
        price: pricing.getFormattedTotalPrice('weekly'),
        duration: '7 วัน',
        meals: '3 มื้อ + ว่าง',
        color: 'from-blue-500 to-indigo-600',
        highlight: true,
    },
    monthly: {
        label: 'รายเดือน',
        emoji: '📦📦📦📦',
        price: pricing.getFormattedTotalPrice('monthly'),
        duration: '30 วัน (4 สัปดาห์)',
        meals: '3 มื้อ + ว่าง',
        color: 'from-purple-500 to-pink-600',
    },
});

const DAY_SHORT = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];

const mealTypeLabels: Record<string, { label: string; emoji: string; time: string }> = {
    'เช้า': { label: 'มื้อเช้า', emoji: '🌅', time: '07:00 - 08:30' },
    'กลางวัน': { label: 'มื้อกลางวัน', emoji: '☀️', time: '12:00 - 13:00' },
    'เย็น': { label: 'มื้อเย็น', emoji: '🌙', time: '18:00 - 19:00' },
    'ว่าง': { label: 'อาหารว่าง', emoji: '🍵', time: '15:00 - 16:00' },
};

export default function MealPlanPage() {
    const [tier, setTier] = useState<SubscriptionTier>('weekly');
    const [subscription, setSubscription] = useState<MealPlanSubscription | null>(null);
    const [weeklyBox, setWeeklyBox] = useState<WeeklyBox | null>(null);
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [selectedDay, setSelectedDay] = useState(0);
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('ayura-profile');
        let goals: HealthGoal[] = ['ลดน้ำหนัก', 'ลดความเครียด'];
        let weight = 70, height = 170, age = 30;
        let gender: 'ชาย' | 'หญิง' | 'อื่นๆ' = 'ชาย';

        if (stored) {
            const parsed = JSON.parse(stored);
            goals = parsed.healthGoals;
            weight = parsed.weight;
            height = parsed.height;
            age = parsed.age;
            gender = parsed.gender;
        }

        const sub = generateMealPlanSubscription(goals, tier, weight, height, age, gender);
        const box = generateWeeklyBox(goals, 1);

        setSubscription(sub);
        setWeeklyBox(box);
        setSelectedWeek(0);
        setSelectedDay(0);
        setExpandedRecipe(null);
    }, [tier]);

    if (!subscription) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-spin-slow mb-4">🌿</div>
                    <p className="text-[var(--color-text-light)]">กำลังสร้างแผนอาหาร...</p>
                </div>
            </div>
        );
    }

    const currentWeek = subscription.weeks[selectedWeek];
    const currentDay = currentWeek.days[selectedDay];

    // Dynamic pricing using PricingManager
    const pricing = new PricingManager(weeklyBox);
    const tierInfo = getTierInfo(pricing);

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        🍽️ แผนอาหารสุขภาพ
                    </h1>
                    <p className="text-[var(--color-text-light)]">
                        AI ออกแบบเมนูเฉพาะคุณ • ไม่ซ้ำทุกวัน • ครบโภชนาการ
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
                        {/* Week Navigation (for monthly) */}
                        {subscription.weeks.length > 1 && (
                            <div className="glass-card p-5 animate-fade-in">
                                <h4 className="font-bold mb-3 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                    📆 สัปดาห์
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {subscription.weeks.map((week, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setSelectedWeek(i); setSelectedDay(0); setExpandedRecipe(null); }}
                                            className={`py-3 px-2 rounded-xl text-center font-medium text-sm transition-all ${selectedWeek === i
                                                ? 'bg-[var(--color-primary)] text-white shadow-md'
                                                : 'bg-[var(--color-bg-section)] text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/10'
                                                }`}
                                        >
                                            <div className="text-lg mb-0.5">W{week.weekNumber}</div>
                                            <div className="text-[10px] opacity-75">สัปดาห์ {week.weekNumber}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                    <div className="text-xl font-bold text-orange-600">{Number(currentDay.totalCalories.toFixed(1))}</div>
                                    <div className="text-[10px] text-orange-400 font-medium">kcal</div>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl text-center">
                                    <div className="text-xl font-bold text-red-600">{Number(currentDay.totalProtein.toFixed(1))}g</div>
                                    <div className="text-[10px] text-red-400 font-medium">โปรตีน</div>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-xl text-center">
                                    <div className="text-xl font-bold text-amber-600">{Number(currentDay.totalCarbs.toFixed(1))}g</div>
                                    <div className="text-[10px] text-amber-400 font-medium">คาร์บ</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-xl text-center">
                                    <div className="text-xl font-bold text-green-600">{Number(currentDay.totalFat.toFixed(1))}g</div>
                                    <div className="text-[10px] text-green-400 font-medium">ไขมัน</div>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Summary */}
                        <div className="glass-card p-5 animate-fade-in delay-300">
                            <h4 className="font-bold mb-3 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                📈 ภาพรวมสัปดาห์ {currentWeek.weekNumber}
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <span className="text-sm text-[var(--color-text-light)]">เฉลี่ย kcal/วัน</span>
                                    <span className="font-bold text-[var(--color-primary)]">{currentWeek.avgCaloriesPerDay}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <span className="text-sm text-[var(--color-text-light)]">โปรตีนรวม</span>
                                    <span className="font-bold text-red-500">{Number(currentWeek.totalProtein.toFixed(1))}g</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <span className="text-sm text-[var(--color-text-light)]">คาร์บรวม</span>
                                    <span className="font-bold text-amber-500">{Number(currentWeek.totalCarbs.toFixed(1))}g</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <span className="text-sm text-[var(--color-text-light)]">ไขมันรวม</span>
                                    <span className="font-bold text-green-500">{Number(currentWeek.totalFat.toFixed(1))}g</span>
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
                                        {subscription.weeks.length > 1 && `สัปดาห์ ${currentWeek.weekNumber} • `}
                                        {currentDay.meals.length} เมนู • {Number(currentDay.totalCalories.toFixed(1))} kcal
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            if (selectedDay > 0) { setSelectedDay(selectedDay - 1); setExpandedRecipe(null); }
                                            else if (selectedWeek > 0) { setSelectedWeek(selectedWeek - 1); setSelectedDay(6); setExpandedRecipe(null); }
                                        }}
                                        disabled={selectedDay === 0 && selectedWeek === 0}
                                        className="w-10 h-10 rounded-xl bg-[var(--color-bg-section)] flex items-center justify-center text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/10 transition-all disabled:opacity-30"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedDay < 6) { setSelectedDay(selectedDay + 1); setExpandedRecipe(null); }
                                            else if (selectedWeek < subscription.weeks.length - 1) { setSelectedWeek(selectedWeek + 1); setSelectedDay(0); setExpandedRecipe(null); }
                                        }}
                                        disabled={selectedDay === 6 && selectedWeek === subscription.weeks.length - 1}
                                        className="w-10 h-10 rounded-xl bg-[var(--color-bg-section)] flex items-center justify-center text-[var(--color-text-light)] hover:bg-[var(--color-primary)]/10 transition-all disabled:opacity-30"
                                    >
                                        →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Meal Cards */}
                        <div className="space-y-4">
                            {currentDay.meals.map((meal, i) => {
                                const mealInfo = mealTypeLabels[meal.type];
                                const isExpanded = expandedRecipe === `${selectedWeek}-${selectedDay}-${meal.recipe.id}`;
                                const mealIngredients = meal.recipe.items.map(item => item.ingredientId)
                                    .map((id) => ingredients.find((ing: any) => ing.id === id))
                                    .filter(Boolean);

                                return (
                                    <div
                                        key={`${selectedWeek}-${selectedDay}-${meal.recipe.id}`}
                                        className="glass-card overflow-hidden animate-fade-in"
                                        style={{ animationDelay: `${i * 80}ms` }}
                                    >
                                        {/* Meal Header */}
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

                                            {/* Macro mini bar */}
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

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 p-5 bg-gradient-to-b from-gray-50/50 to-white animate-fade-in">
                                                {/* Ingredients Used */}
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-bold text-[var(--color-primary-dark)] mb-2">
                                                        🧅 วัตถุดิบที่ใช้
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {meal.recipe.items.map((item, idx) => {
                                                            const ing = ingredients.find(i => i.id === item.ingredientId);
                                                            if (!ing) return null;
                                                            return (
                                                                <div
                                                                    key={`${ing.id}-${idx}`}
                                                                    className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm"
                                                                >
                                                                    <span className="text-lg">{ing.image}</span>
                                                                    <span className="text-xs font-medium">{ing.name} ({item.amountInGrams} กรัม)</span>
                                                                    {ing.calories} kcal/{ing.gramsPerUnit}g
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Cooking Instructions */}
                                                <div>
                                                    <h5 className="text-sm font-bold text-[var(--color-primary-dark)] mb-2">
                                                        👨‍🍳 วิธีทำ
                                                    </h5>
                                                    <ol className="space-y-2">
                                                        {meal.recipe.instructions.map((step, stepIdx) => (
                                                            <li key={stepIdx} className="flex gap-3 items-start">
                                                                <span className="w-6 h-6 bg-[var(--color-primary)] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                                                                    {stepIdx + 1}
                                                                </span>
                                                                <span className="text-sm text-[var(--color-text-light)] leading-relaxed">
                                                                    {step}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <Link
                                href="/checkout"
                                className="btn-primary flex-1 justify-center !py-4 text-base"
                            >
                                สมัครแผนนี้ 🛒
                            </Link>
                            <Link
                                href="/dashboard"
                                className="btn-outline flex-1 justify-center !py-4 text-base"
                            >
                                กลับไปแดชบอร์ด 📊
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
