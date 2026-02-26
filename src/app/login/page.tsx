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
                        points: data.user.points,
                        isProfileComplete: data.user.isProfileComplete
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
                    {/* Toggle Buttons */}
                    <div className="flex bg-[var(--color-bg-section)] rounded-xl p-1 mb-8">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin
                                ? 'bg-white shadow-sm text-[var(--color-primary-dark)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                                }`}
                        >
                            เข้าสู่ระบบ
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin
                                ? 'bg-white shadow-sm text-[var(--color-primary-dark)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                                }`}
                        >
                            สมัครสมาชิก
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                <Link href="#" className="text-sm text-[var(--color-primary)] hover:underline">
                                    ลืมรหัสผ่าน?
                                </Link>
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
                    </form>

                    {/* Social Login Divider */}
                    <div className="mt-8 mb-6 flex items-center">
                        <div className="flex-grow border-t border-[var(--color-border)]"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-gray-400 uppercase tracking-widest">
                            หรือดำเนินการต่อด้วย
                        </span>
                        <div className="flex-grow border-t border-[var(--color-border)]"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-2.5 bg-[#00c300] text-white rounded-xl hover:bg-[#00b300] transition-colors text-sm font-medium shadow-sm">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M24 10.3c0-5.3-5.4-9.6-12-9.6S0 5 0 10.3c0 4.8 4.3 8.8 10 9.5.4.1.9.3 1 .6l.1 2.3c0 .2.2.4.4.2 1.3-.8 4.6-2.8 6.4-4.8 2.6-2.7 4.1-5.1 4.1-7.8z" />
                            </svg>
                            LINE
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
