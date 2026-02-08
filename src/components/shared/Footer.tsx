import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/5 bg-background/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Logo className="w-8 h-8" />
                            <span className="font-semibold text-lg">TrustlessID</span>
                        </Link>
                        <p className="text-muted-foreground text-sm max-w-md">
                            Own your identity. Trust no one. A decentralized identity platform powered by AI
                            verification and blockchain credentials.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-medium mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/login" className="hover:text-foreground transition-colors">
                                    Create Identity
                                </Link>
                            </li>
                            <li>
                                <Link href="/verify" className="hover:text-foreground transition-colors">
                                    Verify Credential
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-medium mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <span className="cursor-default">Documentation</span>
                            </li>
                            <li>
                                <span className="cursor-default">API Reference</span>
                            </li>
                            <li>
                                <span className="cursor-default">Privacy Policy</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} TrustlessID. Built for demonstration purposes.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Hackathon Demo
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
