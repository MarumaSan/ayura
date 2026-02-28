'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter();
    const [plan, setPlan] = useState<'weekly' | 'monthly'>('weekly');
    const [boxSize, setBoxSize] = useState('M');
    const [sizeMultiplier, setSizeMultiplier] = useState(1.0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [mealSet, setMealSet] = useState<any>(null);
    const [boxItems, setBoxItems] = useState<any[]>([]);

    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedProfile = localStorage.getItem('ayuraProfile');
        if (storedProfile) {
            const parsed = JSON.parse(storedProfile);
            setProfile(parsed);
            setProfileName(parsed.name);
        }

        const loadData = async () => {
            try {
                const storedOrder = localStorage.getItem('pendingOrder');
                if (!storedOrder) {
                    router.push('/meal-plan');
                    return;
                }
                const orderData = JSON.parse(storedOrder);
                setPlan(orderData.plan);
                setBoxSize(orderData.boxSize);
                setSizeMultiplier(orderData.sizeMultiplier || 1.0);
                setFinalPrice(orderData.price);

                // Fetch meal sets
                const msRes = await fetch('/api/meal-sets');
                const msJson = await msRes.json();
                const selectedSet = msJson.data?.find((s: any) => s.id === orderData.mealSetId);
                setMealSet(selectedSet);

                // Fetch ingredients
                const ingRes = await fetch('/api/ingredients');
                const ingJson = await ingRes.json();
                const allIngredients = ingJson.data || [];

                if (selectedSet && selectedSet.boxIngredients) {
                    const combined = selectedSet.boxIngredients.map((bItem: any) => {
                        const ing = allIngredients.find((i: any) => i.id === bItem.ingredientId);
                        return {
                            ...ing,
                            baseGrams: bItem.gramsPerWeek,
                            actualGrams: Math.round(bItem.gramsPerWeek * (orderData.sizeMultiplier || 1.0))
                        };
                    }).filter((item: any) => item.id); // Filter out if ingredient not found
                    setBoxItems(combined);
                }
            } catch (e) {
                console.error('Error loading checkout data', e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    const deliveryFee = 50;
    const subtotal = finalPrice > deliveryFee ? finalPrice - deliveryFee : finalPrice;

    // Reverse engineer discount display if it's monthly
    const isMonthly = plan === 'monthly';
    const planMultiplier = isMonthly ? 4 : 1;
    // Let's assume subtotal we reverse engineered already includes discount if monthly. 
    // To keep UI simple, let's just show Subtotal = finalPrice - deliveryFee
    // The previous design showed base price and discount separate, but it's cleaner to just show final.

    const handleOrder = () => {
        setShowSuccess(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl animate-spin-slow mb-4">🌿</div>
                    <p className="text-[var(--color-text-light)]">กำลังเตรียมข้อมูลคำสั่งซื้อ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 animate-fade-in flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors">
                        ← กลับ
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gradient mb-1">ยืนยันคำสั่งซื้อ</h1>
                        <p className="text-[var(--color-text-light)]">ตรวจสอบรายละเอียดและกรอกข้อมูลจัดส่ง</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Form */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Plan Selection (Read-only summary of what they chose) */}
                        <div className="glass-card p-6 animate-fade-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-[100px] pointer-events-none" />
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                                📋 แผนที่คุณเลือก
                            </h3>
                            <div className="flex bg-white rounded-xl border border-[var(--color-border)] p-5 items-center justify-between shadow-sm relative z-10">
                                <div>
                                    <div className="font-bold text-lg">{mealSet?.name}</div>
                                    <div className="text-sm flex items-center gap-2 mt-1">
                                        <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] px-2 py-0.5 rounded text-xs font-semibold">
                                            ไซส์ {boxSize}
                                        </span>
                                        <span className="text-[var(--color-text-muted)]">
                                            ({plan === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน'})
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl mb-1">{plan === 'weekly' ? '📦' : '📦📦📦📦'}</div>
                                </div>
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

                            <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {boxItems.length > 0 ? (
                                    boxItems.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex items-center justify-center bg-white rounded shadow-sm text-xl">
                                                    {item.image}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold">{item.name}</div>
                                                    <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                                        ปริมาณต่อสัปดาห์
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-[var(--color-primary-dark)]">
                                                    {item.actualGrams} กรัม
                                                </div>
                                                {sizeMultiplier !== 1.0 && (
                                                    <div className="text-[10px] text-[var(--color-text-light)]">
                                                        (×{sizeMultiplier})
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-sm text-[var(--color-text-light)] py-4">
                                        ไม่พบข้อมูลวัตถุดิบ
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-[var(--color-border)] py-3 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-text-light)]">
                                        ค่าวัตถุดิบสุทธิ {isMonthly ? '(ลดแล้ว 10%)' : ''}
                                    </span>
                                    <span>฿{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--color-text-light)]">ค่าจัดส่ง</span>
                                    <span>฿{deliveryFee}</span>
                                </div>
                            </div>

                            <div className="border-t border-[var(--color-border)] pt-4 mt-2 mb-2">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-[var(--color-text)]">ยอดรวมทั้งสิ้น</span>
                                    <div className="text-right">
                                        <div className="text-3xl font-extrabold text-[var(--color-primary)]">
                                            ฿{finalPrice + deliveryFee}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                            (รวม VAT แล้ว)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleOrder}
                                className="btn-primary w-full mt-6 justify-center !py-4 text-lg tracking-wide shadow-md hover:shadow-lg transition-all"
                            >
                                ยืนยันคำสั่งซื้อ ✅
                            </button>

                            <p className="text-xs text-[var(--color-text-light)] text-center mt-4 px-2">
                                <span className="text-[var(--color-primary)] font-semibold">Ayura</span> จัดส่งกล่องสุขภาพทุกวันจันทร์
                                ควบคุมคุณภาพความสดใหม่ในทุกรอบส่ง
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card !bg-white p-8 max-w-sm w-full text-center shadow-xl">
                        <div className="text-7xl mb-6 animate-float">🎉</div>
                        <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-2">
                            สั่งซื้อสำเร็จ!
                        </h2>
                        <p className="text-[var(--color-text-light)] mb-2">
                            กล่องสุขภาพ Ayura จะจัดส่งถึงคุณเร็วๆ นี้
                        </p>
                        <div className="bg-[var(--color-bg-section)] border border-[var(--color-border)] p-4 rounded-xl mb-8 mt-6">
                            <div className="text-xs text-[var(--color-text-light)] uppercase tracking-wider font-semibold mb-1">หมายเลขคำสั่งซื้อ</div>
                            <div className="font-bold text-xl text-[var(--color-primary)] font-mono">
                                ORD-24-{String(Math.floor(Math.random() * 900) + 100)}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <a href="/dashboard" className="btn-primary w-full justify-center !py-3 shadow-md">
                                ไปที่แดชบอร์ด
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
