'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'box' | 'meals'>('meals');
    const [planDuration, setPlanDuration] = useState<'weekly' | 'monthly'>('weekly');
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

    useEffect(() => {
        const loadRealProfile = async () => {
            const stored = localStorage.getItem('ayuraProfile');
            if (stored) {
                const sessionData = JSON.parse(stored);

                try {
                    const res = await fetch(`/api/user/profile?userId=${sessionData.userId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setProfile(data.profile);
                    } else {
                        // Fallback
                        setProfile({
                            name: sessionData.name || 'ผู้ใช้',
                            age: 30,
                            gender: 'ไม่ระบุ',
                            weight: 60,
                            height: 165,
                            healthGoals: ['รักษาสุขภาพ']
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch profile", err);
                    setProfile({
                        name: sessionData.name || 'ผู้ใช้',
                        age: 30,
                        gender: 'ไม่ระบุ',
                        weight: 60,
                        height: 165,
                        healthGoals: ['รักษาสุขภาพ']
                    });
                }
            } else {
                setProfile({
                    name: 'ผู้ใช้ตัวอย่าง (ยังไม่เข้าระบบ)',
                    age: 30,
                    gender: 'ชาย',
                    weight: 70,
                    height: 170,
                    healthGoals: ['ลดน้ำหนัก', 'เพิ่มภูมิคุ้มกัน'],
                });
            }
        };
        loadRealProfile();
    }, []);

    if (!profile) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-spin-slow mb-4">🌿</div>
                    <p className="text-[var(--color-text-light)]">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    const heightM = profile.height / 100;
    const bmiValue = Math.round((profile.weight / (heightM * heightM)) * 10) / 10;
    let bmiLabel = '';
    if (bmiValue < 18.5) bmiLabel = 'น้ำหนักต่ำกว่าเกณฑ์';
    else if (bmiValue < 23) bmiLabel = 'น้ำหนักปกติ';
    else if (bmiValue < 25) bmiLabel = 'น้ำหนักเกิน';
    else bmiLabel = 'โรคอ้วน';

    const bmi = { bmi: bmiValue, label: bmiLabel };

    // Static data placeholders
    const bmrResult = { bmr: 1650, tdee: 2557, targetCalories: 2045, targetProtein: 153, targetCarbs: 230, targetFat: 56 };
    const scaledBoxSets = [
        {
            boxSet: { id: 'set-1', name: 'เซ็ตลดน้ำหนัก', description: 'เซ็ตวัตถุดิบสำหรับคนที่ต้องการลดน้ำหนัก', image: '🥗' },
            multiplier: 1.5,
            totalPrice: 450,
            totalCalories: 2100,
            totalProtein: 130,
            totalCarbs: 200,
            totalFat: 50,
            scaledItems: [
                { ingredientId: 'i1', ingredientName: 'อกไก่ออร์แกนิก', scaledGrams: 300, baseGrams: 200, scaledPrice: 280, image: '🍗' },
                { ingredientId: 'i2', ingredientName: 'ผักเชียงดา', scaledGrams: 200, baseGrams: 150, scaledPrice: 80, image: '🥬' }
            ]
        }
    ];

    const selectedScaledSet = scaledBoxSets[0];
    const durationMultiplier = planDuration === 'monthly' ? 4 : 1;

    const mealPlan = {
        totalCalories: 1950,
        totalProtein: 145,
        totalCarbs: 210,
        totalFat: 52,
        meals: [
            { type: 'เช้า', recipe: { id: 'r1', name: 'อกไก่ย่าง', description: 'อกไก่ย่างนุ่มๆ', calories: 450, protein: 40, carbs: 30, fat: 12, cookTime: '20 นาที', image: '🍗', items: [], instructions: [] } },
            { type: 'กลางวัน', recipe: { id: 'r2', name: 'ข้าวแกงส้ม', description: 'แกงส้มผักรวม', calories: 600, protein: 35, carbs: 70, fat: 15, cookTime: '30 นาที', image: '🍲', items: [], instructions: [] } }
        ]
    };

    const mealTypeLabels: Record<string, { label: string; emoji: string; time: string }> = {
        'เช้า': { label: 'มื้อเช้า', emoji: '🌅', time: '07:00 - 08:30' },
        'กลางวัน': { label: 'มื้อกลางวัน', emoji: '☀️', time: '12:00 - 13:00' },
        'เย็น': { label: 'มื้อเย็น', emoji: '🌙', time: '18:00 - 19:00' },
        'ว่าง': { label: 'อาหารว่าง', emoji: '🍵', time: '15:00 - 16:00' },
    };

    const caloriePercent = Math.min(100, Math.round((mealPlan.totalCalories / bmrResult.targetCalories) * 100));
    const proteinPercent = Math.min(100, Math.round((mealPlan.totalProtein / bmrResult.targetProtein) * 100));
    const carbsPercent = Math.min(100, Math.round((mealPlan.totalCarbs / bmrResult.targetCarbs) * 100));
    const fatPercent = Math.min(100, Math.round((mealPlan.totalFat / bmrResult.targetFat) * 100));

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-2">กล่องสุขภาพของคุณ</h1>
                    <p className="text-[var(--color-text-light)]">ข้อมูลจำลองแบบ Static (ลบระบบหลังบ้านแล้ว)</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="glass-card p-6 animate-fade-in">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <span className="text-sm text-[var(--color-text-light)]">ชื่อ</span>
                                    <span className="font-medium">{profile.name}</span>
                                </div>
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
                                    </div>
                                    <div className="text-3xl font-bold text-orange-600">
                                        {bmrResult.bmr.toLocaleString()}
                                        <span className="text-sm font-normal text-orange-400 ml-1">kcal/วัน</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">TDEE</span>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {bmrResult.tdee.toLocaleString()}
                                        <span className="text-sm font-normal text-blue-400 ml-1">kcal/วัน</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">เป้าหมายแคลอรี่</span>
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
                                        <span className="font-medium">{Number(mealPlan.totalProtein.toFixed(1))}g / {bmrResult.targetProtein}g</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-1000" style={{ width: `${proteinPercent}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>🟡 คาร์โบไฮเดรต</span>
                                        <span className="font-medium">{Number(mealPlan.totalCarbs.toFixed(1))}g / {bmrResult.targetCarbs}g</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000" style={{ width: `${carbsPercent}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>🟢 ไขมัน</span>
                                        <span className="font-medium">{Number(mealPlan.totalFat.toFixed(1))}g / {bmrResult.targetFat}g</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000" style={{ width: `${fatPercent}%` }}></div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-[var(--color-bg-section)] rounded-xl">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">🔋 แคลอรี่รวม</span>
                                        <span className="font-bold text-[var(--color-primary)]">
                                            {Number(mealPlan.totalCalories.toFixed(1))} / {bmrResult.targetCalories} kcal
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]`}
                                            style={{ width: `${Math.min(caloriePercent, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1 text-right">
                                        {caloriePercent}% ของเป้าหมาย
                                    </p>
                                </div>
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
                                            <div className="text-lg font-bold text-orange-600">{Number(mealPlan.totalCalories.toFixed(1))}</div>
                                            <div className="text-xs text-orange-400">kcal</div>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-xl">
                                            <div className="text-lg font-bold text-red-600">{Number(mealPlan.totalProtein.toFixed(1))}g</div>
                                            <div className="text-xs text-red-400">โปรตีน</div>
                                        </div>
                                        <div className="p-2 bg-yellow-50 rounded-xl">
                                            <div className="text-lg font-bold text-amber-600">{Number(mealPlan.totalCarbs.toFixed(1))}g</div>
                                            <div className="text-xs text-amber-400">คาร์บ</div>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded-xl">
                                            <div className="text-lg font-bold text-green-600">{Number(mealPlan.totalFat.toFixed(1))}g</div>
                                            <div className="text-xs text-green-400">ไขมัน</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Meal Cards */}
                                {mealPlan.meals.map((meal, i) => {
                                    const mealInfo = mealTypeLabels[meal.type];
                                    const isExpanded = expandedRecipe === meal.recipe.id;

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
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Tab Content: Box Set Picker */}
                        {activeTab === 'box' && selectedScaledSet && (
                            <div className="space-y-4 animate-fade-in">
                                {/* Duration Toggle */}
                                <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-sm">
                                    <button
                                        onClick={() => setPlanDuration('weekly')}
                                        className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${planDuration === 'weekly'
                                            ? 'bg-[var(--color-secondary)] text-white shadow-md'
                                            : 'text-[var(--color-text-light)] hover:bg-gray-50'
                                            }`}
                                    >
                                        📅 รายสัปดาห์ (1 สัปดาห์)
                                    </button>
                                    <button
                                        onClick={() => setPlanDuration('monthly')}
                                        className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${planDuration === 'monthly'
                                            ? 'bg-[var(--color-secondary)] text-white shadow-md'
                                            : 'text-[var(--color-text-light)] hover:bg-gray-50'
                                            }`}
                                    >
                                        📦 รายเดือน (4 สัปดาห์)
                                    </button>
                                </div>

                                {/* Selected Set Details */}
                                <div className="glass-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--color-primary-dark)]">
                                                {selectedScaledSet.boxSet.image} {selectedScaledSet.boxSet.name}
                                            </h3>
                                            <p className="text-sm text-[var(--color-text-light)]">
                                                ปรับตาม TDEE ของคุณ • ตัวคูณ ×{selectedScaledSet.multiplier}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-[var(--color-primary)]">
                                                ฿{Math.round(selectedScaledSet.totalPrice * durationMultiplier)}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-muted)]">
                                                {planDuration === 'monthly' ? '4 สัปดาห์' : 'ต่อสัปดาห์'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nutrition Summary */}
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        <div className="p-2 bg-orange-50 rounded-lg text-center">
                                            <div className="text-sm font-bold text-orange-600">{Math.round(selectedScaledSet.totalCalories)}</div>
                                            <div className="text-[10px] text-orange-400">kcal</div>
                                        </div>
                                        <div className="p-2 bg-red-50 rounded-lg text-center">
                                            <div className="text-sm font-bold text-red-600">{selectedScaledSet.totalProtein}g</div>
                                            <div className="text-[10px] text-red-400">โปรตีน</div>
                                        </div>
                                        <div className="p-2 bg-yellow-50 rounded-lg text-center">
                                            <div className="text-sm font-bold text-amber-600">{selectedScaledSet.totalCarbs}g</div>
                                            <div className="text-[10px] text-amber-400">คาร์บ</div>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded-lg text-center">
                                            <div className="text-sm font-bold text-green-600">{selectedScaledSet.totalFat}g</div>
                                            <div className="text-[10px] text-green-400">ไขมัน</div>
                                        </div>
                                    </div>

                                    {/* Ingredient List */}
                                    <div className="space-y-3">
                                        {selectedScaledSet.scaledItems.map((item, i) => (
                                            <div
                                                key={item.ingredientId}
                                                className="flex items-center gap-4 p-3 bg-[var(--color-bg)] rounded-xl hover:shadow-sm transition-all"
                                                style={{ animationDelay: `${i * 50}ms` }}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-2xl flex-shrink-0">
                                                    {item.image}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-sm">{item.ingredientName}</h4>
                                                        <span className="text-xs px-2 py-0.5 bg-[var(--color-primary)]/15 text-[var(--color-primary)] rounded-full font-semibold">
                                                            {item.scaledGrams}g
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-sm font-bold text-[var(--color-primary)]">
                                                        ฿{Math.round(item.scaledPrice * durationMultiplier)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
