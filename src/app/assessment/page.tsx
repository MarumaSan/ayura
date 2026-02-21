'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { elementQuestions, elementDescriptions } from '@/lib/mockData';
import { calculateElement, calculateBMI } from '@/lib/aiRecommendation';
import { ThaiElement, HealthGoal } from '@/lib/types';

const healthGoalOptions: HealthGoal[] = [
    'ลดน้ำหนัก',
    'เพิ่มภูมิคุ้มกัน',
    'ผิวพรรณสดใส',
    'นอนหลับดี',
    'เพิ่มพลังงาน',
    'ลดความเครียด',
];

const goalIcons: Record<HealthGoal, string> = {
    'ลดน้ำหนัก': '⚖️',
    'เพิ่มภูมิคุ้มกัน': '🛡️',
    'ผิวพรรณสดใส': '✨',
    'นอนหลับดี': '😴',
    'เพิ่มพลังงาน': '⚡',
    'ลดความเครียด': '🧘',
};

export default function AssessmentPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [selectedGoals, setSelectedGoals] = useState<HealthGoal[]>([]);
    const [elementAnswers, setElementAnswers] = useState<ThaiElement[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [result, setResult] = useState<ThaiElement | null>(null);

    const totalSteps = 4;

    const toggleGoal = (goal: HealthGoal) => {
        setSelectedGoals((prev) =>
            prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
        );
    };

    const handleElementAnswer = (element: ThaiElement) => {
        const newAnswers = [...elementAnswers, element];
        setElementAnswers(newAnswers);

        if (currentQuestion < elementQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            const calculatedElement = calculateElement(newAnswers);
            setResult(calculatedElement);
            setStep(4);
        }
    };

    const handleGoToDashboard = () => {
        // Store in localStorage
        const profile = {
            name: name || 'ผู้ใช้งาน',
            age: parseInt(age) || 30,
            gender,
            weight: parseFloat(weight) || 65,
            height: parseFloat(height) || 170,
            element: result,
            healthGoals: selectedGoals,
        };
        localStorage.setItem('ayura-profile', JSON.stringify(profile));
        router.push('/dashboard');
    };

    const bmi = weight && height ? calculateBMI(parseFloat(weight), parseFloat(height)) : null;

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                {/* Progress Bar */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-3">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${s <= step
                                            ? 'gradient-primary text-white shadow-lg'
                                            : 'bg-gray-200 text-gray-400'
                                        }`}
                                >
                                    {s < step ? '✓' : s}
                                </div>
                                {s < totalSteps && (
                                    <div
                                        className={`w-12 sm:w-20 h-1 mx-1 rounded transition-all duration-300 ${s < step ? 'bg-[var(--color-primary)]' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center text-sm text-[var(--color-text-light)]">
                        ขั้นตอนที่ {step} จาก {totalSteps}
                    </div>
                </div>

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="glass-card p-8 animate-fade-in">
                        <div className="text-center mb-8">
                            <div className="text-4xl mb-3">📋</div>
                            <h2 className="text-2xl font-bold text-[var(--color-primary-dark)]">
                                ข้อมูลพื้นฐาน
                            </h2>
                            <p className="text-[var(--color-text-light)] mt-2">
                                บอกเราเกี่ยวกับตัวคุณเพื่อจับคู่อาหารที่เหมาะ
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">ชื่อ</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ชื่อของคุณ"
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">อายุ</label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="ปี"
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">เพศ</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                    >
                                        <option value="">เลือก</option>
                                        <option value="ชาย">ชาย</option>
                                        <option value="หญิง">หญิง</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">น้ำหนัก (กก.)</label>
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="กก."
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">ส่วนสูง (ซม.)</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        placeholder="ซม."
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                    />
                                </div>
                            </div>

                            {bmi && (
                                <div className="bg-[var(--color-bg-section)] rounded-xl p-4 flex items-center gap-3">
                                    <div className="text-2xl">📊</div>
                                    <div>
                                        <span className="text-sm text-[var(--color-text-light)]">BMI ของคุณ: </span>
                                        <span className="font-bold text-[var(--color-primary)]">{bmi.bmi}</span>
                                        <span className="text-sm text-[var(--color-text-light)] ml-2">({bmi.label})</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="btn-primary w-full mt-8 justify-center !py-4 text-base"
                        >
                            ถัดไป →
                        </button>
                    </div>
                )}

                {/* Step 2: Health Goals */}
                {step === 2 && (
                    <div className="glass-card p-8 animate-fade-in">
                        <div className="text-center mb-8">
                            <div className="text-4xl mb-3">🎯</div>
                            <h2 className="text-2xl font-bold text-[var(--color-primary-dark)]">
                                เป้าหมายสุขภาพ
                            </h2>
                            <p className="text-[var(--color-text-light)] mt-2">
                                เลือกเป้าหมายที่คุณต้องการ (เลือกได้หลายข้อ)
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {healthGoalOptions.map((goal) => (
                                <button
                                    key={goal}
                                    onClick={() => toggleGoal(goal)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover-lift ${selectedGoals.includes(goal)
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-md'
                                            : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/30'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{goalIcons[goal]}</div>
                                    <div className="text-sm font-medium">{goal}</div>
                                    {selectedGoals.includes(goal) && (
                                        <div className="text-xs text-[var(--color-primary)] mt-1 font-medium">
                                            ✓ เลือกแล้ว
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="btn-outline flex-1 justify-center !py-4"
                            >
                                ← ย้อนกลับ
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={selectedGoals.length === 0}
                                className="btn-primary flex-1 justify-center !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ถัดไป →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Element Quiz */}
                {step === 3 && (
                    <div className="glass-card p-8 animate-fade-in">
                        <div className="text-center mb-8">
                            <div className="text-4xl mb-3">🔮</div>
                            <h2 className="text-2xl font-bold text-[var(--color-primary-dark)]">
                                ค้นหาธาตุเจ้าเรือน
                            </h2>
                            <p className="text-[var(--color-text-light)] mt-2">
                                คำถามที่ {currentQuestion + 1} จาก {elementQuestions.length}
                            </p>
                            {/* Mini progress */}
                            <div className="flex justify-center gap-2 mt-4">
                                {elementQuestions.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full transition-all ${i < currentQuestion
                                                ? 'bg-[var(--color-primary)]'
                                                : i === currentQuestion
                                                    ? 'bg-[var(--color-secondary)] scale-125'
                                                    : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-6 text-center">
                                {elementQuestions[currentQuestion].question}
                            </h3>

                            <div className="space-y-3">
                                {elementQuestions[currentQuestion].options.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleElementAnswer(option.element)}
                                        className="w-full p-4 rounded-xl border-2 border-[var(--color-border)] bg-white text-left hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 hover-lift group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-section)] flex items-center justify-center text-sm font-bold text-[var(--color-primary)] group-hover:gradient-primary group-hover:text-white transition-all">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="text-sm font-medium">{option.text}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (currentQuestion > 0) {
                                    setCurrentQuestion(currentQuestion - 1);
                                    setElementAnswers(elementAnswers.slice(0, -1));
                                } else {
                                    setStep(2);
                                }
                            }}
                            className="btn-outline w-full justify-center !py-3"
                        >
                            ← ย้อนกลับ
                        </button>
                    </div>
                )}

                {/* Step 4: Results */}
                {step === 4 && result && (
                    <div className="animate-fade-in">
                        <div className="glass-card p-8 text-center mb-6">
                            <div className="text-6xl mb-4">{elementDescriptions[result].emoji}</div>
                            <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-2">
                                ธาตุเจ้าเรือนของคุณคือ
                            </h2>
                            <div
                                className="inline-block text-4xl font-bold px-8 py-3 rounded-2xl text-white mb-4"
                                style={{ backgroundColor: elementDescriptions[result].color }}
                            >
                                ธาตุ{result}
                            </div>
                            <p className="text-[var(--color-text-light)] leading-relaxed max-w-md mx-auto">
                                {elementDescriptions[result].description}
                            </p>
                        </div>

                        <div className="glass-card p-6 mb-6">
                            <h3 className="font-bold text-[var(--color-primary-dark)] mb-3 flex items-center gap-2">
                                💡 คำแนะนำสำหรับคุณ
                            </h3>
                            <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                                {elementDescriptions[result].advice}
                            </p>
                        </div>

                        <div className="glass-card p-6 mb-6">
                            <h3 className="font-bold text-[var(--color-primary-dark)] mb-3 flex items-center gap-2">
                                📊 สรุปข้อมูลของคุณ
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-[var(--color-bg-section)] p-3 rounded-xl">
                                    <span className="text-[var(--color-text-light)]">ชื่อ: </span>
                                    <span className="font-medium">{name || 'ผู้ใช้งาน'}</span>
                                </div>
                                <div className="bg-[var(--color-bg-section)] p-3 rounded-xl">
                                    <span className="text-[var(--color-text-light)]">อายุ: </span>
                                    <span className="font-medium">{age || '-'} ปี</span>
                                </div>
                                <div className="bg-[var(--color-bg-section)] p-3 rounded-xl">
                                    <span className="text-[var(--color-text-light)]">BMI: </span>
                                    <span className="font-medium">{bmi?.bmi || '-'}</span>
                                </div>
                                <div className="bg-[var(--color-bg-section)] p-3 rounded-xl">
                                    <span className="text-[var(--color-text-light)]">เป้าหมาย: </span>
                                    <span className="font-medium">{selectedGoals.length} ข้อ</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGoToDashboard}
                            className="btn-primary w-full justify-center !py-4 text-base animate-pulse-glow"
                        >
                            ดูกล่องสุขภาพที่ AI แนะนำ 🤖✨
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
