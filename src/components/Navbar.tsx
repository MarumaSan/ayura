'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
// @ts-ignore
import generatePayload from 'promptpay-qr';
import { QRCodeSVG } from 'qrcode.react';

const navLinks = [
    { href: '/', label: 'หน้าแรก', public: true },
    { href: '/dashboard', label: 'กล่องสุขภาพ', public: false },
    { href: '/meal-plan', label: 'เซ็ตอาหาร', public: false },
    { href: '/reword-points', label: 'แต้มสะสม', public: false },
    { href: '/admin', label: 'Admin Menu', public: false, adminOnly: true },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('user');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [balance, setBalance] = useState<number>(0);
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [topupAmount, setTopupAmount] = useState<number | ''>('');
    const [isToppingUp, setIsToppingUp] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const [showTopupPendingPopup, setShowTopupPendingPopup] = useState(false);
    const [showFriendModal, setShowFriendModal] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [isCopying, setIsCopying] = useState(false);
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const [referralStats, setReferralStats] = useState({ totalPoints: 0, pendingCount: 0, rewardedCount: 0 });

    const checkLoginStatus = async () => {
        const profile = localStorage.getItem('ayuraProfile');
        if (profile) {
            setIsLoggedIn(true);
            const data = JSON.parse(profile);
            setUserName(data.name || 'ผู้ใช้');
            setUserRole(data.role || 'user');
            setUserId(data.userId || data.id || '');

            try {
                const res = await fetch(`/api/user/profile?userId=${data.userId || data.id}`);
                if (res.ok) {
                    const result = await res.json();
                    setBalance(result.profile.balance || 0);
                    setReferralCode(result.profile.referralCode || '');
                    setUserRole(result.profile.role || 'user');
                    // update local storage
                    data.balance = result.profile.balance || 0;
                    data.role = result.profile.role || 'user';
                    localStorage.setItem('ayuraProfile', JSON.stringify(data));
                }
                
                // Fetch referral stats
                const refRes = await fetch(`/api/user/referrals?email=${data.email}`);
                if (refRes.ok) {
                    const refData = await refRes.json();
                    setReferralStats({
                        totalPoints: refData.totalPoints || 0,
                        pendingCount: refData.pendingCount || 0,
                        rewardedCount: refData.rewardedCount || 0
                    });
                }
            } catch (err) {
                setBalance(data.balance || 0);
            }
        } else {
            setIsLoggedIn(false);
            setUserName('');
            setUserRole('user');
            setUserId('');
            setBalance(0);
            setIsDropdownOpen(false); // Close dropdown if logged out
        }
    };

    useEffect(() => {
        checkLoginStatus(); // Initial check

        // Listen for internal app login/logout events
        window.addEventListener('auth-change', checkLoginStatus);

        // Listen for localStorage changes from other tabs
        window.addEventListener('storage', checkLoginStatus);

        return () => {
            window.removeEventListener('auth-change', checkLoginStatus);
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('ayuraProfile');
        // Notify other components/tabs
        window.dispatchEvent(new Event('auth-change'));
        window.location.href = '/login';
    };

    const visibleNavLinks = navLinks.filter(link => {
        if (link.adminOnly && userRole !== 'admin') return false;
        return true;
    });

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: any) => {
        if (!link.public && !isLoggedIn) {
            e.preventDefault();
            // Redirect to login if trying to access a private route while logged out
            window.location.href = '/login';
            return;
        }

        if (link.adminOnly && userRole !== 'admin') {
            e.preventDefault();
            // Block non-admins
            window.location.href = '/dashboard';
            return;
        }
    };

    const handleTopup = async () => {
        if (!topupAmount || topupAmount <= 0) return;
        setIsToppingUp(true);
        try {
            const res = await fetch('/api/wallet/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount: Number(topupAmount) })
            });
            if (res.ok) {
                setShowTopupModal(false);
                setShowQR(false);
                setTopupAmount('');
                setShowTopupPendingPopup(true);
            }
        } catch (err) {
            // Silently handle topup error
        } finally {
            setIsToppingUp(false);
        }
    };

    const handleCopyReferralCode = async () => {
        if (!referralCode) return;
        
        setIsCopying(true);
        setCopyMessage(null);
        
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopyMessage('คัดลอกรหัสอ้างอิงแล้ว!');
        } catch (err) {
            setCopyMessage('ไม่สามารถคัดลอกได้');
        } finally {
            setIsCopying(false);
            setTimeout(() => setCopyMessage(null), 2000);
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-16 relative">
                        {/* Logo - Centered */}
                        <Link href="/" className="flex items-center gap-2 group absolute left-1/2 -translate-x-1/2">
                            <Image 
                                src="/logo.svg" 
                                alt="Ayura" 
                                width={120} 
                                height={40} 
                                className="h-80 w-auto object-contain"
                                priority
                            />
                        </Link>

                        {/* Desktop Nav - Left */}
                        <div className="hidden md:flex items-center gap-1 mr-auto">
                            {visibleNavLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* CTA Button & Profile Dropdown (desktop) - Right */}
                        <div className="hidden md:flex items-center gap-4 relative ml-auto">
                            {isLoggedIn ? (
                                <>
                                    {/* Wallet Bubble */}
                                    <button
                                        onClick={() => setShowTopupModal(true)}
                                        className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-colors border border-[var(--color-primary)]/20 shadow-sm"
                                        title="เติมเงิน"
                                    >
                                        <span className="text-sm">💰</span>
                                        <span className="text-sm font-bold text-[var(--color-primary)]">฿{balance.toLocaleString()}</span>
                                    </button>

                                    <div className="relative">
                                        {/* Profile Button */}
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm bg-white"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm">
                                                {userName.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                                {userName}
                                            </span>
                                            <span className="text-xs text-gray-500">▼</span>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                />
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                                                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                                                        <p className="text-sm text-gray-500">ยินดีต้อนรับ</p>
                                                        <p className="text-sm font-bold text-[var(--color-primary-dark)] truncate">{userName}</p>
                                                    </div>
                                                    <div className="border-b border-gray-100 py-2">
                                                        <div className="px-4 py-1.5 flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">กระเป๋าเงิน (Wallet)</span>
                                                        </div>
                                                        <div className="px-4 py-1 flex justify-between items-center">
                                                            <span className="text-sm font-bold text-[var(--color-primary)]">฿{balance.toLocaleString()}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setIsDropdownOpen(false);
                                                                    setShowTopupModal(true);
                                                                }}
                                                                className="text-xs bg-[var(--color-primary)] text-white px-2 py-1 rounded hover:bg-[var(--color-primary-dark)] transition-colors"
                                                            >
                                                                เติมเงิน
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="py-2">
                                                        <div className="px-4 py-1.5 flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ชวนเพื่อน</span>
                                                            {referralStats.rewardedCount > 0 && (
                                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                                    +{referralStats.totalPoints} แต้ม
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setIsDropdownOpen(false);
                                                                setShowFriendModal(true);
                                                            }}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-all w-full text-left"
                                                        >
                                                            <span className="text-lg">🎁</span>
                                                            <span>ชวนเพื่อน</span>
                                                            {referralStats.pendingCount > 0 && (
                                                                <span className="ml-auto text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                                                    รอ {referralStats.pendingCount}
                                                                </span>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="border-t border-gray-100 py-2">
                                                        <div className="px-4 py-1.5 flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ข้อมูลสุขภาพ</span>
                                                        </div>
                                                        <Link
                                                            href="/profile"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-all"
                                                        >
                                                            <span className="text-lg">📊</span>
                                                            <span>ข้อมูลส่วนตัว</span>
                                                        </Link>
                                                        <Link
                                                            href="/reword-points"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-all"
                                                        >
                                                            <span className="text-lg">🌟</span>
                                                            <span>แต้มสะสม</span>
                                                        </Link>
                                                    </div>
                                                    <div className="border-t border-gray-100 py-2">
                                                        <div className="px-4 py-1.5 flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">การจัดการ</span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setIsDropdownOpen(false);
                                                                handleLogout();
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                                                        >
                                                            <span className="text-lg">🚪</span>
                                                            <span>ออกจากระบบ</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Link href="/login" className="btn-primary text-sm !py-2 !px-5">
                                    เข้าสู่ระบบ
                                </Link>
                            )}
                        </div>

                        {/* Mobile Hamburger - Absolute Right */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors absolute right-0"
                            aria-label="Toggle menu"
                        >
                            <div className="w-5 h-4 flex flex-col justify-between">
                                <span
                                    className={`block h-0.5 w-full bg-[var(--color-text)] transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''
                                        }`}
                                />
                                <span
                                    className={`block h-0.5 w-full bg-[var(--color-text)] transition-all duration-300 ${isOpen ? 'opacity-0' : ''
                                        }`}
                                />
                                <span
                                    className={`block h-0.5 w-full bg-[var(--color-text)] transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''
                                        }`}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 transition-all duration-300 overflow-y-auto z-50 ${isOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="px-4 pb-4 space-y-1">
                        {visibleNavLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={(e) => {
                                    setIsOpen(false);
                                    handleNavClick(e, link);
                                }}
                                className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-primary)]/10 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isLoggedIn ? (
                            <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                                {/* Profile Header */}
                                <div className="px-4 py-2 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-lg">
                                        {userName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">โปรไฟล์ของคุณ</p>
                                        <p className="text-sm font-bold text-[var(--color-primary-dark)] truncate">{userName}</p>
                                    </div>
                                </div>

                                {/* Wallet Section */}
                                <div className="px-4 py-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">กระเป๋าเงิน (Wallet)</p>
                                            <p className="text-base font-bold text-[var(--color-primary)]">฿{balance.toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                setShowTopupModal(true);
                                            }}
                                            className="text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                                        >
                                            เติมเงิน
                                        </button>
                                    </div>
                                </div>

                                {/* Health Info Section */}
                                <div className="space-y-1">
                                    <div className="px-4 py-1.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ข้อมูลสุขภาพ</span>
                                    </div>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-[var(--color-primary)]/10 transition-colors"
                                    >
                                        <span className="text-lg">📊</span>
                                        <span>ข้อมูลส่วนตัว</span>
                                    </Link>
                                    <Link
                                        href="/reword-points"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-[var(--color-primary)]/10 transition-colors"
                                    >
                                        <span className="text-lg">🌟</span>
                                        <span>แต้มสะสม</span>
                                    </Link>
                                </div>

                                {/* Friend Referral Section */}
                                <div className="pt-2">
                                    <div className="px-4 py-1.5 flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ชวนเพื่อน</span>
                                        {referralStats.rewardedCount > 0 && (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                +{referralStats.totalPoints} แต้ม
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { 
                                            setIsOpen(false); 
                                            setShowFriendModal(true); 
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-[var(--color-primary)]/10 transition-colors"
                                    >
                                        <span className="text-lg">🎁</span>
                                        <span>ชวนเพื่อน</span>
                                        {referralStats.rewardedCount > 0 && (
                                            <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                +{referralStats.totalPoints} แต้ม
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Management Section - Logout */}
                                <div className="pt-2">
                                    <div className="px-4 py-1.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">การจัดการ</span>
                                    </div>
                                    <button
                                        onClick={() => { setIsOpen(false); handleLogout(); }}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-bold text-red-600 border border-red-100 bg-red-50/50 hover:bg-red-100 transition-all"
                                    >
                                        <span className="text-lg">🚪</span>
                                        <span>ออกจากระบบ</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="block text-center btn-primary text-sm !py-3 mt-2"
                            >
                                เข้าสู่ระบบ ✨
                            </Link>
                        )}
                    </div>
                </div>

                {/* Top-up Modal */}
                {showTopupModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4" style={{ display: 'grid', placeItems: 'center', paddingTop: 'max(16px, env(safe-area-inset-top))', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', minHeight: '-webkit-fill-available' }}>
                        <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl" style={{ margin: 'auto', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }}>
                            <h2 className="text-xl font-bold mb-4 text-[var(--color-primary-dark)]">เติมเงินเข้า Wallet</h2>

                            {!showQR ? (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2 text-gray-700">จำนวนเงินที่ต้องการเติม (บาท)</label>
                                        <input
                                            type="number"
                                            value={topupAmount}
                                            onChange={(e) => setTopupAmount(Number(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-gray-50"
                                            placeholder="ระบุจำนวนเงิน"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowTopupModal(false)}
                                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (Number(topupAmount) > 0) setShowQR(true);
                                            }}
                                            className="flex-1 py-3 px-4 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                            disabled={!topupAmount || Number(topupAmount) <= 0}
                                        >
                                            สร้าง QR Code
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center animate-fade-in">
                                    <div className="bg-blue-900 text-white py-2 sm:py-3 rounded-t-xl mx-2 sm:mx-4 font-bold tracking-wider text-sm sm:text-base">
                                        PromptPay
                                    </div>
                                    <div className="bg-white p-2 sm:p-4 border-2 border-t-0 border-blue-900 rounded-b-xl mx-2 sm:mx-4 mb-4 sm:mb-6 shadow-sm flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px]">
                                        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-white flex items-center justify-center mb-2 sm:mb-4 border border-gray-100 rounded-lg overflow-hidden">
                                            <QRCodeSVG
                                                value={generatePayload(process.env.NEXT_PUBLIC_PROMPTPAY_NUMBER || '0000000000', { amount: Number(topupAmount) })}
                                                size={128}
                                                className="sm:w-[180px] sm:h-[180px]"
                                                level="L"
                                                includeMargin={false}
                                            />
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-500 mb-1">ยอดชำระ</div>
                                        <div className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">฿{Number(topupAmount).toLocaleString()}</div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 px-2 sm:px-4">
                                        กรุณาสแกน QR Code ด้วยแอพพลิเคชั่นธนาคารของคุณ
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowQR(false)}
                                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                            disabled={isToppingUp}
                                        >
                                            ย้อนกลับ
                                        </button>
                                        <button
                                            onClick={handleTopup}
                                            className="flex-1 py-3 px-4 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                            disabled={isToppingUp}
                                        >
                                            {isToppingUp ? 'กำลังส่งคำขอ...' : 'ยืนยันการชำระเงิน'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Topup Pending Popup */}
            {
                showTopupPendingPopup && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl my-4">
                            <div className="text-7xl mb-6 animate-pulse">⏳</div>
                            <h2 className="text-xl font-bold text-[var(--color-primary-dark)] mb-3">รอยืนยันการเติมเงิน</h2>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                ระบบได้รับคำขอเติมเงินของคุณแล้ว<br />
                                <strong>Admin จะตรวจสลิปโอนแล้วเติมเงินให้</strong><br />
                                โดยปกติไม่เกิน 24 ชั่วโมง
                            </p>
                            <button
                                onClick={() => setShowTopupPendingPopup(false)}
                                className="w-full py-3 px-4 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                                รับทราบ
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Friend Referral Modal */}
            {showFriendModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                    <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl my-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">ชวนเพื่อน 🎁</h2>
                            <button
                                onClick={() => {
                                    setShowFriendModal(false);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-4 bg-green-50 p-4 rounded-xl">
                            <p className="text-sm text-green-800">
                                <strong>รับ 50 แต้ม</strong> เมื่อเพื่อนของคุณสมัครและใช้รหัสอ้างอิง!
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                เพื่อนใหม่จะได้รับ 50 แต้ม Welcome Bonus ด้วย
                            </p>
                        </div>

                        {referralStats.rewardedCount > 0 && (
                            <div className="mb-4 flex items-center gap-4 text-sm">
                                <div className="bg-[var(--color-primary)]/10 px-3 py-2 rounded-lg">
                                    <span className="text-[var(--color-primary)] font-bold">{referralStats.rewardedCount}</span>
                                    <span className="text-gray-600 ml-1">เพื่อนที่ชวนสำเร็จ</span>
                                </div>
                                <div className="bg-green-100 px-3 py-2 rounded-lg">
                                    <span className="text-green-700 font-bold">+{referralStats.totalPoints}</span>
                                    <span className="text-gray-600 ml-1">แต้มรวม</span>
                                </div>
                            </div>
                        )}

                        {copyMessage ? (
                            <div className={`p-4 rounded-xl mb-4 ${copyMessage.includes('สำเร็จ') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                <p className="text-sm font-medium">{copyMessage}</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">
                                        รหัสอ้างอิงของคุณ
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={referralCode}
                                            readOnly
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-mono font-bold text-[var(--color-primary)] text-center"
                                        />
                                        <button
                                            onClick={handleCopyReferralCode}
                                            disabled={isCopying}
                                            className="px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
                                        >
                                            {isCopying ? 'กำลัง...' : '📋 คัดลอก'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        แชร์รหัสนี้ให้เพื่อนเพื่อรับโบนัสพิเศษ
                                    </p>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2 text-gray-700">
                                        ข้อความแชร์ (คัดลอกได้เลย)
                                    </label>
                                    <textarea
                                        value={`เข้ามาสมัคร Ayura กับผม! ใช้รหัส ${referralCode} รับโบนัส 50 พอยท์ฟรี 🎁`}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowFriendModal(false)}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                        disabled={isCopying}
                                    >
                                        ปิด
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`เข้ามาสมัคร Ayura กับผม! ใช้รหัส ${referralCode} รับโบนัส 50 พอยท์ฟรี 🎁`);
                                            setCopyMessage('คัดลอกข้อความแชร์แล้ว!');
                                            setTimeout(() => setCopyMessage(null), 2000);
                                        }}
                                        className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                                    >
                                        📱 คัดลอกข้อความ
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
