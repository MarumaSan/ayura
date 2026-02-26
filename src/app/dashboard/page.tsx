'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'box' | 'meals'>('box');
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
    const [hasMealPlan, setHasMealPlan] = useState<boolean | null>(null);
    const [mealPlanStatus, setMealPlanStatus] = useState<any>(null);
    const [activeMealSet, setActiveMealSet] = useState<any>(null);

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
                        setProfile({ name: sessionData.name || 'ผู้ใช้', age: 30, gender: 'ไม่ระบุ', weight: 60, height: 165, healthGoals: ['รักษาสุขภาพ'] });
                    }

                    // Check meal plan status
                    const planRes = await fetch(`/api/user/meal-plan-status?userId=${sessionData.userId}`);
                    if (planRes.ok) {
                        const planData = await planRes.json();
                        setHasMealPlan(planData.hasMealPlan);
                        if (planData.hasMealPlan) {
                            setMealPlanStatus(planData);
                            if (planData.mealSetId) {
                                const mealSetRes = await fetch(`/api/meal-sets/${planData.mealSetId}`);
                                if (mealSetRes.ok) {
                                    const mealSetData = await mealSetRes.json();
                                    setActiveMealSet(mealSetData.data);
                                }
                            }
                        } else {
                            setHasMealPlan(false);
                        }
                    } else {
                        setHasMealPlan(false);
                    }
                } catch (err) {
                    console.error('Failed to fetch profile', err);
                    setProfile({ name: sessionData.name || 'ผู้ใช้', age: 30, gender: 'ไม่ระบุ', weight: 60, height: 165, healthGoals: ['รักษาสุขภาพ'] });
                    setHasMealPlan(false);
                }
            } else {
                setProfile({ name: 'ผู้ใช้ตัวอย่าง (ยังไม่เข้าระบบ)', age: 30, gender: 'ชาย', weight: 70, height: 170, healthGoals: ['ลดน้ำหนัก', 'เพิ่มภูมิคุ้มกัน'] });
                setHasMealPlan(false);
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

    const bmrResult = { bmr: 1650, tdee: 2557, targetCalories: 2045, targetProtein: 153, targetCarbs: 230, targetFat: 56 };

    const mealTypeLabels: Record<string, { emoji: string; time: string }> = {
        'เช้า': { emoji: '🌅', time: '07:00 - 08:30' },
        'กลางวัน': { emoji: '☀️', time: '12:00 - 13:00' },
        'เย็น': { emoji: '🌙', time: '18:00 - 19:00' },
        'ว่าง': { emoji: '🍵', time: '15:00 - 16:00' },
    };

    const weeks = mealPlanStatus?.plan === 'monthly' ? 4 : 1;

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-2">กล่องสุขภาพของคุณ</h1>
                    <p className="text-[var(--color-text-light)]">ข้อมูลสุขภาพส่วนตัวและวัตถุดิบในกล่อง</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left Column: Profile + Stats ── */}
                    <div className="lg:col-span-1 space-y-5">

                        {/* Profile Card */}
                        <div className="glass-card p-6 animate-fade-in">
                            <div className="flex flex-col items-center text-center mb-5">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-3xl mb-3 shadow-lg">
                                    {profile.gender === 'หญิง' ? '👩' : '👨'}
                                </div>
                                <h3 className="font-bold text-lg">{profile.name}</h3>
                                <p className="text-sm text-[var(--color-text-muted)]">{profile.gender} · อายุ {profile.age} ปี</p>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                                        <div className="text-xl font-bold text-blue-600">{profile.weight}<span className="text-xs font-normal text-blue-400 ml-0.5">kg</span></div>
                                        <div className="text-xs text-blue-400">น้ำหนัก</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                                        <div className="text-xl font-bold text-purple-600">{profile.height}<span className="text-xs font-normal text-purple-400 ml-0.5">cm</span></div>
                                        <div className="text-xs text-purple-400">ส่วนสูง</div>
                                    </div>
                                </div>

                                <div className="bg-[var(--color-bg-section)] rounded-xl p-3 text-center">
                                    <div className="text-2xl font-bold text-[var(--color-primary)]">{bmiValue}</div>
                                    <div className="text-xs text-[var(--color-text-muted)]">BMI · {bmiLabel}</div>
                                </div>
                            </div>

                            {profile.healthGoals?.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs text-[var(--color-text-muted)] mb-2">🎯 เป้าหมายสุขภาพ</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.healthGoals.map((g: string) => (
                                            <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Energy Stats */}
                        <div className="glass-card p-6 animate-fade-in delay-100">
                            <h4 className="font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                🔥 BMR & พลังงาน
                            </h4>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-100">
                                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">BMR</div>
                                    <div className="text-2xl font-bold text-orange-600">{bmrResult.bmr.toLocaleString()}<span className="text-xs font-normal text-orange-400 ml-1">kcal/วัน</span></div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">TDEE</div>
                                    <div className="text-2xl font-bold text-blue-600">{bmrResult.tdee.toLocaleString()}<span className="text-xs font-normal text-blue-400 ml-1">kcal/วัน</span></div>
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                                    <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">เป้าหมายแคลอรี่</div>
                                    <div className="text-2xl font-bold text-green-600">{bmrResult.targetCalories.toLocaleString()}<span className="text-xs font-normal text-green-400 ml-1">kcal/วัน</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Nutrient Targets */}
                        <div className="glass-card p-6 animate-fade-in delay-200">
                            <h4 className="font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                📊 เป้าหมายสารอาหาร/วัน
                            </h4>
                            <div className="space-y-2.5">
                                {[
                                    { label: '🔴 โปรตีน', val: bmrResult.targetProtein, unit: 'g' },
                                    { label: '🟡 คาร์โบไฮเดรต', val: bmrResult.targetCarbs, unit: 'g' },
                                    { label: '🟢 ไขมัน', val: bmrResult.targetFat, unit: 'g' },
                                ].map(({ label, val, unit }) => (
                                    <div key={label} className="flex justify-between text-sm">
                                        <span>{label}</span>
                                        <span className="font-semibold">{val}{unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Health Box ── */}
                    <div className="lg:col-span-2">

                        {/* Loading meal plan status */}
                        {hasMealPlan === null && (
                            <div className="glass-card p-16 flex flex-col items-center gap-4">
                                <div className="text-5xl animate-spin-slow">🌿</div>
                                <p className="text-[var(--color-text-muted)]">กำลังโหลดข้อมูลกล่องสุขภาพ...</p>
                            </div>
                        )}

                        {/* LOCKED: No active meal plan */}
                        {hasMealPlan === false && (
                            <div className="glass-card p-14 flex flex-col items-center justify-center text-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl shadow-inner">
                                    🔒
                                </div>
                                <div>
                                    <h3 className="font-bold text-2xl text-[var(--color-text)] mb-3">กล่องสุขภาพยังไม่ถูกเปิด</h3>
                                    <p className="text-[var(--color-text-light)] max-w-sm text-sm leading-loose">
                                        ซื้อเซ็ตแผนอาหารเพื่อเปิดกล่องสุขภาพและดู:<br />
                                        📦 วัตถุดิบทั้งหมดในกล่อง พร้อมน้ำหนัก<br />
                                        🍽️ เมนูแนะนำพร้อมสูตรอาหารเต็มรูปแบบ
                                    </p>
                                </div>
                                <a
                                    href="/meal-plan"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                                >
                                    เลือกเซ็ตแผนอาหาร ✨
                                </a>
                                <p className="text-xs text-[var(--color-text-muted)]">🚚 จัดส่งฟรีทั่วไทย · ✅ วัตถุดิบออร์แกนิกจากชุมชน</p>
                            </div>
                        )}

                        {/* UNLOCKED: Has active meal plan */}
                        {hasMealPlan === true && activeMealSet && (
                            <>
                                {/* Set Info Banner */}
                                <div className="glass-card p-4 mb-5 flex items-center gap-4 animate-fade-in">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-secondary)]/15 flex items-center justify-center text-2xl">
                                        {activeMealSet.image}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[var(--color-primary-dark)]">{activeMealSet.name}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                {mealPlanStatus?.plan === 'weekly' ? '📅 รายสัปดาห์' : '📦 รายเดือน (4 สัปดาห์)'}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                ✅ {mealPlanStatus?.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tab Switcher */}
                                <div className="flex gap-2 mb-5 bg-white rounded-xl p-1.5 shadow-sm">
                                    <button
                                        onClick={() => setActiveTab('box')}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'box'
                                                ? 'bg-[var(--color-primary)] text-white shadow-md'
                                                : 'text-[var(--color-text-light)] hover:bg-gray-50'
                                            }`}
                                    >
                                        📦 วัตถุดิบในกล่อง
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('meals')}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'meals'
                                                ? 'bg-[var(--color-primary)] text-white shadow-md'
                                                : 'text-[var(--color-text-light)] hover:bg-gray-50'
                                            }`}
                                    >
                                        🍽️ เมนูแนะนำ
                                    </button>
                                </div>

                                {/* Tab: Box Ingredients */}
                                {activeTab === 'box' && (
                                    <div className="space-y-3 animate-fade-in">
                                        <p className="text-xs text-[var(--color-text-muted)] px-1">
                                            วัตถุดิบสดทั้งหมด {activeMealSet.boxIngredients.length} รายการ
                                            {' · '}น้ำหนักสำหรับ {weeks} สัปดาห์
                                        </p>
                                        {activeMealSet.boxIngredients.map((item: any, i: number) => {
                                            const totalGrams = item.gramsPerWeek * weeks;
                                            return (
                                                <div
                                                    key={i}
                                                    className="glass-card p-4 flex items-center gap-4 hover:shadow-sm transition-all"
                                                    style={{ animationDelay: `${i * 50}ms` }}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm">{item.ingredientId}</p>
                                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                                            {item.gramsPerWeek}g / สัปดาห์
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <span className="inline-block px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-bold text-sm">
                                                            {totalGrams}g
                                                        </span>
                                                        {weeks > 1 && (
                                                            <p className="text-xs text-[var(--color-text-muted)] mt-1">รวม {weeks} สัปดาห์</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Tab: Recipes */}
                                {activeTab === 'meals' && (
                                    <div className="space-y-4 animate-fade-in">
                                        {activeMealSet.recipes.map((recipe: any, i: number) => {
                                            const mealInfo = mealTypeLabels[recipe.mealType] || { emoji: '🍽️', time: '' };
                                            const isExpanded = expandedRecipe === `r-${i}`;
                                            return (
                                                <div key={i} className="glass-card overflow-hidden">
                                                    <button
                                                        className="w-full p-5 text-left hover:bg-gray-50/50 transition-colors"
                                                        onClick={() => setExpandedRecipe(isExpanded ? null : `r-${i}`)}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center text-3xl flex-shrink-0">
                                                                {recipe.image}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                                        {mealInfo.emoji} {recipe.mealType}
                                                                    </span>
                                                                    {mealInfo.time && <span className="text-xs text-[var(--color-text-muted)]">{mealInfo.time}</span>}
                                                                </div>
                                                                <h4 className="font-bold text-base">{recipe.name}</h4>
                                                                <div className="flex gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                                                                    <span>⏱️ {recipe.cookTime} นาที</span>
                                                                    <span>🔥 ~{recipe.calories} kcal</span>
                                                                    <span>🏁 {recipe.servings} ที่</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-base text-[var(--color-text-muted)]">
                                                                {isExpanded ? '▲' : '▼'}
                                                            </div>
                                                        </div>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/50 animate-fade-in">
                                                            {/* Ingredients */}
                                                            <div>
                                                                <h5 className="font-semibold text-sm mb-3 text-[var(--color-primary-dark)]">🛒 ส่วนผสม</h5>
                                                                <div className="space-y-2">
                                                                    {recipe.ingredients.map((ing: any, j: number) => (
                                                                        <div key={j} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2">
                                                                            <span className="text-[var(--color-text-light)]">
                                                                                {ing.ingredientId}
                                                                                {ing.note && <span className="text-[var(--color-text-muted)] text-xs ml-1">({ing.note})</span>}
                                                                            </span>
                                                                            <span className="font-semibold text-[var(--color-primary)]">{ing.gramsUsed}g</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Steps */}
                                                            <div>
                                                                <h5 className="font-semibold text-sm mb-3 text-[var(--color-primary-dark)]">📓 ขั้นตอนการปรุง</h5>
                                                                <ol className="space-y-2.5">
                                                                    {recipe.steps.map((step: string, k: number) => (
                                                                        <li key={k} className="flex gap-3 text-sm">
                                                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">
                                                                                {k + 1}
                                                                            </span>
                                                                            <span className="text-[var(--color-text-light)] leading-relaxed">{step}</span>
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
                            </>
                        )}

                        {/* Bottom links */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <Link href="/meal-plan" className="btn-primary flex-1 justify-center !py-3 text-sm">
                                {hasMealPlan ? 'เปลี่ยนแผนอาหาร 🔄' : 'เลือกแผนอาหาร 🍽️'}
                            </Link>
                            <Link href="/bio-age" className="btn-outline flex-1 justify-center !py-3 text-sm">
                                แต้มสุขภาพ ⭐
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
