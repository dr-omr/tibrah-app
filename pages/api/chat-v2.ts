/**
 * @deprecated — This endpoint is DEPRECATED and disabled.
 * All requests are forwarded to /api/chat-gemini.
 * 
 * This file will be removed in a future release.
 * Please update your client code to use /api/chat-gemini directly.
 */
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Return deprecation notice and redirect hint
    return res.status(301).json({
        error: 'This endpoint is deprecated',
        message: '⚠️ هذا الـ endpoint تم إيقافه. يرجى استخدام /api/chat-gemini',
        redirect: '/api/chat-gemini',
        deprecated: true,
        success: false,
    });
}
