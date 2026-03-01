'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Forgot Password State
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotPhone, setForgotPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!email || !forgotPhone || !newPassword) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone: forgotPhone, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                alert('เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่');
                setIsForgotPassword(false);
                setPassword('');
                setForgotPhone('');
                setNewPassword('');
                setError('');
            } else {
                setError(data.error || 'ข้อมูลไม่ถูกต้อง (อีเมลหรือเบอร์โทรศัพท์ไม่ตรงกัน)');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isLogin) {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    // Simple local storage session for now
                    localStorage.setItem('ayuraProfile', JSON.stringify({
                        userId: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        points: data.user.points,
                        isProfileComplete: data.user.isProfileComplete,
                        role: data.user.role,
                        weight: data.user.weight,
                        height: data.user.height,
                        age: data.user.age,
                        gender: data.user.gender,
                        healthGoals: data.user.healthGoals
                    }));

                    window.dispatchEvent(new Event('auth-change'));

                    if (data.user.isProfileComplete) {
                        router.push('/dashboard');
                    } else {
                        router.push('/onboarding');
                    }
                } else {
                    setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
                }
            } catch (err) {
                setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            }
        } else {
            // Register Flow
            if (!name) {
                setError('กรุณากรอกชื่อ-นามสกุล');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    setIsLogin(true);
                    setError('');
                    // Optional: auto login or show success toast
                    alert('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ');
                } else {
                    setError(data.error || 'รหัสนี้มีการลงทะเบียนแล้ว');
                }
            } catch (err) {
                setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center pt-20 px-4">

            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-secondary)]/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo Area */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <span className="text-4xl font-bold text-gradient">Ayura</span>
                    </Link>
                    <p className="text-[var(--color-text-light)] mt-2">
                        เข้าสู่ระบบเพื่อจัดการสุขภาพในแบบของคุณ
                    </p>
                </div>

                <div className="glass-card p-8">
                    {/* Toggle Buttons (Hidden in Forgot Password mode) */}
                    {!isForgotPassword && (
                        <div className="flex w-fit mx-auto bg-[var(--color-bg-section)] rounded-xl p-1 mb-8">
                            <button
                                onClick={() => { setIsLogin(true); setError(''); }}
                                className={`px-8 py-2 text-sm font-medium rounded-lg transition-all ${isLogin
                                    ? 'bg-white shadow-sm text-[var(--color-primary-dark)]'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                                    }`}
                            >
                                เข้าสู่ระบบ
                            </button>
                            <button
                                onClick={() => { setIsLogin(false); setError(''); }}
                                className={`px-8 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin
                                    ? 'bg-white shadow-sm text-[var(--color-primary-dark)]'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                                    }`}
                            >
                                สมัครสมาชิก
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={isForgotPassword ? handleForgotSubmit : handleSubmit} className="space-y-5">

                        {/* Forgot Password Flow */}
                        {isForgotPassword && (
                            <>
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold text-[var(--color-text)]">รีเซ็ตรหัสผ่าน</h2>
                                    <p className="text-sm text-[var(--color-text-light)] mt-1">
                                        กรุณายืนยันตัวตนด้วยอีเมลและเบอร์โทรศัพท์
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--color-text)] ml-1">
                                        อีเมลที่ลงทะเบียน
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400">✉️</span>
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--color-text)] ml-1">
                                        เบอร์โทรศัพท์ที่ลงทะเบียน
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400">📱</span>
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="0812345678"
                                            value={forgotPhone}
                                            onChange={(e) => setForgotPhone(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--color-text)] ml-1">
                                        รหัสผ่านใหม่
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400">🔑</span>
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 mt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3.5 rounded-xl text-white font-bold tracking-wide transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary shadow-lg hover:-translate-y-0.5'}`}
                                    >
                                        {loading ? 'กำลังดำเนินการ...' : 'รีเซ็ตรหัสผ่าน'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsForgotPassword(false); setError(''); }}
                                        className="w-full py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
                                    >
                                        ยกเลิก
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Normal Login/Register Flow */}
                        {!isForgotPassword && (
                            <>
                                {!isLogin && (
                                    <div className="space-y-1.5 fade-in">
                                        <label className="text-sm font-medium text-[var(--color-text)] ml-1">
                                            ชื่อ-นามสกุล
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-gray-400">👤</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="ตัวอย่างเช่น สมชาย ใจดี"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--color-text)] ml-1">
                                        อีเมล
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400">✉️</span>
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--color-text)] ml-1">
                                        รหัสผ่าน
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-gray-400">🔑</span>
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {isLogin && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            className="text-sm text-[var(--color-primary)] hover:underline focus:outline-none"
                                        >
                                            ลืมรหัสผ่าน?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3.5 rounded-xl text-white font-bold tracking-wide transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary shadow-lg hover:-translate-y-0.5'
                                        }`}
                                >
                                    {loading ? 'กำลังดำเนินการ...' : isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                                </button>
                            </>
                        )}
                    </form>



                </div>
            </div>
        </div>
    );
}
