'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CallToAction() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10 text-center">
                {/* Content */}
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                    Ready to Own Your Identity?
                </h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                    Join the future of decentralized identity. Create your first credential
                    in minutes, not days.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/login">
                        <Button size="lg" className="gradient-primary text-white border-0 px-10 py-6 text-lg glow-primary">
                            Get Started Free
                        </Button>
                    </Link>
                    <Link href="/verify">
                        <Button size="lg" variant="outline" className="px-10 py-6 text-lg">
                            Try Verification
                        </Button>
                    </Link>
                </div>

                {/* Trust note */}
                <p className="mt-8 text-sm text-muted-foreground">
                    No credit card required • Demo environment • Your data stays with you
                </p>
            </div>
        </section>
    );
}
