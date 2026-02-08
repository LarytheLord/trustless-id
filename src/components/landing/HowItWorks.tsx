'use client';

const steps = [
    {
        number: '01',
        title: 'Upload Documents',
        description: 'Securely upload your identity documents. We support passports, driver\'s licenses, and national IDs.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
        ),
        features: ['End-to-end encryption', 'Local processing first', 'No permanent storage'],
    },
    {
        number: '02',
        title: 'AI Verification',
        description: 'Our AI analyzes documents for authenticity, detects anomalies, and identifies potential fraud.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        features: ['Deepfake detection', 'Document authenticity', 'Fraud scoring'],
    },
    {
        number: '03',
        title: 'Blockchain Credential',
        description: 'Your verified identity becomes a tamper-proof credential on the blockchain. You control who can verify it.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        features: ['SHA-256 hash', 'Decentralized storage', 'Selective disclosure'],
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 gradient-hero opacity-50" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="text-primary text-sm font-medium uppercase tracking-wider">How It Works</span>
                    <h2 className="mt-4 text-3xl md:text-4xl font-bold">
                        Three Steps to Sovereign Identity
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                        Create, verify, and share your identity credentials without exposing personal data.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="relative group"
                        >
                            {/* Connection line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
                            )}

                            <div className="glass rounded-2xl p-8 h-full hover:glow-primary transition-all duration-300 relative z-10">
                                {/* Step number */}
                                <div className="absolute -top-4 -left-4 w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                    {step.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground mb-6">{step.description}</p>

                                {/* Features list */}
                                <ul className="space-y-2">
                                    {step.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
