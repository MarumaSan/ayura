'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    age: number | '';
    gender: string;
    weight: number | '';
    height: number | '';
    activityLevel: string;
    bio: string;
    healthGoals: string[];
    referralCode?: string;
    referredByCode?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [referralInput, setReferralInput] = useState('');
    const [referralMessage, setReferralMessage] = useState('');

    const [profile, setProfile] = useState<UserProfile>({
        id: '',
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        weight: '',
        height: '',
        activityLevel: '',
        bio: '',
        healthGoals: [],
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const storedProfile = localStorage.getItem('ayuraProfile');
            if (!storedProfile) {
                router.push('/login');
                return;
            }

            try {
                const userData = JSON.parse(storedProfile);
                const userId = userData.userId || userData.id;

                const res = await fetch(`/api/user/profile?userId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.profile) {
                        setProfile({
                            id: data.profile.id,
                            name: data.profile.name || '',
                            email: data.profile.email || '',
                            phone: data.profile.phone || '',
                            age: data.profile.age || '',
                            gender: data.profile.gender || '',
                            weight: data.profile.weight || '',
                            height: data.profile.height || '',
                            activityLevel: data.profile.activityLevel || '',
                            bio: data.profile.bio || '',
                            healthGoals: data.profile.healthGoals || [],
                            referralCode: data.profile.referralCode || '',
                            referredByCode: data.profile.referredByCode || ''
                        });
                    }
                } else if (res.status === 404) {
                    localStorage.removeItem('ayuraProfile');
                    router.push('/login');
                    return;
                } else {
                    setMessage({ type: 'error', text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้' });
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการโหลดข้อมูล' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGoalChange = (goal: string) => {
        setProfile(prev => {
            const currentGoals = [...prev.healthGoals];
            if (currentGoals.includes(goal)) {
                return { ...prev, healthGoals: currentGoals.filter(g => g !== goal) };
            } else {
                if (currentGoals.length >= 3) {
                    setMessage({ type: 'error', text: 'เลือกเป้าหมายได้สูงสุด 3 ข้อ' });
                    // Clear error after 3 seconds so it's not stuck
                    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    return prev;
                }
                return { ...prev, healthGoals: [...currentGoals, goal] };
            }
        });
    };

    const handleApplyReferralCode = async () => {
        if (!referralInput.trim()) {
            setReferralMessage('กรุณาใส่รหัสอ้างอิง');
            return;
        }

        try {
            const res = await fetch('/api/referral/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    referralCode: referralInput.trim().toUpperCase(),
                    userId: profile.id
                })
            });

            const data = await res.json();

            if (res.ok) {
                setReferralMessage('✅ ใช้รหัสอ้างอิงสำเร็จ! รับ 50 แต้ม');
                setReferralInput('');
                // Refresh profile to get updated points
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setReferralMessage(data.error || '❌ รหัสอ้างอิงไม่ถูกต้อง');
            }
        } catch (err) {
            setReferralMessage('❌ เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                userId: profile.id,
                name: profile.name,
                phone: profile.phone,
                age: Number(profile.age),
                gender: profile.gender,
                weight: Number(profile.weight),
                height: Number(profile.height),
                activityLevel: profile.activityLevel,
                bio: profile.bio,
                healthGoals: profile.healthGoals
            };

            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setMessage({ type: 'success', text: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' });

                // Update local storage name if it changed
                const storedProfileStr = localStorage.getItem('ayuraProfile');
                if (storedProfileStr) {
                    const storedProfile = JSON.parse(storedProfileStr);
                    storedProfile.name = data.profile.name;
                    storedProfile.weight = data.profile.weight;
                    storedProfile.height = data.profile.height;
                    storedProfile.age = data.profile.age;
                    storedProfile.gender = data.profile.gender;
                    storedProfile.healthGoals = data.profile.healthGoals;
                    localStorage.setItem('ayuraProfile', JSON.stringify(storedProfile));
                    window.dispatchEvent(new Event('auth-change'));
                }
            } else {
                const errData = await res.json();
                setMessage({ type: 'error', text: errData.error || 'ไม่สามารถบันทึกข้อมูลได้' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setIsSaving(false);
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                <div className="text-center animate-pulse">
                    <span className="text-4xl mb-4 block">⏳</span>
                    <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลส่วนตัว...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">ข้อมูลส่วนตัว</h1>
                    <p className="text-gray-500 mt-2">จัดการข้อมูลพื้นฐาน ข้อมูลสุขภาพ และเป้าหมายของคุณ</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slide-up shadow-sm border ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        <span className="text-xl">
                            {message.type === 'success' ? '✅' : '❌'}
                        </span>
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                <div className="glass-card p-6 md:p-8 rounded-2xl shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Section: Personal Info */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                                <span className="text-xl">👤</span>
                                <h2 className="text-xl font-bold text-gray-800">ข้อมูลพื้นฐาน</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">อีเมล (ไม่สามารถแก้ไขได้)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleInputChange}
                                        placeholder="08X-XXX-XXXX"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow bg-gray-50/50"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">ประวัติส่วนตัวสั้นๆ</label>
                                    <textarea
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="เล่าเรื่องราวของคุณให้เราฟังหน่อย..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow bg-gray-50/50 resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section: Health Metrics */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                                <span className="text-xl">❤️</span>
                                <h2 className="text-xl font-bold text-gray-800">ข้อมูลสุขภาพ</h2>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">เพศ</label>
                                    <select
                                        name="gender"
                                        value={profile.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow bg-gray-50/50"
                                    >
                                        <option value="">เลือกเพศ</option>
                                        <option value="ชาย">ชาย</option>
                                        <option value="หญิง">หญิง</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">อายุ (ปี)</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={profile.age}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="120"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">น้ำหนัก (กก.)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={profile.weight}
                                        onChange={handleInputChange}
                                        min="1"
                                        step="0.1"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow bg-gray-50/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">ส่วนสูง (ซม.)</label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={profile.height}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow bg-gray-50/50"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section: Lifestyle & Goals */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
                                <span className="text-xl">🎯</span>
                                <h2 className="text-xl font-bold text-gray-800">ไลฟ์สไตล์และเป้าหมาย</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">ระดับการทำกิจกรรม (Activity Level)</label>
                                    <select
                                        name="activityLevel"
                                        value={profile.activityLevel}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow bg-gray-50/50"
                                    >
                                        <option value="">เลือกระดับกิจกรรม</option>
                                        <option value="น้อยมาก">น้อยมาก (ไม่ค่อยออกกำลังกาย)</option>
                                        <option value="ปานกลาง">ปานกลาง (ออกกำลังกาย 1-3 วัน/สัปดาห์)</option>
                                        <option value="สูง">สูง (ออกกำลังกาย 3-5 วัน/สัปดาห์)</option>
                                        <option value="สูงมาก">สูงมาก (ดออกกำลังกายหนักทุกวัน)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">เป้าหมายด้านสุขภาพของคุณ</label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        เลือกได้สูงสุด 3 ข้อ เราจะนำไปใช้วิเคราะห์ผลลัพธ์ที่เหมาะสม
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { id: 'ลดน้ำหนัก', label: '⬇️ ลดน้ำหนัก' },
                                            { id: 'สร้างกล้ามเนื้อ', label: '💪 สร้างกล้ามเนื้อ' },
                                            { id: 'รักษาสุขภาพ', label: '✨ รักษาสุขภาพ' },
                                            { id: 'เพิ่มภูมิคุ้มกัน', label: '🛡️ เพิ่มภูมิคุ้มกัน' },
                                            { id: 'ลดความเครียด', label: '🧘‍♀️ ลดความเครียด' }
                                        ].map(goal => (
                                            <button
                                                key={goal.id}
                                                type="button"
                                                onClick={() => handleGoalChange(goal.id)}
                                                className={`px-4 py-2.5 rounded-full border text-sm transition-all focus:outline-none ${profile.healthGoals.includes(goal.id)
                                                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] font-bold shadow-sm'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-[var(--color-primary)]/50 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {goal.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Referral Code Section - Above submit button */}
                        {!profile.referredByCode && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl">🎯</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 mb-2">รับโบนัส 50 แต้ม!</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            มีรหัสอ้างอิงจากเพื่อนหรือไม่? ใส่รหัสเพื่อรับพอยท์พิเศษทันที!
                                        </p>
                                        
                                        <div className="space-y-3">
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={referralInput}
                                                    onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                                                    placeholder="AYURA..."
                                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono uppercase bg-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleApplyReferralCode}
                                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                                >
                                                    ใช้รหัส
                                                </button>
                                            </div>
                                            
                                            {referralMessage && (
                                                <div className={`p-3 rounded-lg text-sm font-medium ${
                                                    referralMessage.includes('✅') 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {referralMessage}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin text-xl">⚪</span>
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xl">💾</span>
                                        บันทึกข้อมูล
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
