import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-min-32-characters-long';
const key = new TextEncoder().encode(secretKey);

export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface VerificationProofPayload {
    type: 'verification_proof';
    requestId: string;
    credentialId: string;
    verifierName: string;
    verifierDomain: string;
    purpose: string;
    nonce: string;
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

export async function signVerificationProof(payload: VerificationProofPayload): Promise<string> {
    return new SignJWT({
        type: payload.type,
        requestId: payload.requestId,
        credentialId: payload.credentialId,
        verifierName: payload.verifierName,
        verifierDomain: payload.verifierDomain,
        purpose: payload.purpose,
        nonce: payload.nonce,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2m')
        .sign(key);
}

export async function verifyVerificationProof(token: string): Promise<VerificationProofPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        if (payload.type !== 'verification_proof') {
            return null;
        }

        return {
            type: 'verification_proof',
            requestId: payload.requestId as string,
            credentialId: payload.credentialId as string,
            verifierName: payload.verifierName as string,
            verifierDomain: payload.verifierDomain as string,
            purpose: payload.purpose as string,
            nonce: payload.nonce as string,
            iat: payload.iat as number | undefined,
            exp: payload.exp as number | undefined,
        };
    } catch (error) {
        console.error('Verification proof validation failed:', error);
        return null;
    }
}
