'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore
import generatePayload from 'promptpay-qr';
import { QRCodeSVG } from 'qrcode.react';

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
    const [userCoupons, setUserCoupons] = useState<any[]>([]);
    const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [paymentMethod, setPaymentMethod] = useState<'PROMPTPAY' | 'WALLET'>('PROMPTPAY');
    const [showQR, setShowQR] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPendingPopup, setShowPendingPopup] = useState(false);
    const [showStockErrorPopup, setShowStockErrorPopup] = useState(false);

    useEffect(() => {
        const storedProfile = localStorage.getItem('ayuraProfile');
        if (storedProfile) {
            const parsed = JSON.parse(storedProfile);
            // Check if ID is in old UUID format - if so, clear session and redirect to login
            const userId = parsed.userId || parsed.id;
            if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(userId)) {
                localStorage.removeItem('ayuraProfile');
                alert('กรุณาเข้าสู่ระบบใหม่เนื่องจากมีการอัปเดตระบบ');
                router.push('/login');
                return;
            }
            setProfile(parsed);
            setProfileName(parsed.name);
        } else {
            router.push('/login');
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
                setIsPreOrder(orderData.isPreOrder || false); // Read pre-order flag

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
                            actualGrams: Math.round(bItem.gramsPerWeek * (orderData.sizeMultiplier || 1.0)),
                            boxNote: bItem.note || '',  // note specific to this ingredient in the set
                        };
                    }).filter((item: any) => item.id); // Filter out if ingredient not found
                    setBoxItems(combined);
                }
            } catch (e) {
                // Silently handle checkout data loading error
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [router]);

    // Calculate discount (no delivery fee - already included in box price)
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const totalAfterDiscount = Math.max(0, finalPrice - discountAmount);

    // Fetch user's coupons on load
    useEffect(() => {
        const fetchCoupons = async () => {
            const stored = localStorage.getItem('ayuraProfile');
            if (!stored) return;
            const sessionData = JSON.parse(stored);
            
            try {
                const res = await fetch(`/api/user/redeem?email=${sessionData.email}`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter only discount coupons that are active
                    const discountCoupons = (data.activeCoupons || []).filter(
                        (c: any) => c.discount_type !== 'free_shipping'
                    );
                    setUserCoupons(discountCoupons);
                }
            } catch (error) {
                // Silently handle coupon fetch error
            }
        };
        
        fetchCoupons();
    }, []);

    const applySelectedCoupon = () => {
        if (!selectedCoupon) return;
        
        // Calculate discount on order total
        let discountAmount = 0;
        let discountDescription = '';

        if (selectedCoupon.discount_type === 'fixed') {
            discountAmount = selectedCoupon.discount_value;
            discountDescription = `ส่วนลด ${selectedCoupon.discount_value} บาท`;
        } else if (selectedCoupon.discount_type === 'percentage') {
            discountAmount = (finalPrice * selectedCoupon.discount_value) / 100;
            discountDescription = `ส่วนลด ${selectedCoupon.discount_value}%`;
        }

        discountAmount = Math.min(discountAmount, finalPrice);

        setAppliedCoupon({
            ...selectedCoupon,
            discountAmount,
            description: discountDescription
        });
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setSelectedCoupon(null);
    };

    // Reverse engineer discount display if it's monthly
    const isMonthly = plan === 'monthly';
    const planMultiplier = isMonthly ? 4 : 1;
    // Let's assume subtotal we reverse engineered already includes discount if monthly. 
    // To keep UI simple, let's just show Subtotal = finalPrice - deliveryFee
    // The previous design showed base price and discount separate, but it's cleaner to just show final.

    // Main checkout button
    const handleOrder = async () => {
        if (!address.trim()) {
            alert('กรุณาระบุที่อยู่จัดส่ง');
            return;
        }
        setIsProcessing(true);

        try {
            const stored = localStorage.getItem('ayuraProfile');
            if (!stored) return;
            const sessionData = JSON.parse(stored);

            if (paymentMethod === 'PROMPTPAY') {
                // Just open the QR modal
                setShowQR(true);
                setIsProcessing(false);
                return;
            }

            // WALLET flow: verify balance then create order
            const profileRes = await fetch(`/api/user/profile?userId=${sessionData.userId || sessionData.id}`);
            const profileData = await profileRes.json();
            const actualBalance = profileData.profile?.balance || 0;

            if (actualBalance < finalPrice) {
                alert(`ยอดเงินใน Wallet ไม่เพียงพอ (ปัจจุบัน: ฿${actualBalance}) กรุณาเติมเงินเพิ่ม`);
                setIsProcessing(false);
                return;
            }

            await submitOrder(sessionData, 'WALLET');
        } catch (err) {
            // Silently handle order error
        } finally {
            setIsProcessing(false);
        }
    };

    // QR confirm button: submit the order as PromptPay
    const handleConfirmPromptPay = async () => {
        setIsProcessing(true);
        try {
            const stored = localStorage.getItem('ayuraProfile');
            if (!stored) return;
            const sessionData = JSON.parse(stored);
            await submitOrder(sessionData, 'PROMPTPAY');
        } catch (err) {
            // Silently handle PromptPay confirm error
        } finally {
            setIsProcessing(false);
        }
    };

    const [createdOrderId, setCreatedOrderId] = useState<string>('');
    const [isPreOrder, setIsPreOrder] = useState(false);

    const submitOrder = async (sessionData: any, method: 'WALLET' | 'PROMPTPAY') => {
        const orderPayload = {
            userId: sessionData.userId || sessionData.id,
            customerName: profileName,
            address,
            phone,
            totalPrice: totalAfterDiscount,
            originalPrice: finalPrice,
            discountAmount: appliedCoupon?.discountAmount || 0,
            couponCode: appliedCoupon?.coupon_code || appliedCoupon?.code || null,
            mealSetId: mealSet?._id || mealSet?.id,
            mealSetName: mealSet?.name || '',
            plan,
            boxSize,
            sizeMultiplier,
            paymentMethod: method,
            isPreOrder, // Pass pre-order flag
        };
        
        const res = await fetch('/api/user/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });
        
        if (res.ok) {
            const data = await res.json();
            
            // Mark coupon as used if applied
            if (appliedCoupon) {
                const couponCodeToUse = appliedCoupon.coupon_code || appliedCoupon.code;
                if (couponCodeToUse) {
                    try {
                        const couponRes = await fetch('/api/coupons/use', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                couponCode: couponCodeToUse,
                                orderId: data.orderId
                            })
                        });
                        if (!couponRes.ok) {
                            // Silently handle error
                        }
                    } catch (err) {
                        // Silently handle coupon mark-as-used error
                    }
                }
            }
            
            setCreatedOrderId(data.orderId);
            setShowQR(false);
            setShowPendingPopup(true);
        } else {
            const errText = await res.text();
            let err;
            try {
                err = JSON.parse(errText);
            } catch {
                err = { error: errText || 'Unknown error', message: errText || 'Unknown error' };
            }
            if (err.error === 'STOCK_ERROR') {
                setShowQR(false);
                setShowStockErrorPopup(true);
            } else {
                alert(`เกิดข้อผิดพลาด: ${err.error || err.message || 'Unknown error'}`);
            }
        }
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
                                    { id: 'PROMPTPAY', icon: '📱', label: 'PromptPay', sub: 'สแกน QR Code' },
                                    { id: 'WALLET', icon: '💰', label: 'เงินในเว็บไซต์ (Wallet)', sub: `ยอดเงินคงเหลือ: ฿${profile?.balance?.toLocaleString() || 0}` },
                                ].map((method, i) => (
                                    <label
                                        key={i}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === method.id
                                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                            : 'border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/30'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === method.id}
                                            onChange={() => setPaymentMethod(method.id as any)}
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
                                        <div key={item.id} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                            <div className="flex items-center justify-between">
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
                                            {item.boxNote && (
                                                <div className="mt-2 ml-12 flex items-start gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                                                    <span className="shrink-0">📝</span>
                                                    <span className="leading-relaxed">{item.boxNote}</span>
                                                </div>
                                            )}
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
                                        ราคา{isMonthly ? ' (รายเดือน)' : ' (รายสัปดาห์)'}
                                    </span>
                                    <span>฿{finalPrice}</span>
                                </div>
                                
                                {/* Coupon Dropdown */}
                                <div className="mt-3 pt-3 border-t border-dashed border-[var(--color-border)]">
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-green-800">
                                                    {appliedCoupon.coupon_code || appliedCoupon.code}
                                                </p>
                                                <p className="text-xs text-green-600">
                                                    {appliedCoupon.description} - ฿{appliedCoupon.discountAmount}
                                                </p>
                                            </div>
                                            <button
                                                onClick={removeCoupon}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                ยกเลิก
                                            </button>
                                        </div>
                                    ) : userCoupons.length > 0 ? (
                                        <div className="flex gap-2">
                                            <select
                                                value={selectedCoupon?.id || ''}
                                                onChange={(e) => {
                                                    const coupon = userCoupons.find(c => c.id.toString() === e.target.value);
                                                    setSelectedCoupon(coupon || null);
                                                }}
                                                className="flex-1 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                            >
                                                <option value="">เลือกคูปองส่วนลด</option>
                                                {userCoupons.map((coupon) => (
                                                    <option key={coupon.id} value={coupon.id}>
                                                        {coupon.coupon_code} - {coupon.discount_type === 'percentage' ? `ลด ${coupon.discount_value}%` : `ลด ฿${coupon.discount_value}`}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={applySelectedCoupon}
                                                disabled={!selectedCoupon}
                                                className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
                                            >
                                                ใช้
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[var(--color-text-muted)]">
                                            ไม่มีคูปองส่วนลด
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-[var(--color-border)] pt-4 mt-2 mb-2">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-[var(--color-text)]">ยอดรวมทั้งสิ้น</span>
                                    <div className="text-right">
                                        <div className="text-3xl font-extrabold text-[var(--color-primary)]">
                                            ฿{totalAfterDiscount}
                                        </div>
                                        {appliedCoupon && (
                                            <div className="text-xs text-green-600 mt-1">
                                                ประหยัดได้ ฿{appliedCoupon.discountAmount}
                                            </div>
                                        )}
                                        <div className="text-xs text-[var(--color-text-muted)] mt-1">
                                            (รวม VAT แล้ว)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleOrder}
                                className="btn-primary w-full mt-6 justify-center !py-4 text-lg tracking-wide shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งซื้อ ✅'}
                            </button>

                            <p className="text-xs text-[var(--color-text-light)] text-center mt-4 px-2">
                                <span className="text-[var(--color-primary)] font-semibold">Ayura</span> จัดส่งกล่องสุขภาพทุกวัน
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
                        {createdOrderId && (
                            <div className="bg-[var(--color-bg-section)] border border-[var(--color-border)] p-4 rounded-xl mb-8 mt-6">
                                <div className="text-xs text-[var(--color-text-light)] uppercase tracking-wider font-semibold mb-1">หมายเลขคำสั่งซื้อ</div>
                                <div className="font-bold text-xl text-[var(--color-primary)] font-mono">
                                    {createdOrderId}
                                </div>
                            </div>
                        )}
                        <div className="space-y-3">
                            <a href="/dashboard" className="btn-primary w-full justify-center !py-3 shadow-md">
                                ไปที่แดชบอร์ด
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment QR Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
                        <div className="bg-blue-900 text-white py-3 rounded-t-xl mx-4 font-bold tracking-wider">
                            PromptPay
                        </div>
                        <div className="bg-white p-4 border-2 border-t-0 border-blue-900 rounded-b-xl mx-4 mb-6 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
                            <div className="w-48 h-48 bg-white flex items-center justify-center mb-4 border border-gray-100 rounded-lg overflow-hidden">
                                <QRCodeSVG
                                    value={generatePayload(process.env.NEXT_PUBLIC_PROMPTPAY_NUMBER || '0000000000', { amount: totalAfterDiscount })}
                                    size={180}
                                    level="L"
                                    includeMargin={false}
                                />
                            </div>
                            <div className="text-sm text-gray-500 mb-1">ยอดชำระ</div>
                            <div className="text-3xl font-bold text-[var(--color-primary)]">฿{totalAfterDiscount}</div>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 px-4">
                            กรุณาสแกน QR Code ด้วยแอพพลิเคชั่นธนาคารของคุณ เพื่อชำระเงิน
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQR(false)}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                disabled={isProcessing}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirmPromptPay}
                                className="flex-1 py-3 px-4 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'กำลังตรวจสอบ...' : 'ยืนยันการชำระเงิน'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Approval Popup */}
            {showPendingPopup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card !bg-white p-8 max-w-sm w-full text-center shadow-xl">
                        <div className="text-7xl mb-6 animate-pulse">⏳</div>
                        <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-3">
                            {paymentMethod === 'PROMPTPAY' ? 'รอตรวจสอบยอดเงิน' : 'รอการอนุมัติออเดอร์'}
                        </h2>
                        <p className="text-[var(--color-text-light)] mb-6 leading-relaxed">
                            ระบบได้รับคำสั่งซื้อของคุณแล้ว<br />
                            {paymentMethod === 'PROMPTPAY' ? (
                                <strong>กรุณารอ Admin ตรวจสอบยอดเงินและยืนยันรายการ</strong>
                            ) : (
                                <strong>กรุณารอ Admin อนุมัติคำสั่งซื้อของคุณ</strong>
                            )}<br />
                            โดยปกติใช้เวลาไม่เกิน 24 ชั่วโมง
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
                            <p className="text-xs text-yellow-700 font-medium">📋 สิ่งที่ต้องทำ</p>
                            <p className="text-xs text-yellow-600 mt-1 leading-relaxed">
                                สถานะจะอัปเดตที่แดชบอร์ดของคุณเมื่อ Admin ยืนยันการชำระเงินเรียบร้อยแล้ว
                            </p>
                        </div>
                        {createdOrderId && (
                            <div className="bg-[var(--color-bg-section)] border border-[var(--color-border)] p-4 rounded-xl mb-6 mt-2">
                                <div className="text-xs text-[var(--color-text-light)] uppercase tracking-wider font-semibold mb-1">หมายเลขคำสั่งซื้อ</div>
                                <div className="font-bold text-xl text-[var(--color-primary)] font-mono">
                                    {createdOrderId}
                                </div>
                            </div>
                        )}
                        <a href="/dashboard" className="btn-primary w-full justify-center !py-3 shadow-md block">
                            ไปที่แดชบอร์ด
                        </a>
                    </div>
                </div>
            )}
        {/* Stock Error Popup */}
            {showStockErrorPopup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-card !bg-white p-8 max-w-md w-full text-center shadow-xl">
                        <div className="text-7xl mb-6">😔</div>
                        <h2 className="text-2xl font-bold text-[var(--color-danger)] mb-3">
                            ขออภัย ไม่สามารถสั่งซื้อได้
                        </h2>
                        <p className="text-[var(--color-text-light)] mb-6 leading-relaxed">
                            วัตถุดิบบางรายการในกล่องสุขภาพของคุณหมดชั่วคราว<br />
                            เรากำลังดำเนินการเติมสต็อกโดยเร็วที่สุด
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm text-red-700 font-medium mb-2">🌿 ข้อแนะนำ</p>
                            <ul className="text-xs text-red-600 space-y-1">
                                <li>• ลองสั่งใหม่ในภายหลัง (1-2 ชั่วโมง)</li>
                                <li>• ติดต่อแอดมินเพื่อสอบถามสต็อกล่าสุด</li>
                                <li>• เลือกเซ็ตอาหารอื่นที่มีสต็อกเพียงพอ</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary w-full justify-center !py-3 shadow-md"
                            >
                                ลองใหม่อีกครั้ง
                            </button>
                            <a href="/meal-plan" className="btn-outline w-full justify-center !py-3 block">
                                เลือกเซ็ตอื่น
                            </a>
                            <a href="/dashboard" className="text-[var(--color-text-light)] text-sm hover:text-[var(--color-primary)] block">
                                กลับไปแดชบอร์ด
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
