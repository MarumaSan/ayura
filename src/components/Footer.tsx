import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[var(--color-primary-dark)] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🌿</span>
                            <div>
                                <span className="text-xl font-bold">Ayura</span>
                                <span className="text-xs block -mt-1 text-white/60">อายุระ</span>
                            </div>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">
                            กล่องสุขภาพจากธรรมชาติ ถึงมือคุณทุกสัปดาห์
                            ด้วย AI จับคู่วัตถุดิบที่เหมาะกับร่างกายคุณ
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4 text-[var(--color-secondary-light)]">
                            เมนูหลัก
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: '/', label: 'หน้าแรก' },
                                { href: '/assessment', label: 'ประเมินสุขภาพ' },
                                { href: '/dashboard', label: 'กล่องสุขภาพ' },
                                { href: '/bio-age', label: 'แต้มสุขภาพ' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-white/70 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h4 className="font-semibold mb-4 text-[var(--color-secondary-light)]">
                            ชุมชนของเรา
                        </h4>
                        <ul className="space-y-2">
                            <li className="text-sm text-white/70">ศูนย์ศิลปาชีพบางไทร</li>
                            <li className="text-sm text-white/70">ฟาร์มตัวอย่างหุบกะพง</li>
                            <li className="text-sm text-white/70">วิสาหกิจชุมชนแม่กลอง</li>
                            <li className="text-sm text-white/70">สหกรณ์การเกษตรดอยคำ</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4 text-[var(--color-secondary-light)]">
                            ติดต่อเรา
                        </h4>
                        <ul className="space-y-2">
                            <li className="text-sm text-white/70 flex items-center gap-2">
                                📧 hello@ayura.co.th
                            </li>
                            <li className="text-sm text-white/70 flex items-center gap-2">
                                📞 02-XXX-XXXX
                            </li>
                            <li className="text-sm text-white/70 flex items-center gap-2">
                                📍 กรุงเทพมหานคร
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-white/50">
                        © 2024 Ayura (อายุระ). สร้างสรรค์เพื่อชุมชนและสุขภาพที่ดี 🌱
                    </p>
                    <div className="flex gap-4">
                        <span className="text-lg cursor-pointer hover:scale-110 transition-transform">
                            📘
                        </span>
                        <span className="text-lg cursor-pointer hover:scale-110 transition-transform">
                            📸
                        </span>
                        <span className="text-lg cursor-pointer hover:scale-110 transition-transform">
                            🐦
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
