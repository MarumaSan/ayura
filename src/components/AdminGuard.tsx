'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const storedProfile = localStorage.getItem('ayuraProfile');

        if (!storedProfile) {
            router.replace('/login');
            return;
        }

        try {
            const profile = JSON.parse(storedProfile);
            if (profile.role !== 'admin') {
                router.replace('/dashboard');
                return;
            }
            setIsAuthorized(true);
        } catch (e) {
            router.replace('/login');
        }
    }, [router]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--color-text-muted)] animate-pulse">กำลังตรวจสอบสิทธิ์...</p>
            </div>
        );
    }

    return <>{children}</>;
}
