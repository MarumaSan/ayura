'use client';

import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
    { href: '/', label: 'หน้าแรก' },
    { href: '/assessment', label: 'ประเมินสุขภาพ' },
    { href: '/dashboard', label: 'กล่องสุขภาพ' },
    { href: '/meal-plan', label: 'แผนอาหาร' },
    { href: '/bio-age', label: 'แต้มสุขภาพ' },
    { href: '/admin', label: 'สำหรับชุมชน' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

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
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Button (desktop) */}
                    <div className="hidden md:block">
                        <Link href="/assessment" className="btn-primary text-sm !py-2 !px-5">
                            เริ่มเลย ✨
                        </Link>
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
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-primary)]/10 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/assessment"
                        onClick={() => setIsOpen(false)}
                        className="block text-center btn-primary text-sm !py-3 mt-2"
                    >
                        เริ่มเลย ✨
                    </Link>
                </div>
            </div>
        </nav>
    );
}
