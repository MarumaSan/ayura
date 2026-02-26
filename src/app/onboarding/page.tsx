'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HEALTH_GOALS = [
    { id: 'ลดน้ำหนัก', label: '⬇️ ลดน้ำหนัก' },
    { id: 'สร้างกล้ามเนื้อ', label: '💪 สร้างกล้ามเนื้อ' },
    { id: 'รักษาสุขภาพ', label: '✨ รักษาสุขภาพ' },
    { id: 'เพิ่มภูมิคุ้มกัน', label: '🛡️ เพิ่มภูมิคุ้มกัน' },
    { id: 'ลดความเครียด', label: '🧘‍♀️ ลดความเครียด' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [gender, setGender] = useState('ชาย');
    const [age, setAge] = useState<number | ''>('');
    const [weight, setWeight] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch User ID from local storage set during login/register
        const storedProfile = localStorage.getItem('ayuraProfile');
        if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            // If they somehow land here but their profile is complete, bounce them to dashboard
            if (profile.isProfileComplete) {
                router.push('/dashboard');
                return;
            }
            setUserId(profile.userId);
        } else {
            // Kick out if no user session
            router.push('/login');
        }
    }, [router]);

    const handleGoalToggle = (goalId: string) => {
        if (selectedGoals.includes(goalId)) {
            setSelectedGoals(selectedGoals.filter(id => id !== goalId));
        } else {
            if (selectedGoals.length >= 3) {
                setError('เลือกเป้าหมายได้สูงสุด 3 ข้อ');
                return;
            }
            setError('');
            setSelectedGoals([...selectedGoals, goalId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!age || !weight || !height || selectedGoals.length === 0) {
            setError('กรุณากรอกข้อมูลให้ครบและเลือกเป้าหมายอย่างน้อย 1 อย่าง');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    gender,
                    age: Number(age),
                    weight: Number(weight),
                    height: Number(height),
                    healthGoals: selectedGoals
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Keep local session synced
                const storedProfile = JSON.parse(localStorage.getItem('ayuraProfile') || '{}');
                localStorage.setItem('ayuraProfile', JSON.stringify({
                    ...storedProfile,
                    isProfileComplete: true
                }));

                window.dispatchEvent(new Event('auth-change'));

                router.push('/dashboard');
            } else {
                setError(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                setLoading(false);
            }
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="w-full max-w-xl animate-fade-in-up">

                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold tracking-wider uppercase mb-4">
                        ยินดีต้อนรับสู่ Ayura
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-3">
                        ข้อมูลสุขภาพของคุณ
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-sm sm:text-base">
                        โปรดให้ข้อมูลพื้นฐานเพื่อให้ AI ของเราประเมินและแนะนำมื้ออาหารที่เหมาะสมกับคุณที่สุด
                    </p>
                </div>

                <div className="glass-card p-6 sm:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Gender */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-[var(--color-text-light)] ml-1">เพศกำเนิด</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['ชาย', 'หญิง', 'อื่นๆ'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setGender(g)}
                                        className={`py-3 rounded-xl border transition-all text-sm font-medium ${gender === g
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary-dark)] shadow-sm'
                                            : 'border-[var(--color-border)] bg-[var(--color-bg-section)] text-[var(--color-text-muted)] hover:border-gray-300'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Physical Stats Line */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-text-light)] ml-1">อายุ (ปี)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-[var(--color-text)]"
                                    placeholder="เช่น 30"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-text-light)] ml-1">น้ำหนัก (kg)</label>
                                <input
                                    type="number"
                                    min="20"
                                    max="300"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-[var(--color-text)]"
                                    placeholder="เช่น 60.5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--color-text-light)] ml-1">ส่วนสูง (cm)</label>
                                <input
                                    type="number"
                                    min="50"
                                    max="250"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-[var(--color-text)]"
                                    placeholder="เช่น 165"
                                />
                            </div>
                        </div>

                        {/* Health Goals */}
                        <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                            <div>
                                <label className="text-sm font-medium text-[var(--color-text-light)] ml-1">เป้าหมายด้านสุขภาพของคุณ</label>
                                <p className="text-xs text-[var(--color-text-muted)] ml-1 mt-1">
                                    เลือกได้สูงสุด 3 ข้อ เราจะนำไปใช้วิเคราะห์ผลลัพธ์ที่เหมาะสม
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {HEALTH_GOALS.map((goal) => {
                                    const isSelected = selectedGoals.includes(goal.id);
                                    return (
                                        <button
                                            key={goal.id}
                                            type="button"
                                            onClick={() => handleGoalToggle(goal.id)}
                                            className={`px-4 py-2.5 rounded-full border text-sm transition-all focus:outline-none ${isSelected
                                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-md transform scale-105'
                                                : 'bg-[var(--color-bg-section)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5'
                                                }`}
                                        >
                                            {goal.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all shadow-lg ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'btn-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-primary)]/20'
                                    }`}
                            >
                                {loading ? 'กำลังบันทึกข้อมูล...' : 'เริ่มสร้างแผนสุขภาพของฉัน ✨'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
