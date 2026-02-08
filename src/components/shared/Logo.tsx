interface LogoProps {
    className?: string;
}

export function Logo({ className = 'w-8 h-8' }: LogoProps) {
    return (
        <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Shield background with gradient */}
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
            </defs>

            {/* Outer shield */}
            <path
                d="M20 2L4 10V18C4 28.5 11.2 38.1 20 40C28.8 38.1 36 28.5 36 18V10L20 2Z"
                fill="url(#logoGradient)"
                opacity="0.2"
            />

            {/* Inner shield */}
            <path
                d="M20 5L7 12V18C7 26.8 13 34.6 20 36.5C27 34.6 33 26.8 33 18V12L20 5Z"
                fill="url(#logoGradient)"
            />

            {/* Checkmark / ID symbol */}
            <path
                d="M15 20L18 23L25 16"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Blockchain nodes */}
            <circle cx="20" cy="28" r="2" fill="white" opacity="0.8" />
            <circle cx="14" cy="26" r="1.5" fill="white" opacity="0.5" />
            <circle cx="26" cy="26" r="1.5" fill="white" opacity="0.5" />

            {/* Connection lines */}
            <path
                d="M14 26L20 28L26 26"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.4"
                fill="none"
            />
        </svg>
    );
}
