import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Setup CORS to allow your frontend to call this
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { message } = req.body;

        // 2. SECURELY Access API Key (Try both standard and public variable names)
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey) {
            console.error("❌ CRITICAL SERVER ERROR: API Key is undefined in Server Runtime.");
            return res.status(500).json({ error: "Server Configuration Error: API Key missing" });
        }

        // 3. Initialize Gemini with the FLASH model (Fastest & Most Available)
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("🤖 AI Request received:", message?.substring(0, 20) + "...");

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        console.log("✅ AI Response Success");
        return res.status(200).json({ text });

    } catch (error: any) {
        console.error("❌ AI GENERATION ERROR:", error);
        return res.status(500).json({
            error: "AI Service Error",
            details: error.message || "Unknown error"
        });
    }
}
