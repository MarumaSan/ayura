'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReferralPage() {
    const [userName, setUserName] = useState('ผู้ใช้');
    const [referralCode, setReferralCode] = useState('');
    const [referredByCode, setReferredByCode] = useState('');
    const [referralInput, setReferralInput] = useState('');
    const [isApplyingReferral, setIsApplyingReferral] = useState(false);
    const [referralMessage, setReferralMessage] = useState({ type: '', text: '' });
    const [referralStats, setReferralStats] = useState({
        totalReferrals: 0,
        pointsEarned: 0,
        pendingReferrals: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReferralData = async () => {
            const stored = localStorage.getItem('ayuraProfile');
            if (!stored) return;

            try {
                const userData = JSON.parse(stored);
                const userId = userData.userId || userData.id;
                setUserName(userData.name || 'ผู้ใช้');

                // Fetch user profile for referral codes
                const profileRes = await fetch(`/api/user/profile?userId=${userId}`);
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    if (data.profile) {
                        setReferralCode(data.profile.referral_code || '');
                        setReferredByCode(data.profile.referred_by_code || '');
                    }
                }

                // Fetch referral stats
                const statsRes = await fetch(`/api/user/referrals?userId=${userId}`);
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setReferralStats(statsData.stats || {
                        totalReferrals: 0,
                        pointsEarned: 0,
                        pendingReferrals: 0
                    });
                }
            } catch (error) {
                // Silently handle referral data fetch error
            } finally {
                setIsLoading(false);
            }
        };

        fetchReferralData();
    }, []);

    const handleApplyReferral = async () => {
        if (!referralInput.trim()) {
            setReferralMessage({ type: 'error', text: 'กรุณาใส่รหัสอ้างอิง' });
            return;
        }

        setIsApplyingReferral(true);
        setReferralMessage({ type: '', text: '' });

        try {
            const stored = localStorage.getItem('ayuraProfile');
            if (!stored) throw new Error('Not logged in');
            
            const userData = JSON.parse(stored);
            const userId = userData.userId || userData.id;

            const res = await fetch('/api/referral/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    referralCode: referralInput.trim()
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setReferralMessage({ type: 'success', text: `ใช้รหัสอ้างอิงสำเร็จ! คุณได้รับโบนัส ${data.pointsAwarded || 50} พอยท์` });
                setReferredByCode(referralInput.trim());
                setReferralInput('');
            } else {
                setReferralMessage({ type: 'error', text: data.error || 'ไม่สามารถใช้รหัสอ้างอิงได้' });
            }
        } catch (err) {
            setReferralMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setIsApplyingReferral(false);
            setTimeout(() => setReferralMessage({ type: '', text: '' }), 5000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-spin-slow mb-4">🎁</div>
                    <p className="text-[var(--color-text-light)]">กำลังโหลดข้อมูลการชวนเพื่อน...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            {/* Referral Message Toast */}
            {referralMessage.text && (
                <div className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl animate-fade-in flex items-center gap-3 ${
                    referralMessage.type === 'success' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                }`}>
                    <span className="text-xl">{referralMessage.type === 'success' ? '✅' : '❌'}</span>
                    <div>
                        <p className="font-bold text-sm">
                            {referralMessage.type === 'success' ? 'สำเร็จ!' : 'ไม่สำเร็จ'}
                        </p>
                        <p className="text-xs opacity-90">{referralMessage.text}</p>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-2">🎁 ชวนเพื่อน แนะนำเพื่อน</h1>
                    <p className="text-[var(--color-text-light)]">
                        แชร์รหัสอ้างอิงให้เพื่อน รับพอยท์สะสมพิเศษ
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Your Referral Code */}
                    <div className="space-y-6">
                        {/* Referral Code Card */}
                        <div className="glass-card p-6 animate-fade-in bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                🎯 รหัสอ้างอิงของคุณ
                            </h3>
                            
                            <div className="bg-white rounded-xl p-4 border border-[var(--color-primary)]/20">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={referralCode}
                                        readOnly
                                        className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 font-mono font-bold text-[var(--color-primary)] text-center text-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(referralCode || '');
                                            setReferralMessage({ type: 'success', text: 'คัดลอกรหัสอ้างอิงแล้ว!' });
                                            setTimeout(() => setReferralMessage({ type: '', text: '' }), 2000);
                                        }}
                                        className="px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                                    >
                                        📋 คัดลอก
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">📊 รวมที่ชวนแล้ว</span>
                                        <span className="text-lg font-bold text-[var(--color-primary)]">{referralStats.totalReferrals}</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">⭐ พอยท์ที่ได้รับ</span>
                                        <span className="text-lg font-bold text-[var(--color-secondary)]">{referralStats.pointsEarned}</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">⏳ รอยืนยัน</span>
                                        <span className="text-lg font-bold text-orange-500">{referralStats.pendingReferrals}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="glass-card p-6 animate-fade-in delay-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                💡 วิธีการทำงาน
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-[var(--color-primary)]">1</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text)]">แชร์รหัสอ้างอิงของคุณ</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">คัดลอกรหัสแล้วส่งให้เพื่อน</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-[var(--color-primary)]">2</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text)]">เพื่อนสมัครและใช้รหัส</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">เพื่อนได้รับโบนัส 50 พอยท์</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-[var(--color-primary)]">3</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text)]">คุณได้รับ 50 พอยท์</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">ทันทีเมื่อเพื่อนสมัครสำเร็จ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Apply Referral Code */}
                    <div className="space-y-6">
                        {!referredByCode ? (
                            <>
                                {/* Apply Referral Code */}
                                <div className="glass-card p-6 animate-fade-in delay-200">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                        🎁 มีรหัสอ้างอิงจากเพื่อน?
                                    </h3>
                                    
                                    <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            ใส่รหัสอ้างอิงของเพื่อน
                                        </label>
                                        <div className="flex items-center gap-3 mb-3">
                                            <input
                                                type="text"
                                                value={referralInput}
                                                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                                                placeholder="AYURA..."
                                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow bg-white font-mono uppercase"
                                            />
                                            <button
                                                onClick={handleApplyReferral}
                                                disabled={isApplyingReferral}
                                                className="px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-70"
                                            >
                                                {isApplyingReferral ? 'กำลัง...' : 'ใช้รหัส'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            ใส่รหัสอ้างอิงเพื่อรับโบนัส <strong>50 พอยท์</strong> (ใช้ได้ครั้งเดียว)
                                        </p>
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div className="glass-card p-6 animate-fade-in delay-300">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                        🎉 สิทธิประโยชน์
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                                            <span className="text-xl">🎁</span>
                                            <div>
                                                <p className="text-sm font-medium text-green-700">เพื่อนได้รับ 50 พอยท์</p>
                                                <p className="text-xs text-green-600">เมื่อสมัครใหม่และใช้รหัสของคุณ</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                                            <span className="text-xl">⭐</span>
                                            <div>
                                                <p className="text-sm font-medium text-blue-700">คุณได้รับ 50 พอยท์</p>
                                                <p className="text-xs text-blue-600">ทันทีเมื่อเพื่อนสมัครสำเร็จ</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-3">
                                            <span className="text-xl">🚀</span>
                                            <div>
                                                <p className="text-sm font-medium text-purple-700">ไม่จำกัดจำนวน</p>
                                                <p className="text-xs text-purple-600">ยิ่งชวนเยอะ ยิ่งได้เยอะ!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Already Used Referral Code */
                            <div className="glass-card p-6 animate-fade-in">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                    ✅ รหัสอ้างอิงที่ใช้แล้ว
                                </h3>
                                
                                <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                                    <div className="flex items-center gap-2 text-green-700 mb-3">
                                        <span className="text-xl">✅</span>
                                        <span className="font-bold">คุณได้ใช้รหัสอ้างอิงแล้ว</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        รหัสที่ใช้: <span className="font-mono font-bold text-[var(--color-primary)]">{referredByCode}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ขอบคุณที่เข้าร่วมผ่านรหัสอ้างอิง! ตอนนี้คุณสามารถแชร์รหัสของตัวเองให้เพื่อนได้แล้ว
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Share Options */}
                        <div className="glass-card p-6 animate-fade-in delay-400">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--color-primary-dark)]">
                                📤 แชร์รหัสอ้างอิง
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        const text = `เข้ามาสมัคร Ayura กับผม! ใช้รหัส ${referralCode} รับโบนัส 50 พอยท์ฟรี 🎁`;
                                        if (navigator.share) {
                                            navigator.share({
                                                title: 'ชวนเข้า Ayura',
                                                text: text
                                            });
                                        } else {
                                            navigator.clipboard.writeText(text);
                                            setReferralMessage({ type: 'success', text: 'คัดลอกข้อความแชร์แล้ว!' });
                                            setTimeout(() => setReferralMessage({ type: '', text: '' }), 2000);
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    📱 แชร์ผ่าน Social Media
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`รหัสอ้างอิง Ayura: ${referralCode}\n🎁 รับโบนัส 50 พอยท์เมื่อสมัคร!`);
                                        setReferralMessage({ type: 'success', text: 'คัดลอกรหัสแล้ว!' });
                                        setTimeout(() => setReferralMessage({ type: '', text: '' }), 2000);
                                    }}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    📋 คัดลอกเฉพาะรหัส
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-8 text-center animate-fade-in delay-500">
                    <Link href="/reword-points" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium">
                        ⭐ ดูแต้มสะสมของคุณ
                    </Link>
                </div>
            </div>
        </div>
    );
}
