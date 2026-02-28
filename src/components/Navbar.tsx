'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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

    const checkLoginStatus = () => {
        const profile = localStorage.getItem('ayuraProfile');
        if (profile) {
            setIsLoggedIn(true);
            const data = JSON.parse(profile);
            setUserName(data.name || 'ผู้ใช้');
            setUserRole(data.role || 'user');
        } else {
            setIsLoggedIn(false);
            setUserName('');
            setUserRole('user');
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

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl">🌿</span>
                        <div>
                            <span className="text-xl font-bold text-gradient">Ayura</span>
                            <span className="text-xs block -mt-1 text-[var(--color-text-light)]">
                                อายุระ
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
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

                    {/* CTA Button & Profile Dropdown (desktop) */}
                    <div className="hidden md:flex items-center gap-4 relative">
                        {isLoggedIn ? (
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
                                            <div className="py-2">
                                                <div className="px-4 py-1.5 flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ข้อมูลสุขภาพ</span>
                                                </div>
                                                <Link
                                                    href="/dashboard"
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
                        ) : (
                            <Link href="/login" className="btn-primary text-sm !py-2 !px-5">
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors"
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
                className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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
                            <div className="px-4 py-2 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-lg">
                                    {userName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">โปรไฟล์ของคุณ</p>
                                    <p className="text-sm font-bold text-[var(--color-primary-dark)] truncate">{userName}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="px-4 py-1.5">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">ข้อมูลสุขภาพ</span>
                                </div>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 bg-white/50 hover:bg-[var(--color-primary)]/10 transition-colors border border-gray-100"
                                >
                                    <span className="text-lg">📊</span>
                                    <span>ข้อมูลส่วนตัว</span>
                                </Link>
                                <Link
                                    href="/bio-age"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 bg-white/50 hover:bg-[var(--color-primary)]/10 transition-colors border border-gray-100"
                                >
                                    <span className="text-lg">🌟</span>
                                    <span>แต้มสะสม</span>
                                </Link>
                            </div>

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
        </nav>
    );
}
