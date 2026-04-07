import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminFirestore, getAdminMessaging } from '@/lib/firebaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, segment } = req.body;

    if (!title || !body) {
       return res.status(400).json({ error: 'Missing title or body' });
    }

    const db = getAdminFirestore();

    // 1. Resolve Segment to FCM Tokens
    let fcmTokens: string[] = [];
    
    if (segment === 'all') {
       const sn = await db.collection('users').where('fcmToken', '!=', null).get();
       sn.docs.forEach(d => {
          const t = d.data().fcmToken;
          if (t && typeof t === 'string') fcmTokens.push(t);
       });
    } else {
       // Mocked segment resolution for specific rules (e.g. 'appointments_today')
       // In production, we query based on the specific segment rule.
    }

    // 2. Dispatch FCM Message
    // If no tokens found, simulate high success for empty DBs
    if (fcmTokens.length === 0) {
      console.log(`[FCM Broadcast] Simulated send to ${segment}: ${title}`);
      return res.status(200).json({ success: true, count: 0, simulated: true });
    }

    const message = {
      notification: {
        title,
        body
      },
      tokens: fcmTokens
    };

    const messaging = getAdminMessaging();
    const response = await messaging.sendEachForMulticast(message);

    res.status(200).json({
      success: true,
      count: response.successCount,
      failures: response.failureCount
    });

  } catch (error: any) {
    console.error('Broadcast Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
