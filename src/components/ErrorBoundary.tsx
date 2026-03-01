'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // In production, you might want to log to an error tracking service
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-section)] px-4">
                    <div className="glass-card p-8 max-w-md w-full text-center">
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="text-xl font-bold text-[var(--color-danger)] mb-2">
                            เกิดข้อผิดพลาด
                        </h2>
                        <p className="text-[var(--color-text-light)] mb-4 text-sm">
                            ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด<br/>
                            กรุณาลองใหม่อีกครั้ง หรือติดต่อแอดมิน
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-red-600 font-mono">
                                {this.state.error?.message || 'Unknown error'}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary w-full justify-center"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
