import { NextApiRequest, NextApiResponse } from 'next';
import { getAdminAuth } from '../../../lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // verify session token to ensure user is currently authenticated
        const sessionCookie = req.cookies.tibrah_session || '';
        if (!sessionCookie) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // We could verify the session JWT here, but since the client is also calling
        // Firebase signOut locally, the next request will fail anyway if invalid.
        // It's safer to extract the UID directly from the Firebase ID token if they pass it,
        // or verify the session cookie using jose and get the UID.
        // For simplicity and to not rely on the client passing the uid, let's verify the cookie
        // using our existing session logic, or we can just expect the client to send a raw Firebase ID token 
        // in an Authorization header for this specific critical operation.

        // To make it robust, we'll ask the client to send the Firebase ID token in the header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Missing Authorization header' });
        }

        const idToken = authHeader.split('Bearer ')[1];
        
        const adminAuthInstance = getAdminAuth();
        
        // Verify the ID token using the admin SDK
        const decodedToken = await adminAuthInstance.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Revoke all refresh tokens for this user
        await adminAuthInstance.revokeRefreshTokens(uid);

        // We can also clear the session cookie here as a convenience, 
        // though the client should also call our /api/auth/logout endpoint
        res.setHeader('Set-Cookie', 'tibrah_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

        return res.status(200).json({ message: 'All sessions revoked successfully' });
    } catch (error) {
        console.error('Error revoking sessions:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
