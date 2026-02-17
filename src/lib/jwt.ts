import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-min-32-characters-long';
const key = new TextEncoder().encode(secretKey);

export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
    return new SignJWT({ userId: payload.userId, email: payload.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        return {
            userId: payload.userId as string,
            email: payload.email as string,
            iat: payload.iat as number | undefined,
            exp: payload.exp as number | undefined,
        };
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}
