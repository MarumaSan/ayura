'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: '🤖',
    title: 'Algorithm แนะนำสุขภาพ',
    description: 'ระบบ Algorithm วิเคราะห์ข้อมูลสุขภาพและเลือกวัตถุดิบที่เหมาะกับคุณ',
  },
  {
    icon: '🌿',
    title: 'สมุนไพรจากชุมชน',
    description: 'วัตถุดิบออร์แกนิกจากฟาร์มตัวอย่างและศูนย์ศิลปาชีพทั่วประเทศ',
  },
  {
    icon: '⭐',
    title: 'แต้มสะสมสุขภาพ',
    description: 'สะสมแต้มทุกครั้งที่สั่งกล่อง แล้วแลกรับสิทธิประโยชน์พิเศษ เช่น ส่วนลดค่าส่ง หรือของพิเศษจากชุมชน',
  },
  {
    icon: '♻️',
    title: 'Zero Waste',
    description: 'จัดส่งสดจากฟาร์ม ลดของเหลือทิ้ง สนับสนุนชุมชนอย่างยั่งยืน',
  },
];

const steps = [
  {
    number: '01',
    icon: '📝',
    title: 'ประเมินสุขภาพ',
    description: 'กรอกข้อมูลสุขภาพและบอกเป้าหมายสุขภาพ เพียง 1 นาที',
  },
  {
    number: '02',
    icon: '🧠',
    title: 'Algorithm จัดกล่องให้',
    description: 'ระบบ Algorithm เลือกวัตถุดิบสดจากชุมชนที่เหมาะกับคุณ',
  },
  {
    number: '03',
    icon: '📦',
    title: 'รับกล่องทุกสัปดาห์',
    description: 'กล่องสุขภาพส่งถึงหน้าบ้าน พร้อมสูตรอาหารและสรรพคุณ',
  },
];

const stats = [
  { value: '4+', label: 'ชุมชนผู้ผลิต' },
  { value: '12+', label: 'วัตถุดิบออร์แกนิก' },
  { value: '98%', label: 'สดสะอาดจากฟาร์ม' },
  { value: '0', label: 'ของเหลือทิ้ง' },
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem('ayuraProfile');
    setIsLoggedIn(!!profile);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative gradient-hero text-white pt-28 pb-20 lg:pt-36 lg:pb-28">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-[var(--color-secondary)]/10 rounded-full blur-3xl animate-float delay-300" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
                <span className="animate-pulse-glow w-2 h-2 bg-[var(--color-secondary-light)] rounded-full" />
                <span className="text-sm text-white/90">สุขภาพที่ดีเริ่มด้วยตัวคุณ 🫶🏻</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                กล่องสุขภาพ
                <br />
                <span className="text-[var(--color-secondary-light)]">จากธรรมชาติ</span>
                <br />
                ถึงมือคุณทุกสัปดาห์
              </h1>

              <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
                จับคู่กับวัตถุดิบสุขภาพและสมุนไพรจากแหล่งผลิตในชุมชนทั่วประเทศที่พร้อมจัดส่งถึงมือคุณ
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {!isLoggedIn && (
                  <Link href="/login" className="btn-primary text-base sm:text-lg !py-3 sm:!py-4 !px-6 sm:!px-8 w-full sm:w-auto text-center shadow-lg hover:-translate-y-1">
                    เข้าสู่ระบบเลย 🚀
                  </Link>
                )}
                <Link href="/meal-plan" className="btn-outline !border-white/30 !text-white hover:!bg-white/10 text-base !py-4 !px-8 justify-center">
                  ดูตัวอย่างเซ็ตอาหาร
                </Link>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block animate-slide-up">
              <div className="relative w-full max-w-md mx-auto">
                {/* Main box visual */}
                <div className="glass-card !bg-white/10 p-8 text-center">
                  <div className="text-8xl mb-4 animate-float">📦</div>
                  <h3 className="text-xl font-bold mb-2">กล่อง Ayura สัปดาห์นี้</h3>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {['🥬', '🫚', '🌺', '🍗', '🌾', '🍃'].map((emoji, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-sm text-white/70">
                    จับคู่ด้วยกับอาหารที่เหมาะกับคุณ{' '}
                    <span className="text-[var(--color-secondary-light)] font-bold">🌸</span>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-[var(--color-secondary)] text-white rounded-full px-4 py-2 text-sm font-bold shadow-lg animate-float delay-200">
                  สดจากฟาร์ม 🌱
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white text-[var(--color-primary)] rounded-full px-4 py-2 text-sm font-bold shadow-lg animate-float delay-500">
                  Zero Waste ♻️
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-[var(--color-secondary-light)]">
                  {stat.value}
                </div>
                <div className="text-sm text-white/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[var(--color-bg-section)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gradient mb-4">
              ทำไมต้อง Ayura?
            </h2>
            <p className="text-[var(--color-text-light)] max-w-2xl mx-auto">
              เราเชื่อมต่อสุขภาพของคนเมืองกับวัตถุดิบคุณภาพจากชุมชน
              ด้วยเทคโนโลยี AI ที่เข้าใจร่างกายคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-card p-6 hover-lift cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-[var(--color-primary-dark)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gradient mb-4">
              ง่ายแค่ 3 ขั้นตอน
            </h2>
            <p className="text-[var(--color-text-light)]">
              เริ่มต้นดูแลสุขภาพด้วยวัตถุดิบจากธรรมชาติ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="glass-card p-8 text-center hover-lift h-full">
                  <div className="text-xs font-bold text-[var(--color-primary)] mb-4 tracking-widest">
                    STEP {step.number}
                  </div>
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[var(--color-primary-dark)]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[var(--color-primary)]/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6 animate-float">🌿</div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            พร้อมเริ่มดูแลสุขภาพแล้วหรือยัง?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            กรอกข้อมูลสุขภาพเพียง 1 นาที แล้วให้ Algorithm เลือกกล่องสุขภาพที่เหมาะกับคุณ
          </p>
          {!isLoggedIn && (
            <Link href="/login" className="btn-secondary text-lg !py-4 !px-10">
              เข้าสู่ระบบเลย 🚀
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
