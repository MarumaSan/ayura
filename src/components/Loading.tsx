'use client';

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-section)]">
            <div className="text-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        🌿
                    </div>
                </div>
                <p className="text-[var(--color-text-light)] animate-pulse">
                    กำลังโหลด...
                </p>
            </div>
        </div>
    );
}
