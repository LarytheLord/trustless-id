'use client';

import { useEffect, useState } from 'react';

const stats = [
    { value: 4.7, suffix: 'B', label: 'People lack digital identity worldwide' },
    { value: 56, suffix: 'B', label: 'Lost to identity fraud annually' },
    { value: 80, suffix: '%', label: 'Data breaches involve personal info' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start * 10) / 10);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span className="text-4xl md:text-5xl font-bold text-gradient">
            {count.toFixed(value % 1 !== 0 ? 1 : 0)}{suffix}
        </span>
    );
}

export function ProblemStatement() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-destructive/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="text-primary text-sm font-medium uppercase tracking-wider">The Problem</span>
                    <h2 className="mt-4 text-3xl md:text-4xl font-bold">
                        Digital Identity is Broken
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                        Traditional identity systems are centralized, vulnerable to fraud, and exclude billions
                        from the digital economy.
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="glass rounded-2xl p-8 text-center hover:glow-primary transition-all duration-300"
                        >
                            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            <p className="mt-4 text-muted-foreground">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Problem cards */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass rounded-xl p-6 border-l-4 border-l-red-500/50">
                        <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold mb-2">Synthetic Identity Fraud</h3>
                        <p className="text-sm text-muted-foreground">
                            Criminals combine real and fake information to create new identities,
                            costing billions annually.
                        </p>
                    </div>

                    <div className="glass rounded-xl p-6 border-l-4 border-l-orange-500/50">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold mb-2">Deepfake Manipulation</h3>
                        <p className="text-sm text-muted-foreground">
                            AI-generated fake documents and biometrics can bypass traditional
                            verification systems.
                        </p>
                    </div>

                    <div className="glass rounded-xl p-6 border-l-4 border-l-yellow-500/50">
                        <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <h3 className="font-semibold mb-2">Digital Exclusion</h3>
                        <p className="text-sm text-muted-foreground">
                            Billions lack verifiable identity, blocking access to banking,
                            healthcare, and opportunities.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
