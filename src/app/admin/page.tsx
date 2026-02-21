import Link from 'next/link';
import { mockOrders } from '@/lib/data/orders';
import { ingredients } from '@/lib/data/ingredients';

export default function AdminPage() {
    const totalOrders = mockOrders.length;
    const totalRevenue = mockOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const pendingOrders = mockOrders.filter(
        (o) => o.status === 'รอจัดส่ง' || o.status === 'กำลังจัดเตรียม'
    ).length;
    const totalStock = ingredients.reduce((sum, i) => sum + i.inStock, 0);
    const lowStockCount = ingredients.filter((i) => i.inStock < 80).length;

    const stats = [
        {
            icon: '📦',
            label: 'ออเดอร์สัปดาห์นี้',
            value: totalOrders,
            sub: `${pendingOrders} รอจัดส่ง`,
            color: 'var(--color-primary)',
            bg: 'var(--color-primary)',
        },
        {
            icon: '💰',
            label: 'รายได้สัปดาห์นี้',
            value: `฿${totalRevenue.toLocaleString()}`,
            sub: `เฉลี่ย ฿${Math.round(totalRevenue / totalOrders)}/กล่อง`,
            color: 'var(--color-secondary)',
            bg: 'var(--color-secondary)',
        },
        {
            icon: '👥',
            label: 'สมาชิกใหม่',
            value: 12,
            sub: '+23% จากสัปดาห์ก่อน',
            color: 'var(--color-accent)',
            bg: 'var(--color-accent)',
        },
        {
            icon: '🌿',
            label: 'สต็อกคงเหลือ',
            value: `${totalStock} ชิ้น`,
            sub: `${lowStockCount} รายการใกล้หมด`,
            color: 'var(--color-primary-light)',
            bg: 'var(--color-primary-light)',
        },
    ];

    const recentOrders = mockOrders.slice(0, 3);

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[var(--color-bg-section)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient mb-2">
                                🏠 แดชบอร์ดชุมชน
                            </h1>
                            <p className="text-[var(--color-text-light)]">
                                ภาพรวมระบบ Ayura สำหรับผู้ดูแลและชุมชนผู้ผลิต
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/admin/inventory" className="btn-outline !py-2 !px-4 text-sm">
                                จัดการสต็อก 📋
                            </Link>
                            <Link href="/admin/orders" className="btn-primary !py-2 !px-4 text-sm">
                                ดูออเดอร์ 📦
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="glass-card p-5 hover-lift animate-fade-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-3xl">{stat.icon}</span>
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                    style={{ backgroundColor: stat.bg }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-2xl font-bold" style={{ color: stat.color }}>
                                {stat.value}
                            </div>
                            <div className="text-sm text-[var(--color-text-light)]">{stat.label}</div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-1">{stat.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="glass-card p-6 animate-fade-in delay-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                📦 ออเดอร์ล่าสุด
                            </h3>
                            <Link href="/admin/orders" className="text-sm text-[var(--color-primary)] hover:underline">
                                ดูทั้งหมด →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-4 bg-[var(--color-bg)] rounded-xl hover:bg-[var(--color-bg-section)] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold">
                                            {order.customerName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{order.customerName}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">{order.id}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-[var(--color-primary)]">
                                            ฿{order.totalPrice}
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'สำเร็จ'
                                                ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                                                : order.status === 'จัดส่งแล้ว'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : order.status === 'กำลังจัดเตรียม'
                                                        ? 'bg-yellow-100 text-yellow-600'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-6">
                        {/* Zero Waste */}
                        <div className="glass-card p-6 animate-fade-in delay-300">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                ♻️ Zero Waste Score
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="relative w-28 h-28">
                                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            stroke="var(--color-success)"
                                            strokeWidth="10"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray="290 314"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-[var(--color-success)]">92%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                                        วัตถุดิบจากชุมชนถูกนำไปใช้{' '}
                                        <strong className="text-[var(--color-success)]">92%</strong> ลดการสูญเสียได้
                                        มากกว่าตลาดทั่วไป 3 เท่า
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Community Overview */}
                        <div className="glass-card p-6 animate-fade-in delay-400">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                👩‍🌾 ชุมชนผู้ผลิต
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'ศูนย์ศิลปาชีพบางไทร', items: 4, province: 'อยุธยา' },
                                    { name: 'ฟาร์มตัวอย่างหุบกะพง', items: 5, province: 'เพชรบุรี' },
                                    { name: 'วิสาหกิจชุมชนแม่กลอง', items: 3, province: 'สมุทรสงคราม' },
                                    { name: 'สหกรณ์ดอยคำ', items: 3, province: 'เชียงราย' },
                                ].map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl">
                                        <div>
                                            <div className="text-sm font-medium">{c.name}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">📍 {c.province}</div>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                                            {c.items} รายการ
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
