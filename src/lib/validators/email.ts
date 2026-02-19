import { resolveMx } from 'node:dns/promises';

const BLOCKED_EMAIL_DOMAINS = new Set([
    'example.com',
    'example.org',
    'example.net',
    'test.com',
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'yopmail.com',
]);

export async function validateEmailDeliverability(email: string): Promise<{ valid: boolean; error?: string }> {
    const normalized = email.trim().toLowerCase();
    const atIndex = normalized.lastIndexOf('@');

    if (atIndex <= 0 || atIndex === normalized.length - 1) {
        return { valid: false, error: 'Invalid email format' };
    }

    const domain = normalized.slice(atIndex + 1);

    // Local/dev-only domains are not accepted for demo auth.
    if (domain === 'localhost' || domain.endsWith('.local')) {
        return { valid: false, error: 'Please use a real email domain' };
    }

    if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
        return { valid: false, error: 'Disposable or placeholder email domains are not allowed' };
    }

    try {
        const mxRecords = await resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
            return { valid: false, error: 'Email domain does not accept mail (no MX records found)' };
        }
    } catch {
        return { valid: false, error: 'Email domain is not reachable for mail delivery' };
    }

    return { valid: true };
}

