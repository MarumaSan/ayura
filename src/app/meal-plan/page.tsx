'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    calcBMI, getBmiCategory, calcTDEE, recommendSize,
    SIZE_MULTIPLIERS, SIZE_LABELS,
    type BmiCategory, type BoxSize
} from '@/lib/bmiCalculator';

type AvgNutrition = { calories: number; protein: number; carbs: number; fat: number };

type MealSet = {
    id: string;
    name: string;
    description: string;
    image: string;
    tag: string;
    targetBmi: BmiCategory;
    priceWeekly: number;
    priceMonthly: number;
    avgNutrition: AvgNutrition;
    boxIngredients: { ingredientId: string; gramsPerWeek: number }[];
    recipes: any[];
};

type UserProfile = {
    name?: string;
    email?: string;
    weight?: number;
    height?: number;
    age?: number;
    gender?: string;
};

export default function MealPlanPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [mealSets, setMealSets] = useState<MealSet[]>([]);
    const [selectedSet, setSelectedSet] = useState<MealSet | null>(null);
    const [boxSize, setBoxSize] = useState<BoxSize>('M');
    const [duration, setDuration] = useState<'weekly' | 'monthly'>('weekly');
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // BMI & TDEE derived state
    const userBmi = userProfile?.weight && userProfile?.height
        ? calcBMI(userProfile.weight, userProfile.height) : null;
    const userBmiCategory = userBmi ? getBmiCategory(userBmi) : null;
    const userTdee = userProfile?.weight && userProfile?.height && userProfile?.age && userProfile?.gender
        ? calcTDEE(userProfile.weight, userProfile.height, userProfile.age, userProfile.gender) : null;
    const recommendedSize = userTdee ? recommendSize(userTdee) : null;

    useEffect(() => {
        const profile = localStorage.getItem('ayuraProfile');
        if (profile) {
            const parsed = JSON.parse(profile);
            setIsLoggedIn(true);
            setUserProfile(parsed);
        }

        const fetchMealSets = async () => {
            try {
                const res = await fetch('/api/meal-sets');
                if (res.ok) {
                    const data = await res.json();
                    setMealSets(data.data);
                }
            } catch (e) {
                console.error('Failed to fetch meal sets', e);
            } finally {
                setLoading(false);
            }
        };
        fetchMealSets();
    }, []);

    const handleSelectSet = (set: MealSet) => {
        setSelectedSet(set);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelectSize = (size: BoxSize) => {
        setBoxSize(size);
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConfirmPurchase = () => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }
        const multiplier = SIZE_MULTIPLIERS[boxSize];
        const basePrice = duration === 'weekly' ? selectedSet!.priceWeekly : selectedSet!.priceMonthly;
        const finalPrice = Math.round(basePrice * multiplier);

        const orderData = {
            mealSetId: selectedSet!.id,
            mealSetName: selectedSet!.name,
            plan: duration,
            boxSize,
            sizeMultiplier: multiplier,
            price: finalPrice,
        };
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        router.push('/checkout');
    };

    const multiplier = SIZE_MULTIPLIERS[boxSize];
    const price = selectedSet
        ? Math.round((duration === 'weekly' ? selectedSet.priceWeekly : selectedSet.priceMonthly) * multiplier)
        : 0;

    const monthlySavings = selectedSet
        ? Math.round((selectedSet.priceWeekly * 4 - selectedSet.priceMonthly) * multiplier)
        : 0;

    const scaledNutrition = selectedSet?.avgNutrition ? {
        calories: Math.round(selectedSet.avgNutrition.calories * multiplier),
        protein: Math.round(selectedSet.avgNutrition.protein * multiplier),
        carbs: Math.round(selectedSet.avgNutrition.carbs * multiplier),
        fat: Math.round(selectedSet.avgNutrition.fat * multiplier),
    } : null;

    const macros = scaledNutrition ? [
        { label: 'โปรตีน', val: scaledNutrition.protein, max: 250, bgColor: 'bg-red-50', bar: 'from-red-400 to-rose-500', text: 'text-red-600' },
        { label: 'คาร์โบไฮเดรต', val: scaledNutrition.carbs, max: 400, bgColor: 'bg-amber-50', bar: 'from-amber-400 to-yellow-500', text: 'text-amber-600' },
        { label: 'ไขมัน', val: scaledNutrition.fat, max: 120, bgColor: 'bg-green-50', bar: 'from-green-400 to-emerald-500', text: 'text-green-600' },
    ] : [];

    const stepLabels = ['เลือกเซ็ต', 'เลือกไซส์กล่อง', 'เลือกระยะเวลา'];

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {stepLabels.map((label, i) => {
                        const stepNum = i + 1;
                        const isActive = step >= stepNum;
                        const isCurrent = step === stepNum;
                        return (
                            <div key={i} className="flex items-center gap-2 flex-1">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all flex-shrink-0
                                    ${isActive ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-400'}
                                    ${isCurrent ? 'ring-4 ring-[var(--color-primary)]/20' : ''}`}>
                                    {stepNum}
                                </div>
                                <div className={`text-sm font-medium transition-colors ${isActive ? 'text-[var(--color-primary-dark)]' : 'text-[var(--color-text-muted)]'}`}>
                                    {label}
                                </div>
                                {i < stepLabels.length - 1 && (
                                    <div className={`flex-1 h-0.5 rounded-full transition-all ${step > stepNum ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ─── STEP 1: Select a MealSet ─── */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gradient mb-2">เลือกเซ็ตแผนอาหาร</h1>
                            <p className="text-[var(--color-text-light)]">วัตถุดิบออร์แกนิกจากเกษตรกรชุมชน จัดส่งถึงบ้านทุกสัปดาห์</p>
                            {userBmi && (
                                <div className="mt-3 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                    <span className="text-sm text-[var(--color-text-muted)]">BMI ของคุณ:</span>
                                    <span className="text-sm font-bold text-[var(--color-primary)]">{userBmi}</span>
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                        ({userBmiCategory === 'underweight' ? 'น้ำหนักน้อย' : userBmiCategory === 'overweight' ? 'น้ำหนักเกิน' : 'ปกติ'})
                                    </span>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="text-4xl animate-spin-slow">🌿</div>
                                <p className="text-[var(--color-text-muted)]">กำลังโหลดเซ็ตอาหาร...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {mealSets.map((set) => {
                                    const isRecommended = userBmiCategory && set.targetBmi === userBmiCategory;
                                    return (
                                        <div
                                            key={set.id}
                                            className={`glass-card p-6 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200 relative
                                                ${isRecommended ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : ''}`}
                                            onClick={() => handleSelectSet(set)}
                                        >
                                            {/* BMI Recommend badge */}
                                            {isRecommended && (
                                                <span className="absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow z-10">
                                                    ✨ แนะนำสำหรับคุณ
                                                </span>
                                            )}
                                            {/* Original tag */}
                                            {set.tag && !isRecommended && (
                                                <span className="absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow">
                                                    {set.tag}
                                                </span>
                                            )}
                                            <div className="text-5xl mb-4 text-center">{set.image}</div>
                                            <h3 className="text-lg font-bold text-center text-[var(--color-primary-dark)] mb-2">{set.name}</h3>
                                            <p className="text-sm text-[var(--color-text-light)] text-center leading-relaxed mb-5">{set.description}</p>

                                            {/* Nutrition preview */}
                                            {set.avgNutrition && (
                                                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                                                    <div className="bg-orange-50 rounded-xl p-2">
                                                        <div className="text-sm font-bold text-orange-500">{set.avgNutrition.calories}</div>
                                                        <div className="text-[10px] text-orange-400">kcal/วัน</div>
                                                    </div>
                                                    <div className="bg-red-50 rounded-xl p-2">
                                                        <div className="text-sm font-bold text-red-500">{set.avgNutrition.protein}g</div>
                                                        <div className="text-[10px] text-red-400">โปรตีน/วัน</div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2 border-t border-gray-100 pt-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[var(--color-text-muted)]">รายสัปดาห์</span>
                                                    <span className="font-bold text-[var(--color-primary)]">฿{set.priceWeekly.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[var(--color-text-muted)]">รายเดือน</span>
                                                    <span className="font-bold text-[var(--color-primary)]">฿{set.priceMonthly.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-green-600">
                                                    <span>ประหยัดเดือนละ</span>
                                                    <span className="font-semibold">฿{Math.round(set.priceWeekly * 4 - set.priceMonthly).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <button className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold text-sm shadow hover:shadow-md transition-all">
                                                เลือกเซ็ตนี้ →
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── STEP 2: Choose Box Size ─── */}
                {step === 2 && selectedSet && (
                    <div className="animate-fade-in">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
                        >
                            ← กลับเลือกเซ็ต
                        </button>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gradient mb-2">เลือกไซส์กล่อง</h1>
                            <p className="text-[var(--color-text-light)]">
                                เซ็ต <strong>{selectedSet.name}</strong> — เลือกขนาดกล่องที่เหมาะกับปริมาณที่คุณทาน
                            </p>
                            {userTdee && (
                                <div className="mt-3 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                    <span className="text-sm text-[var(--color-text-muted)]">TDEE ของคุณ:</span>
                                    <span className="text-sm font-bold text-[var(--color-primary)]">{userTdee.toLocaleString()} kcal/วัน</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {(['M', 'L', 'XL'] as BoxSize[]).map((size) => {
                                const mult = SIZE_MULTIPLIERS[size];
                                const sizeInfo = SIZE_LABELS[size];
                                const isRec = recommendedSize === size;
                                const sizePrice = Math.round(selectedSet.priceWeekly * mult);
                                const sizeCalories = Math.round(selectedSet.avgNutrition.calories * mult);
                                const sizeProtein = Math.round(selectedSet.avgNutrition.protein * mult);

                                return (
                                    <button
                                        key={size}
                                        onClick={() => handleSelectSize(size)}
                                        className={`glass-card p-6 text-left transition-all relative hover:-translate-y-1 hover:shadow-xl
                                            ${isRec ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : ''}`}
                                    >
                                        {isRec && (
                                            <span className="absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow z-10">
                                                ✨ แนะนำสำหรับคุณ
                                            </span>
                                        )}

                                        {/* Size header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black
                                                ${size === 'M' ? 'bg-blue-100 text-blue-600' : size === 'L' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {size}
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-[var(--color-primary-dark)]">{sizeInfo.thai}</div>
                                                <div className="text-xs text-[var(--color-text-muted)]">×{mult} ปริมาณวัตถุดิบ</div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-[var(--color-text-light)] mb-5 leading-relaxed">{sizeInfo.desc}</p>

                                        {/* Nutrition preview for this size */}
                                        <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                                            <div className="bg-orange-50 rounded-xl p-2">
                                                <div className="text-sm font-bold text-orange-500">{sizeCalories.toLocaleString()}</div>
                                                <div className="text-[10px] text-orange-400">kcal/วัน</div>
                                            </div>
                                            <div className="bg-red-50 rounded-xl p-2">
                                                <div className="text-sm font-bold text-red-500">{sizeProtein}g</div>
                                                <div className="text-[10px] text-red-400">โปรตีน/วัน</div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[var(--color-text-muted)]">เริ่มต้น/สัปดาห์</span>
                                                <span className="font-bold text-[var(--color-primary)]">฿{sizePrice.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold text-sm shadow text-center hover:shadow-md transition-all">
                                            เลือกไซส์นี้ →
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ─── STEP 3: Choose duration ─── */}
                {step === 3 && selectedSet && (
                    <div className="animate-fade-in">
                        <button
                            onClick={() => setStep(2)}
                            className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
                        >
                            ← กลับเลือกไซส์
                        </button>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gradient mb-2">เลือกระยะเวลา</h1>
                            <p className="text-[var(--color-text-light)]">
                                เซ็ต <strong>{selectedSet.name}</strong> | ไซส์ <strong>{boxSize}</strong> ({SIZE_LABELS[boxSize].thai})
                                — เลือกว่าจะสมัครแค่สัปดาห์เดียวหรือเหมาจ่ายรายเดือน
                            </p>
                        </div>

                        {/* Duration cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <button
                                onClick={() => setDuration('weekly')}
                                className={`glass-card p-6 text-left transition-all border-2 ${duration === 'weekly' ? 'border-[var(--color-primary)] shadow-lg' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-2xl mb-1">📅</div>
                                        <h3 className="text-lg font-bold">รายสัปดาห์</h3>
                                        <p className="text-sm text-[var(--color-text-light)]">7 วัน · ยืดหยุ่น</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-[var(--color-primary)]">
                                            ฿{Math.round(selectedSet.priceWeekly * multiplier).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-muted)]">ต่อสัปดาห์</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${duration === 'weekly' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300'}`}>
                                        {duration === 'weekly' && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <span className="text-sm text-[var(--color-text-light)]">เลือกแผนนี้</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setDuration('monthly')}
                                className={`glass-card p-6 text-left transition-all border-2 relative ${duration === 'monthly' ? 'border-[var(--color-primary)] shadow-lg' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <span className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow">
                                    ประหยัด ฿{monthlySavings.toLocaleString()}
                                </span>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-2xl mb-1">📦</div>
                                        <h3 className="text-lg font-bold">รายเดือน</h3>
                                        <p className="text-sm text-[var(--color-text-light)]">30 วัน · ประหยัดกว่า</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-[var(--color-primary)]">
                                            ฿{Math.round(selectedSet.priceMonthly * multiplier).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-muted)]">ต่อเดือน</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${duration === 'monthly' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300'}`}>
                                        {duration === 'monthly' && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <span className="text-sm text-[var(--color-text-light)]">เลือกแผนนี้</span>
                                </div>
                            </button>
                        </div>

                        {/* Bottom section: nutrition summary + order summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left: Average daily nutrition */}
                            <div className="lg:col-span-2 glass-card p-6">
                                <h4 className="font-bold text-[var(--color-primary-dark)] mb-5 flex items-center gap-2">
                                    📊 สารอาหารเฉลี่ยต่อวัน (ไซส์ {boxSize})
                                </h4>

                                {scaledNutrition ? (
                                    <>
                                        {/* Calorie hero */}
                                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 text-center mb-4">
                                            <div className="text-4xl font-bold text-orange-500 mb-1">
                                                {scaledNutrition.calories.toLocaleString()}
                                                <span className="text-base font-normal text-orange-400 ml-1">kcal</span>
                                            </div>
                                            <p className="text-xs text-orange-400 uppercase tracking-wide">แคลอรี่เฉลี่ยต่อวัน</p>
                                        </div>

                                        {/* Macro bars */}
                                        <div className="space-y-3">
                                            {macros.map(({ label, val, max, bgColor, bar, text }) => (
                                                <div key={label} className={`${bgColor} rounded-xl p-4`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium text-[var(--color-text-light)]">{label}</span>
                                                        <span className={`text-lg font-bold ${text}`}>{val}g<span className="text-xs font-normal ml-1 opacity-70">/วัน</span></span>
                                                    </div>
                                                    <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${bar} rounded-full`}
                                                            style={{ width: `${Math.min(100, Math.round((val / max) * 100))}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-xs text-center text-[var(--color-text-muted)] mt-4">
                                            * ค่าโดยประมาณจากเมนูอาหารที่แนะนำในเซ็ตนี้ (ปรับตามไซส์ {boxSize})
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-[var(--color-text-muted)] text-sm py-4 text-center">ไม่มีข้อมูลสารอาหาร — กรุณา seed ข้อมูลใหม่</p>
                                )}
                            </div>

                            {/* Right: Order summary */}
                            <div className="lg:col-span-1">
                                <div className="glass-card p-6 sticky top-28">
                                    <h4 className="font-bold text-[var(--color-primary-dark)] mb-4">สรุปการสั่งซื้อ</h4>
                                    <div className="space-y-3 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-[var(--color-text-muted)]">เซ็ตที่เลือก</span>
                                            <span className="font-medium text-right max-w-[150px]">{selectedSet.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[var(--color-text-muted)]">ไซส์กล่อง</span>
                                            <span className="font-medium">{boxSize} ({SIZE_LABELS[boxSize].thai})</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[var(--color-text-muted)]">ระยะเวลา</span>
                                            <span className="font-medium">{duration === 'weekly' ? '1 สัปดาห์' : '1 เดือน'}</span>
                                        </div>
                                        <div className="border-t border-gray-100 pt-3 flex justify-between">
                                            <span className="font-bold">รวม</span>
                                            <span className="text-xl font-bold text-[var(--color-primary)]">฿{price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleConfirmPurchase}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        {isLoggedIn ? 'ยืนยันและชำระเงิน →' : 'เข้าสู่ระบบเพื่อสั่งซื้อ →'}
                                    </button>
                                    <p className="text-xs text-center text-[var(--color-text-muted)] mt-3">
                                        🚚 จัดส่งทั่วไทย · ✅ วัตถุดิบออร์แกนิก
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
