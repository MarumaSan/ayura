'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { calcBMI, getBmiCategory, calcBMR, calcTDEE, calcCalorieTarget, calcMacroTargets } from '@/lib/bmiCalculator';

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'meals' | 'box'>('meals');
    const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
    const [hasMealPlan, setHasMealPlan] = useState<boolean | null>(null);
    const [mealPlanStatus, setMealPlanStatus] = useState<any>(null);
    const [activeMealSet, setActiveMealSet] = useState<any>(null);
    const [ingredientsMap, setIngredientsMap] = useState<Record<string, any>>({});
    const [dailyMenu, setDailyMenu] = useState<any>(null);

    // Helper to safely parse different date formats (including DD/MM/YYYY from mock data)
    const parseDeliveryDate = (dateStr: string) => {
        if (!dateStr) return null;
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3 && parts[2].length === 4) {
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
            }
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    useEffect(() => {
        const loadRealProfile = async () => {
            const stored = localStorage.getItem('ayuraProfile');
            if (stored) {
                const sessionData = JSON.parse(stored);
                const userId = sessionData.userId || sessionData.id;

                try {
                    const res = await fetch(`/api/user/profile?userId=${userId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setProfile(data.profile);
                    } else {
                        setProfile({ name: sessionData.name || 'ผู้ใช้', age: 30, gender: 'ไม่ระบุ', weight: 60, height: 165, healthGoals: ['รักษาสุขภาพ'] });
                    }

                    // Check meal plan status
                    const planRes = await fetch(`/api/user/meal-plan-status?userId=${userId}`);
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
                                // Fetch daily menu
                                if (planData.isApproved) {
                                    const menuRes = await fetch(`/api/user/daily-menu?mealSetId=${planData.mealSetId}`);
                                    if (menuRes.ok) {
                                        const menuData = await menuRes.json();
                                        setDailyMenu(menuData.menu);
                                    }
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
            }
        };

        const loadIngredients = async () => {
            try {
                const res = await fetch('/api/ingredients');
                if (res.ok) {
                    const data = await res.json();
                    const map: Record<string, any> = {};
                    data.data.forEach((ing: any) => {
                        map[ing.id] = ing;
                    });
                    setIngredientsMap(map);
                }
            } catch (err) {
                console.error('Failed to fetch ingredients', err);
            }
        };

        loadRealProfile();
        loadIngredients();
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

    const bmiValue = calcBMI(profile.weight, profile.height);
    const bmiCat = getBmiCategory(bmiValue);
    let bmiLabel = '';
    if (bmiCat === 'underweight') bmiLabel = 'น้ำหนักต่ำกว่าเกณฑ์';
    else if (bmiCat === 'normal') bmiLabel = 'น้ำหนักปกติ';
    else bmiLabel = 'น้ำหนักเกิน';

    const userGender = profile.gender || 'ชาย';
    const userGoals: string[] = profile.healthGoals || ['รักษาสุขภาพ'];
    const bmrVal = Math.round(calcBMR(profile.weight, profile.height, profile.age, userGender));
    const tdeeVal = calcTDEE(profile.weight, profile.height, profile.age, userGender);
    const targetCal = calcCalorieTarget(tdeeVal, userGoals);
    const macroTargets = calcMacroTargets(targetCal, userGoals);
    const bmrResult = { bmr: bmrVal, tdee: tdeeVal, targetCalories: targetCal, targetProtein: macroTargets.protein, targetCarbs: macroTargets.carbs, targetFat: macroTargets.fat };

    const mealTypeLabels: Record<string, { emoji: string; time: string }> = {
        'เช้า': { emoji: '🌅', time: '07:00 - 08:30' },
        'กลางวัน': { emoji: '☀️', time: '12:00 - 13:00' },
        'เย็น': { emoji: '🌙', time: '18:00 - 19:00' },
        'ว่าง': { emoji: '🍵', time: '15:00 - 16:00' },
    };

    // Determine the current order state
    const orderStatus = mealPlanStatus?.status;
    const isPaymentPending = orderStatus === 'รอยืนยันการชำระเงิน';
    const isPending = orderStatus === 'รออนุมัติ' || isPaymentPending;
    const isVerified = ['รอจัดส่ง', 'กำลังขนส่ง'].includes(orderStatus);
    const isDelivered = ['จัดส่งสำเร็จ'].includes(orderStatus);

    // Nutrition Helpers
    const getRecipeNutrition = (menu: any) => {
        let cal = 0, pro = 0, car = 0, fat = 0;
        if (!menu || !menu.ingredients) return { cal: 0, pro: 0, car: 0, fat: 0 };
        menu.ingredients.forEach((ing: any) => {
            const item = ingredientsMap[ing.ingredientId];
            if (item) {
                const ratio = ing.gramsUsed / 100;
                cal += item.calories100g * ratio;
                pro += item.protein100g * ratio;
                car += item.carbs100g * ratio;
                fat += item.fat100g * ratio;
            }
        });
        return { cal: Math.round(cal), pro: Math.round(pro), car: Math.round(car), fat: Math.round(fat) };
    };

    const getDailyNutrition = (dailyMenu: any) => {
        let tCal = 0, tPro = 0, tCar = 0, tFat = 0;
        if (!dailyMenu || Object.keys(ingredientsMap).length === 0) return null;
        ['breakfast', 'lunch', 'dinner'].forEach(k => {
            if (dailyMenu[k]) {
                const n = getRecipeNutrition(dailyMenu[k]);
                tCal += n.cal;
                tPro += n.pro;
                tCar += n.car;
                tFat += n.fat;
            }
        });
        return { cal: tCal, pro: tPro, car: tCar, fat: tFat };
    };

    const dailyTotalNutrients = getDailyNutrition(dailyMenu);

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

                            {(profile.healthGoals || []).length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs text-[var(--color-text-muted)] mb-2">🎯 เป้าหมายสุขภาพ</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(profile.healthGoals || []).map((g: string) => (
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
                                    { emoji: '🔴', label: 'โปรตีน', val: bmrResult.targetProtein, unit: 'g' },
                                    { emoji: '🟡', label: 'คาร์โบไฮเดรต', val: bmrResult.targetCarbs, unit: 'g' },
                                    { emoji: '🟢', label: 'ไขมัน', val: bmrResult.targetFat, unit: 'g' },
                                ].map(({ emoji, label, val, unit }) => (
                                    <div key={label} className="flex justify-between items-center text-sm py-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base leading-none">{emoji}</span>
                                            <span className="leading-none text-[var(--color-text-light)]">{label}</span>
                                        </div>
                                        <span className="font-semibold leading-none text-[var(--color-text)]">{val}{unit}</span>
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

                        {/* ══ STATE 1: No active order ══ */}
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
                                <p className="text-xs text-[var(--color-text-muted)]">🚚 จัดส่งทั่วไทย · ✅ วัตถุดิบออร์แกนิกจากชุมชน</p>
                            </div>
                        )}

                        {/* ══ STATE 2: Pending Approval (รออนุมัติ) ══ */}
                        {hasMealPlan === true && isPending && activeMealSet && (
                            <div className="space-y-5 animate-fade-in">
                                {/* Set Info Banner */}
                                <div className="glass-card p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-secondary)]/15 flex items-center justify-center text-2xl">
                                        {activeMealSet.image}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[var(--color-primary-dark)] text-lg">{activeMealSet.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] px-2 py-0.5 rounded">
                                                ไซส์ {mealPlanStatus?.boxSize || 'M'}
                                            </span>
                                            <span className="text-sm text-[var(--color-text-muted)]">
                                                {mealPlanStatus?.plan === 'weekly' ? '📅 รายสัปดาห์ (7 วัน)' : '📦 รายเดือน (30 วัน)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Card */}
                                <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-4 bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
                                    <div className="text-5xl mb-2 animate-pulse">⏳</div>
                                    <h3 className="font-bold text-xl text-[var(--color-primary-dark)]">
                                        {isPaymentPending ? 'รอตรวจสอบการชำระเงิน' : 'รอตรวจสอบและอนุมัติ'}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-light)] max-w-sm">
                                        {isPaymentPending
                                            ? 'Admin กำลังตรวจสอบยอดโอนเงินของคุณ เมื่อยืนยันเรียบร้อยจะเปลี่ยนสถานะเป็นรออนุมัติคำสั่งซื้อ'
                                            : 'ออเดอร์ของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ เมื่อการตรวจสอบเสร็จสิ้น คุณจะสามารถเข้าถึงรายละเอียดวัตถุดิบและเมนูแนะนำประจำวันได้ที่นี่'
                                        }
                                    </p>
                                    <div className={`mt-2 px-4 py-2 rounded-lg text-xs font-medium ${isPaymentPending ? 'bg-orange-50 border border-orange-200 text-orange-700' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'}`}>
                                        สถานะ: {isPaymentPending ? 'รอยืนยันการชำระเงิน' : 'รออนุมัติ'}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-md">
                                        <div className="bg-white rounded-xl p-3 border border-[var(--color-border)]">
                                            <p className="text-xs text-[var(--color-text-muted)] mb-1">📅 วันที่สั่งซื้อ</p>
                                            <p className="font-semibold text-sm">
                                                {mealPlanStatus?.orderDate ? new Date(mealPlanStatus.orderDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ไม่ระบุ'}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 border border-[var(--color-border)]">
                                            <p className="text-xs text-[var(--color-text-muted)] mb-1">💰 ยอดชำระ</p>
                                            <p className="font-semibold text-sm text-[var(--color-primary)]">
                                                ฿{(mealPlanStatus?.totalPrice || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ STATE 3: Verified / Preparing (รอจัดส่ง / กำลังขนส่ง) ══ */}
                        {hasMealPlan === true && isVerified && activeMealSet && (
                            <>
                                {/* Set Info Banner */}
                                <div className="glass-card p-4 mb-5 flex items-center gap-4 animate-fade-in">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-secondary)]/15 flex items-center justify-center text-2xl">
                                        {activeMealSet.image}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[var(--color-primary-dark)] text-lg">{activeMealSet.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] px-2 py-0.5 rounded">
                                                ไซส์ {mealPlanStatus?.boxSize || 'M'}
                                            </span>
                                            <span className="text-sm text-[var(--color-text-muted)]">
                                                {mealPlanStatus?.plan === 'weekly' ? '📅 รายสัปดาห์' : '📦 รายเดือน'}
                                            </span>
                                            <span className="text-sm px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                📋 {mealPlanStatus?.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                    <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] shadow-sm">
                                        <p className="text-xs text-[var(--color-text-muted)] mb-1">📅 วันที่สั่งซื้อ</p>
                                        <p className="font-semibold text-sm">
                                            {mealPlanStatus?.orderDate ? new Date(mealPlanStatus.orderDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ไม่ระบุ'}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] shadow-sm">
                                        <p className="text-xs text-[var(--color-text-muted)] mb-1">🚚 วันที่จัดส่งโดยประมาณ</p>
                                        <p className="font-semibold text-sm text-[var(--color-primary)]">
                                            ประมาณ 1 - 3 วันทำการ
                                        </p>
                                    </div>
                                </div>

                                {/* Tab Switcher */}
                                <div className="flex gap-2 mb-5 bg-white rounded-xl p-1.5 shadow-sm">
                                    <button
                                        onClick={() => setActiveTab('meals')}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'meals'
                                            ? 'bg-[var(--color-primary)] text-white shadow-md'
                                            : 'text-[var(--color-text-light)] hover:bg-gray-50'
                                            }`}
                                    >
                                        🍽️ เมนูแนะนำวันนี้
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

                                {/* Tab: Box Ingredients */}
                                {activeTab === 'box' && (
                                    <div className="space-y-3 animate-fade-in">
                                        <p className="text-xs text-[var(--color-text-muted)] px-1">
                                            วัตถุดิบสดทั้งหมด {activeMealSet.boxIngredients.length} รายการ
                                            {' · '} แสดงน้ำหนักต่อ 1 สัปดาห์ (คูณตามไซส์ {mealPlanStatus?.boxSize || 'M'})
                                        </p>
                                        {activeMealSet.boxIngredients.map((item: any, i: number) => {
                                            const baseMultiplier = mealPlanStatus?.sizeMultiplier || 1.0;
                                            const weeklyGrams = Math.round(item.gramsPerWeek * baseMultiplier);
                                            return (
                                                <div key={i} className="glass-card p-4 flex items-center gap-4 hover:shadow-sm transition-all bg-white/70" style={{ animationDelay: `${i * 50}ms` }}>
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                                                        {ingredientsMap[item.ingredientId]?.image || '📦'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-[var(--color-text)]">{ingredientsMap[item.ingredientId]?.name || item.ingredientId}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <span className="inline-block px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-bold text-sm">
                                                            {weeklyGrams}g
                                                        </span>
                                                        <p className="text-[10px] text-[var(--color-text-muted)] mt-1 tracking-wide uppercase">ต่อสัปดาห์</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Tab: Dynamic Daily Menu */}
                                {activeTab === 'meals' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                                            <div>
                                                <p className="font-bold text-[var(--color-primary-dark)]">🍽️ เมนูแนะนำวันนี้</p>
                                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">เปลี่ยนทุกวัน ไม่ซ้ำกับเมื่อวาน</p>
                                            </div>
                                            {dailyTotalNutrients && (
                                                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs font-medium">
                                                    <div className="flex items-center bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-100 shadow-sm">
                                                        <span className="leading-none">🔥</span> <span className="text-base font-bold ml-1 leading-none">{dailyTotalNutrients.cal}</span> <span className="ml-1 text-[10px] leading-none">kcal</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-1.5 rounded-lg border border-blue-100 shadow-sm leading-none">
                                                            <span className="mr-1">💪</span> P: {dailyTotalNutrients.pro}g
                                                        </span>
                                                        <span className="flex items-center bg-green-50 text-green-700 px-2 py-1.5 rounded-lg border border-green-100 shadow-sm leading-none">
                                                            <span className="mr-1">🌾</span> C: {dailyTotalNutrients.car}g
                                                        </span>
                                                        <span className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1.5 rounded-lg border border-yellow-100 shadow-sm leading-none">
                                                            <span className="mr-1">🥑</span> F: {dailyTotalNutrients.fat}g
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {dailyMenu ? (
                                            <>
                                                {[
                                                    { key: 'breakfast', label: 'เช้า', menu: dailyMenu.breakfast },
                                                    { key: 'lunch', label: 'กลางวัน', menu: dailyMenu.lunch },
                                                    { key: 'dinner', label: 'เย็น', menu: dailyMenu.dinner },
                                                ].map(({ key, label, menu }) => {
                                                    if (!menu) return null;
                                                    const mealInfo = mealTypeLabels[label] || { emoji: '🍽️', time: '' };
                                                    const isExpanded = expandedRecipe === key;
                                                    const recipeNutrients = getRecipeNutrition(menu);
                                                    return (
                                                        <div key={key} className="glass-card overflow-hidden">
                                                            <button
                                                                className="w-full p-5 text-left hover:bg-gray-50/50 transition-colors"
                                                                onClick={() => setExpandedRecipe(isExpanded ? null : key)}
                                                            >
                                                                <div className="flex items-start gap-4">
                                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center text-3xl flex-shrink-0">
                                                                        {menu.image}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                                                {mealInfo.emoji} {label}
                                                                            </span>
                                                                            {mealInfo.time && <span className="text-xs text-[var(--color-text-muted)]">{mealInfo.time}</span>}
                                                                        </div>
                                                                        <h4 className="font-bold text-base">{menu.name}</h4>
                                                                        <div className="flex gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                                                                            <span>⏱️ {menu.cookTime} นาที</span>
                                                                            <span>🔥 ~{menu.calories} kcal</span>
                                                                            <span>🏁 {menu.servings} ที่</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-base text-[var(--color-text-muted)]">
                                                                        {isExpanded ? '▲' : '▼'}
                                                                    </div>
                                                                </div>
                                                            </button>

                                                            {isExpanded && (
                                                                <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/50 animate-fade-in">
                                                                    {/* Meal Nutrition Info */}
                                                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)]">
                                                                        <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                                                            📊 สารอาหารรวมมื้อนี้
                                                                        </h5>
                                                                        <div className="grid grid-cols-4 gap-3 text-center">
                                                                            <div className="bg-orange-50 rounded-lg p-2 flex flex-col items-center">
                                                                                <span className="text-xs text-orange-400 mb-0.5 tracking-wide">CAL</span>
                                                                                <span className="font-bold text-orange-600 font-mono">{recipeNutrients.cal}</span>
                                                                            </div>
                                                                            <div className="bg-blue-50 rounded-lg p-2 flex flex-col items-center">
                                                                                <span className="text-xs text-blue-400 mb-0.5 tracking-wide">PRO</span>
                                                                                <span className="font-bold text-blue-600 font-mono">{recipeNutrients.pro}g</span>
                                                                            </div>
                                                                            <div className="bg-green-50 rounded-lg p-2 flex flex-col items-center">
                                                                                <span className="text-xs text-green-400 mb-0.5 tracking-wide">CARB</span>
                                                                                <span className="font-bold text-green-600 font-mono">{recipeNutrients.car}g</span>
                                                                            </div>
                                                                            <div className="bg-yellow-50 rounded-lg p-2 flex flex-col items-center">
                                                                                <span className="text-xs text-yellow-500 mb-0.5 tracking-wide">FAT</span>
                                                                                <span className="font-bold text-yellow-600 font-mono">{recipeNutrients.fat}g</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <h5 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[var(--color-primary-dark)]">🛒 ส่วนผสม</h5>
                                                                        <div className="space-y-2">
                                                                            {(menu.ingredients || []).map((ing: any, j: number) => {
                                                                                const ingItem = ingredientsMap[ing.ingredientId];
                                                                                return (
                                                                                    <div key={j} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-50 hover:border-[var(--color-primary-light)] transition-colors">
                                                                                        <span className="text-[var(--color-text-light)] flex items-center gap-2">
                                                                                            <span className="text-base">{ingItem?.image || '🔸'}</span>
                                                                                            <span className="font-medium text-[var(--color-text)]">{ingItem?.name || ing.ingredientId}</span>
                                                                                            {ing.note && <span className="text-[var(--color-text-muted)] text-xs ml-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{ing.note}</span>}
                                                                                        </span>
                                                                                        <span className="font-bold text-[var(--color-primary)] font-mono bg-[var(--color-primary)]/5 px-2 py-0.5 rounded-lg">{ing.gramsUsed}g</span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="font-semibold text-sm mb-3 text-[var(--color-primary-dark)]">📓 ขั้นตอนการปรุง</h5>
                                                                        <ol className="space-y-2.5">
                                                                            {(menu.steps || []).map((step: string, k: number) => (
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
                                            </>
                                        ) : (
                                            <div className="glass-card p-8 text-center">
                                                <div className="text-4xl mb-3">🍽️</div>
                                                <p className="text-[var(--color-text-muted)]">กำลังโหลดเมนูแนะนำ...</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ══ STATE 4: Delivered (จัดส่งสำเร็จ) ══ */}
                        {hasMealPlan === true && isDelivered && activeMealSet && (
                            <>
                                {/* Set Info Banner */}
                                <div className="glass-card p-4 mb-5 flex items-center gap-4 animate-fade-in">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-secondary)]/15 flex items-center justify-center text-2xl">
                                        {activeMealSet.image}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-[var(--color-primary-dark)] text-lg">{activeMealSet.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] px-2 py-0.5 rounded">
                                                ไซส์ {mealPlanStatus?.boxSize || 'M'}
                                            </span>
                                            <span className="text-sm px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                                                ✅ จัดส่งสำเร็จ
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Info + Countdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                    <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] shadow-sm">
                                        <p className="text-xs text-[var(--color-text-muted)] mb-1">✅ วันที่จัดส่งสำเร็จ</p>
                                        <p className="font-semibold text-sm">
                                            {(() => {
                                                if (!mealPlanStatus?.deliveredAt && !mealPlanStatus?.deliveryDate) return 'ไม่ระบุ';
                                                const d = new Date(mealPlanStatus.deliveredAt || mealPlanStatus.deliveryDate);
                                                return isNaN(d.getTime()) ? 'ไม่ระบุ' : d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
                                            })()}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-xl p-4 border border-[var(--color-primary)]/20 shadow-sm">
                                        <p className="text-xs text-[var(--color-text-muted)] mb-1">⏳ ระยะเวลาเหลือ</p>
                                        <p className="font-bold text-2xl text-[var(--color-primary)]">
                                            {mealPlanStatus?.remainingDays != null ? `${mealPlanStatus.remainingDays} วัน` : 'ไม่ระบุ'}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                            {mealPlanStatus?.plan === 'weekly' ? 'แผน 7 วัน' : 'แผน 30 วัน'}
                                        </p>
                                    </div>
                                </div>

                                {/* Tab Switcher */}
                                <div className="flex gap-2 mb-5 bg-white rounded-xl p-1.5 shadow-sm">
                                    <button
                                        onClick={() => setActiveTab('meals')}
                                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${activeTab === 'meals'
                                            ? 'bg-[var(--color-primary)] text-white shadow-md'
                                            : 'text-[var(--color-text-light)] hover:bg-gray-50'
                                            }`}
                                    >
                                        🍽️ เมนูที่ได้ทานวันนี้
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

                                {/* Tab: Box Ingredients */}
                                {activeTab === 'box' && (
                                    <div className="space-y-3 animate-fade-in">
                                        <p className="text-xs text-[var(--color-text-muted)] px-1">
                                            วัตถุดิบสดทั้งหมด {activeMealSet.boxIngredients.length} รายการ
                                        </p>
                                        {activeMealSet.boxIngredients.map((item: any, i: number) => {
                                            const baseMultiplier = mealPlanStatus?.sizeMultiplier || 1.0;
                                            const weeklyGrams = Math.round(item.gramsPerWeek * baseMultiplier);
                                            return (
                                                <div key={i} className="glass-card p-4 flex items-center gap-4 hover:shadow-sm transition-all bg-white/70">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                                                        {ingredientsMap[item.ingredientId]?.image || '📦'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-[var(--color-text)]">{ingredientsMap[item.ingredientId]?.name || item.ingredientId}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <span className="inline-block px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full font-bold text-sm">
                                                            {weeklyGrams}g
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Tab: Dynamic Daily Menu */}
                                {activeTab === 'meals' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <p className="text-xs text-[var(--color-text-muted)] px-1">
                                            🍽️ เมนูแนะนำวันนี้ — เปลี่ยนทุกวัน ไม่ซ้ำกับเมื่อวาน
                                        </p>
                                        {dailyMenu ? (
                                            <>
                                                {[
                                                    { key: 'breakfast', label: 'เช้า', menu: dailyMenu.breakfast },
                                                    { key: 'lunch', label: 'กลางวัน', menu: dailyMenu.lunch },
                                                    { key: 'dinner', label: 'เย็น', menu: dailyMenu.dinner },
                                                ].map(({ key, label, menu }) => {
                                                    if (!menu) return null;
                                                    const mealInfo = mealTypeLabels[label] || { emoji: '🍽️', time: '' };
                                                    const isExpanded2 = expandedRecipe === key;
                                                    return (
                                                        <div key={key} className="glass-card overflow-hidden">
                                                            <button
                                                                className="w-full p-5 text-left hover:bg-gray-50/50 transition-colors"
                                                                onClick={() => setExpandedRecipe(isExpanded2 ? null : key)}
                                                            >
                                                                <div className="flex items-start gap-4">
                                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center text-3xl flex-shrink-0">
                                                                        {menu.image}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                                                {mealInfo.emoji} {label}
                                                                            </span>
                                                                        </div>
                                                                        <h4 className="font-bold text-base">{menu.name}</h4>
                                                                        <div className="flex gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                                                                            <span>⏱️ {menu.cookTime} นาที</span>
                                                                            <span>🔥 ~{menu.calories} kcal</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-base text-[var(--color-text-muted)]">
                                                                        {isExpanded2 ? '▲' : '▼'}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                            {isExpanded2 && (
                                                                <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/50 animate-fade-in">
                                                                    <div>
                                                                        <h5 className="font-semibold text-sm mb-3 text-[var(--color-primary-dark)]">🛒 ส่วนผสม</h5>
                                                                        <div className="space-y-2">
                                                                            {(menu.ingredients || []).map((ing: any, j: number) => (
                                                                                <div key={j} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2">
                                                                                    <span className="text-[var(--color-text-light)] flex items-center gap-2">
                                                                                        <span className="text-base">{ingredientsMap[ing.ingredientId]?.image || '🔸'}</span>
                                                                                        {ingredientsMap[ing.ingredientId]?.name || ing.ingredientId}
                                                                                    </span>
                                                                                    <span className="font-semibold text-[var(--color-primary)]">{ing.gramsUsed}g</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="font-semibold text-sm mb-3 text-[var(--color-primary-dark)]">📓 ขั้นตอนการปรุง</h5>
                                                                        <ol className="space-y-2.5">
                                                                            {(menu.steps || []).map((s: string, k: number) => (
                                                                                <li key={k} className="flex gap-3 text-sm">
                                                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">{k + 1}</span>
                                                                                    <span className="text-[var(--color-text-light)] leading-relaxed">{s}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ol>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            <div className="glass-card p-8 text-center">
                                                <div className="text-4xl mb-3">🍽️</div>
                                                <p className="text-[var(--color-text-muted)]">กำลังโหลดเมนูแนะนำ...</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Bottom links */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <Link href="/meal-plan" className="btn-primary flex-1 justify-center !py-3 text-sm">
                                {hasMealPlan ? 'จัดการแผนอาหาร 📋' : 'เลือกแผนอาหาร 🍽️'}
                            </Link>
                            <Link href="/reword-points" className="btn-outline flex-1 justify-center !py-3 text-sm">
                                แต้มสะสม ⭐
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
