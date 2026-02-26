'use client';

import { useState, useEffect } from 'react';


export default function CheckoutPage() {
    const [weeklyBox, setWeeklyBox] = useState<any | null>(null);
    const [plan, setPlan] = useState<'weekly' | 'monthly'>('weekly');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profile, setProfile] = useState<any>(null); // Added profile state

    useEffect(() => {
        const stored = localStorage.getItem('ayura-profile');
        if (stored) {
            const parsed = JSON.parse(stored);
            setProfile(parsed);
            setProfileName(parsed.name);
            const box = {
                items: [
                    { ingredient: { id: 'i1', name: 'อกไก่ออร์แกนิก', image: '🍗', pricePerUnit: 189 } },
                    { ingredient: { id: 'i2', name: 'ผักเชียงดา', image: '🥬', pricePerUnit: 85 } },
                    { ingredient: { id: 'i3', name: 'ขิงสด', image: '🫚', pricePerUnit: 55 } },
                    { ingredient: { id: 'i4', name: 'ใบเตย', image: '🍃', pricePerUnit: 35 } },
                    { ingredient: { id: 'i5', name: 'ข้าวกล้อง', image: '🌾', pricePerUnit: 145 } }
                ]
            };
            setWeeklyBox(box);
        } else {
            const box = {
                items: [
                    { ingredient: { id: 'i1', name: 'อกไก่ออร์แกนิก', image: '🍗', pricePerUnit: 189 } },
                    { ingredient: { id: 'i2', name: 'ผักเชียงดา', image: '🥬', pricePerUnit: 85 } },
                    { ingredient: { id: 'i3', name: 'ขิงสด', image: '🫚', pricePerUnit: 55 } },
                    { ingredient: { id: 'i4', name: 'ใบเตย', image: '🍃', pricePerUnit: 35 } },
                    { ingredient: { id: 'i5', name: 'ข้าวกล้อง', image: '🌾', pricePerUnit: 145 } }
                ]
            };
            setWeeklyBox(box);
            setProfileName('ผู้ใช้ตัวอย่าง');
        }
    }, []);

    const subtotal = 509;
    const deliveryFee = 50;

    const getTotalPrice = (p: string) => {
        if (p === 'weekly') return subtotal + deliveryFee;
        return Math.round((subtotal * 4) * 0.9) + deliveryFee;
    };

    const getDiscountAmount = (p: string) => {
        if (p === 'weekly') return 0;
        return Math.round((subtotal * 4) * 0.1);
    };

    const discountAmount = getDiscountAmount(plan);
    const total = getTotalPrice(plan);
    const planMultiplier = plan === 'monthly' ? 4 : 1;

    const handleOrder = () => {
        setShowSuccess(true);
    };

    if (!weeklyBox) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-spin-slow mb-4">🌿</div>
                    <p className="text-[var(--color-text-light)]">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gradient mb-2">สั่งซื้อกล่องสุขภาพ</h1>
                    <p className="text-[var(--color-text-light)]">เลือกแผนและกรอกข้อมูลจัดส่ง</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Form */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Plan Selection */}
                        <div className="glass-card p-6 animate-fade-in">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                📋 เลือกแผนสมัครสมาชิก
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPlan('weekly')}
                                    className={`p-5 rounded-xl border-2 text-center transition-all hover-lift ${plan === 'weekly'
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                        : 'border-[var(--color-border)] bg-white'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">📦</div>
                                    <div className="font-bold text-sm">รายสัปดาห์</div>
                                    <div className="text-lg font-bold text-[var(--color-primary)] mt-1">
                                        ฿{getTotalPrice('weekly')}
                                    </div>
                                    <div className="text-xs text-[var(--color-text-muted)] mt-1">ต่อสัปดาห์</div>
                                </button>
                                <button
                                    onClick={() => setPlan('monthly')}
                                    className={`p-5 rounded-xl border-2 text-center transition-all hover-lift relative ${plan === 'monthly'
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                        : 'border-[var(--color-border)] bg-white'
                                        }`}
                                >
                                    <div className="absolute -top-3 right-3 bg-[var(--color-accent-dark)] text-white text-xs px-3 py-1 rounded-full font-bold">
                                        ลด 10%
                                    </div>
                                    <div className="text-3xl mb-2">📦📦📦📦</div>
                                    <div className="font-bold text-sm">รายเดือน (4 สัปดาห์)</div>
                                    <div className="text-lg font-bold text-[var(--color-primary)] mt-1">
                                        ฿{getTotalPrice('monthly')}
                                    </div>
                                    <div className="text-xs text-[var(--color-text-muted)] mt-1">ต่อเดือน</div>
                                </button>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="glass-card p-6 animate-fade-in delay-100">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                🚚 ข้อมูลจัดส่ง
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">ชื่อผู้รับ</label>
                                    <input
                                        type="text"
                                        defaultValue={profileName}
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">ที่อยู่จัดส่ง</label>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows={3}
                                        placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">เบอร์โทร</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0XX-XXX-XXXX"
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="glass-card p-6 animate-fade-in delay-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                💳 ช่องทางชำระเงิน
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { icon: '🏦', label: 'โอนผ่านธนาคาร', sub: 'SCB, KBank, BBL, etc.' },
                                    { icon: '💳', label: 'บัตรเครดิต/เดบิต', sub: 'Visa, Mastercard' },
                                    { icon: '📱', label: 'PromptPay', sub: 'สแกน QR Code' },
                                ].map((method, i) => (
                                    <label
                                        key={i}
                                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-[var(--color-border)] bg-white cursor-pointer hover:border-[var(--color-primary)]/30 transition-all"
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            defaultChecked={i === 0}
                                            className="w-4 h-4 accent-[var(--color-primary)]"
                                        />
                                        <span className="text-2xl">{method.icon}</span>
                                        <div>
                                            <div className="text-sm font-medium">{method.label}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">{method.sub}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6 sticky top-24 animate-fade-in delay-200">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                🛒 สรุปคำสั่งซื้อ
                            </h3>

                            <div className="space-y-3 mb-4">
                                {weeklyBox.items.map((item: any) => item.ingredient).map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{item.image}</span>
                                            <span className="text-sm">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-medium">฿{item.pricePerUnit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-[var(--color-border)] py-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-text-light)]">
                                        ค่าวัตถุดิบ {plan === 'monthly' ? '(x4 สัปดาห์)' : ''}
                                    </span>
                                    <span>฿{subtotal * planMultiplier}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-text-light)]">ค่าจัดส่ง</span>
                                    <span>฿{deliveryFee}</span>
                                </div>
                                {plan === 'monthly' && (
                                    <div className="flex justify-between text-sm text-[var(--color-success)]">
                                        <span>ส่วนลดแผนรายเดือน (10%)</span>
                                        <span>-฿{discountAmount}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-[var(--color-border)] pt-3 flex justify-between items-center">
                                <span className="font-bold">ยอดรวม</span>
                                <span className="text-2xl font-bold text-[var(--color-primary)]">฿{total}</span>
                            </div>

                            <button
                                onClick={handleOrder}
                                className="btn-primary w-full mt-6 justify-center !py-4 text-base"
                            >
                                ยืนยันคำสั่งซื้อ ✅
                            </button>

                            <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
                                *จัดส่งทุกวันจันทร์ของสัปดาห์ ภายใน 1-2 วันทำการ
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card !bg-white p-8 max-w-md w-full text-center">
                        <div className="text-6xl mb-4 animate-float">🎉</div>
                        <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-2">
                            สั่งซื้อสำเร็จ!
                        </h2>
                        <p className="text-[var(--color-text-light)] mb-2">
                            กล่องสุขภาพ Ayura จะจัดส่งถึงคุณเร็วๆ นี้
                        </p>
                        <div className="bg-[var(--color-bg-section)] p-4 rounded-xl mb-6">
                            <div className="text-sm text-[var(--color-text-light)]">หมายเลขคำสั่งซื้อ</div>
                            <div className="font-bold text-lg text-[var(--color-primary)]">
                                ORD-2024-{String(Math.floor(Math.random() * 900) + 100)}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="btn-outline flex-1 justify-center"
                            >
                                ปิด
                            </button>
                            <a href="/bio-age" className="btn-primary flex-1 justify-center">
                                ดูแต้มสุขภาพ
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
