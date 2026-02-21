'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateWeeklyBox, calculateBMI, calculateBMR, generateDailyMealPlan } from '@/lib/aiRecommendation';
import { elementDescriptions, ingredients } from '@/lib/mockData';
import { ThaiElement, HealthGoal, WeeklyBox, BMRResult, DailyMealPlan } from '@/lib/types';

export default function DashboardPage() {
    const [profile, setProfile] = useState<{
        name: string;
        age: number;
        gender: 'ชาย' | 'หญิง' | 'อื่นๆ';
        weight: number;
        height: number;
        element: ThaiElement;
        healthGoals: HealthGoal[];
    } | null>(null);

    const [weeklyBox, setWeeklyBox] = useState<WeeklyBox | null>(null);
    const [bmrResult, setBmrResult] = useState<BMRResult | null>(null);
    const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null);
    const [activeTab, setActiveTab] = useState<'box' | 'meals'>('meals');
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('ayura-profile');
        if (stored) {
            const parsed = JSON.parse(stored);
            setProfile(parsed);
            const box = generateWeeklyBox(parsed.element, parsed.healthGoals, 8);
            setWeeklyBox(box);
            const bmr = calculateBMR(parsed.weight, parsed.height, parsed.age, parsed.gender, parsed.healthGoals);
            setBmrResult(bmr);
            const plan = generateDailyMealPlan(box.ingredients, bmr);
            setMealPlan(plan);
        } else {
            const defaultProfile = {
                name: 'ผู้ใช้ตัวอย่าง',
                age: 30,
                gender: 'ชาย' as const,
                weight: 70,
                height: 170,
                element: 'ไฟ' as ThaiElement,
                healthGoals: ['ลดน้ำหนัก', 'ลดความเครียด'] as HealthGoal[],
            };
            setProfile(defaultProfile);
            const box = generateWeeklyBox(defaultProfile.element, defaultProfile.healthGoals, 8);
            setWeeklyBox(box);
            const bmr = calculateBMR(defaultProfile.weight, defaultProfile.height, defaultProfile.age, defaultProfile.gender, defaultProfile.healthGoals);
            setBmrResult(bmr);
            const plan = generateDailyMealPlan(box.ingredients, bmr);
            setMealPlan(plan);
        }
    }, []);

    if (!profile || !weeklyBox || !bmrResult || !mealPlan) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-spin-slow mb-4">🌿</div>
                    <p className="text-[var(--color-text-light)]">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    const bmi = calculateBMI(profile.weight, profile.height);
    const elementInfo = elementDescriptions[profile.element];

    const mealTypeLabels: Record<string, { label: string; emoji: string; time: string }> = {
        'เช้า': { label: 'มื้อเช้า', emoji: '🌅', time: '07:00 - 08:30' },
        'กลางวัน': { label: 'มื้อกลางวัน', emoji: '☀️', time: '12:00 - 13:00' },
        'เย็น': { label: 'มื้อเย็น', emoji: '🌙', time: '18:00 - 19:00' },
        'ว่าง': { label: 'อาหารว่าง', emoji: '🍵', time: '15:00 - 16:00' },
    };

    // Calorie percentage for macro bars
    const caloriePercent = Math.min(100, Math.round((mealPlan.totalCalories / bmrResult.targetCalories) * 100));
    const proteinPercent = Math.min(100, Math.round((mealPlan.totalProtein / bmrResult.targetProtein) * 100));
    const carbsPercent = Math.min(100, Math.round((mealPlan.totalCarbs / bmrResult.targetCarbs) * 100));
    const fatPercent = Math.min(100, Math.round((mealPlan.totalFat / bmrResult.targetFat) * 100));

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        กล่องสุขภาพของคุณ
                    </h1>
                    <p className="text-[var(--color-text-light)]">
                        สัปดาห์ที่ {weeklyBox.weekNumber} • AI จัดให้โดยเฉพาะ
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Profile + BMR + Nutrition */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="glass-card p-6 animate-fade-in">
                            <div className="text-center">
                                <div
                                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl mb-3"
                                    style={{ backgroundColor: elementInfo.color + '20' }}
                                >
                                    {elementInfo.emoji}
                                </div>
                                <h3 className="text-lg font-bold">{profile.name}</h3>
                                <div
                                    className="inline-block text-sm font-medium px-3 py-1 rounded-full text-white mt-2"
                                    style={{ backgroundColor: elementInfo.color }}
                                >
                                    ธาตุ{profile.element}
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between items-center p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <span className="text-sm text-[var(--color-text-light)]">อายุ</span>
                                    <span className="font-medium">{profile.age} ปี</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <span className="text-sm text-[var(--color-text-light)]">BMI</span>
                                    <span className="font-medium">
                                        {bmi.bmi} <span className="text-xs text-[var(--color-text-muted)]">({bmi.label})</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <span className="text-sm text-[var(--color-text-light)]">น้ำหนัก</span>
                                    <span className="font-medium">{profile.weight} กก.</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <span className="text-sm text-[var(--color-text-light)]">ส่วนสูง</span>
                                    <span className="font-medium">{profile.height} ซม.</span>
                                </div>
                            </div>
                        </div>

                        {/* BMR Card */}
                        <div className="glass-card p-6 animate-fade-in delay-100">
                            <h4 className="font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                🔥 BMR & พลังงาน
                            </h4>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">BMR</span>
                                        <span className="text-xs text-[var(--color-text-muted)]">Basal Metabolic Rate</span>
                                    </div>
                                    <div className="text-3xl font-bold text-orange-600">
                                        {bmrResult.bmr.toLocaleString()}
                                        <span className="text-sm font-normal text-orange-400 ml-1">kcal/วัน</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">TDEE</span>
                                        <span className="text-xs text-[var(--color-text-muted)]">กิจกรรมปานกลาง</span>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {bmrResult.tdee.toLocaleString()}
                                        <span className="text-sm font-normal text-blue-400 ml-1">kcal/วัน</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">เป้าหมายแคลอรี่</span>
                                        {profile.healthGoals.includes('ลดน้ำหนัก') && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">ลด 20%</span>
                                        )}
                                    </div>
                                    <div className="text-3xl font-bold text-green-600">
                                        {bmrResult.targetCalories.toLocaleString()}
                                        <span className="text-sm font-normal text-green-400 ml-1">kcal/วัน</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Macro Targets */}
                        <div className="glass-card p-6 animate-fade-in delay-200">
                            <h4 className="font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                📊 สารอาหารเป้าหมาย/วัน
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>🔴 โปรตีน</span>
                                        <span className="font-medium">{mealPlan.totalProtein}g / {bmrResult.targetProtein}g</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-1000" style={{ width: `${proteinPercent}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>🟡 คาร์โบไฮเดรต</span>
                                        <span className="font-medium">{mealPlan.totalCarbs}g / {bmrResult.targetCarbs}g</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000" style={{ width: `${carbsPercent}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>🟢 ไขมัน</span>
                                        <span className="font-medium">{mealPlan.totalFat}g / {bmrResult.targetFat}g</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000" style={{ width: `${fatPercent}%` }}></div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">🔋 แคลอรี่รวม</span>
                                        <span className="font-bold text-[var(--color-primary)]">
                                            {mealPlan.totalCalories} / {bmrResult.targetCalories} kcal
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${caloriePercent > 100 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]'}`}
                                            style={{ width: `${Math.min(caloriePercent, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1 text-right">
                                        {caloriePercent}% ของเป้าหมาย
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Goals */}
                        <div className="glass-card p-6 animate-fade-in delay-300">
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                🎯 เป้าหมายสุขภาพ
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {profile.healthGoals.map((goal) => (
                                    <span
                                        key={goal}
                                        className="text-xs px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-medium"
                                    >
                                        {goal}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tabs (Meals / Box) */}
                    <div className="lg:col-span-2">
                        {/* Tab Switcher */}
                        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm">
                            <button
                                onClick={() => setActiveTab('meals')}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'meals'
                                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                                    : 'text-[var(--color-text-light)] hover:bg-gray-50'
                                    }`}
                            >
                                🍽️ แผนอาหาร 3 มื้อ + ว่าง
                            </button>
                            <button
                                onClick={() => setActiveTab('box')}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'box'
                                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                                    : 'text-[var(--color-text-light)] hover:bg-gray-50'
                                    }`}
                            >
                                📦 วัตถุดิบในกล่อง
                            </button>
                        </div>

                        {/* Tab Content: Meal Plan */}
                        {activeTab === 'meals' && (
                            <div className="space-y-4 animate-fade-in">
                                {/* Summary Bar */}
                                <div className="glass-card p-4">
                                    <div className="grid grid-cols-4 gap-3 text-center">
                                        <div className="p-2 bg-orange-50 rounded-xl">
                                            <div className="text-lg font-bold text-orange-600">{mealPlan.totalCalories}</div>
                                            <div className="text-xs text-orange-400">kcal</div>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-xl">
                                            <div className="text-lg font-bold text-red-600">{mealPlan.totalProtein}g</div>
                                            <div className="text-xs text-red-400">โปรตีน</div>
                                        </div>
                                        <div className="p-2 bg-yellow-50 rounded-xl">
                                            <div className="text-lg font-bold text-amber-600">{mealPlan.totalCarbs}g</div>
                                            <div className="text-xs text-amber-400">คาร์บ</div>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded-xl">
                                            <div className="text-lg font-bold text-green-600">{mealPlan.totalFat}g</div>
                                            <div className="text-xs text-green-400">ไขมัน</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Meal Cards */}
                                {mealPlan.meals.map((meal, i) => {
                                    const mealInfo = mealTypeLabels[meal.type];
                                    const isExpanded = expandedRecipe === meal.recipe.id;
                                    const mealIngredients = meal.recipe.ingredientIds
                                        .map((id) => ingredients.find((ing) => ing.id === id))
                                        .filter(Boolean);

                                    return (
                                        <div
                                            key={meal.recipe.id}
                                            className="glass-card overflow-hidden animate-fade-in"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            {/* Meal Header */}
                                            <div
                                                className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                                onClick={() => setExpandedRecipe(isExpanded ? null : meal.recipe.id)}
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
                                                            {mealIngredients.map((ing) => (
                                                                <div
                                                                    key={ing!.id}
                                                                    className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm"
                                                                >
                                                                    <span className="text-lg">{ing!.image}</span>
                                                                    <span className="text-xs font-medium">{ing!.name}</span>
                                                                    <span className="text-xs text-[var(--color-text-muted)]">
                                                                        {ing!.calories} kcal/{ing!.servingSize}
                                                                    </span>
                                                                </div>
                                                            ))}
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
                        )}

                        {/* Tab Content: Ingredient Box */}
                        {activeTab === 'box' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="glass-card p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--color-primary-dark)]">
                                                📦 กล่อง Ayura สัปดาห์ที่ {weeklyBox.weekNumber}
                                            </h3>
                                            <p className="text-sm text-[var(--color-text-light)]">
                                                AI เลือกวัตถุดิบ {weeklyBox.ingredients.length} ชิ้นสำหรับคุณ
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-[var(--color-primary)]">
                                                ฿{weeklyBox.totalPrice}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)]">ต่อสัปดาห์</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {weeklyBox.ingredients.map((ingredient, i) => (
                                            <div
                                                key={ingredient.id}
                                                className="flex items-start gap-4 p-4 bg-[var(--color-bg)] rounded-xl hover-lift transition-all group"
                                                style={{ animationDelay: `${i * 100}ms` }}
                                            >
                                                <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    {ingredient.image}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-sm">{ingredient.name}</h4>
                                                        <span className="text-xs px-2 py-0.5 bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] rounded-full">
                                                            {ingredient.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[var(--color-text-light)] mt-1 line-clamp-2">
                                                        {ingredient.benefits}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-muted)]">
                                                        <span>{ingredient.calories} kcal/{ingredient.servingSize}</span>
                                                        <span>P:{ingredient.protein}g</span>
                                                        <span>C:{ingredient.carbs}g</span>
                                                        <span>F:{ingredient.fat}g</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-[var(--color-text-muted)]">
                                                            📍 {ingredient.community}
                                                        </span>
                                                        <span className="text-sm font-bold text-[var(--color-primary)]">
                                                            ฿{ingredient.pricePerUnit}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Match Score */}
                                <div className="glass-card p-6">
                                    <h4 className="font-bold mb-3 flex items-center gap-2">
                                        🤖 AI Match Score
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20">
                                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                                                <circle cx="40" cy="40" r="35" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                                                <circle
                                                    cx="40" cy="40" r="35"
                                                    stroke="var(--color-primary)"
                                                    strokeWidth="6" fill="none" strokeLinecap="round"
                                                    strokeDasharray={`${weeklyBox.matchScore * 2.2} 220`}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-lg font-bold text-[var(--color-primary)]">
                                                    {weeklyBox.matchScore}%
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-[var(--color-text-light)]">
                                                ความเหมาะสมกับ<br />ธาตุและเป้าหมายของคุณ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <Link
                                href="/meal-plan"
                                className="btn-primary flex-1 justify-center !py-4 text-base"
                            >
                                ดูแผนอาหารเต็ม 🍽️
                            </Link>
                            <Link
                                href="/checkout"
                                className="btn-outline flex-1 justify-center !py-4 text-base"
                            >
                                สั่งซื้อกล่อง 🛒
                            </Link>
                            <Link
                                href="/bio-age"
                                className="btn-outline flex-1 justify-center !py-4 text-base"
                            >
                                แต้มสุขภาพ ⭐
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
