import Pinata from '@pinata/sdk';

const pinata = new Pinata({ 
    pinataJWTKey: process.env.PINATA_JWT 
});

/**
 * Store credential data on IPFS via Pinata
 * Returns the IPFS hash (CID) which acts as our "blockchain" reference
 */
export async function storeCredentialOnIPFS(credentialData: {
    credentialId: string;
    userId: string;
    hash: string;
    type: string;
    issuedAt: string;
    expiresAt: string;
    sourceDocumentHash?: string;
}) {
    try {
        // Upload to IPFS
        const result = await pinata.pinJSONToIPFS(credentialData, {
            pinataMetadata: {
                name: `TrustlessID-Credential-${credentialData.credentialId}`,
            },
        });

        return {
            success: true,
            ipfsHash: result.IpfsHash,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
            network: 'ipfs',
        };
    } catch (error) {
        console.error('IPFS upload error:', error);
        return {
            success: false,
            error: 'Failed to store on IPFS',
        };
    }
}

/**
 * Verify credential exists on IPFS
 * Returns the stored data if found
 */
export async function verifyCredentialFromIPFS(ipfsHash: string) {
    try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
        
        if (!response.ok) {
            return {
                exists: false,
                data: null,
            };
        }

        const data = await response.json();
        
        return {
            exists: true,
            data,
            network: 'ipfs',
        };
    } catch (error) {
        console.error('IPFS verification error:', error);
        return {
            exists: false,
            data: null,
        };
    }
}
