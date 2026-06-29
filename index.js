/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        AI BALL - Proxy Server (Node.js)                     ║
 * ║        Now using Google Gemini — 100% FREE!                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * FREE SETUP (Replit — no credit card needed):
 * 1. Go to replit.com → New Repl → Node.js
 * 2. Paste this file as index.js
 * 3. Create package.json (see bottom of this file)
 * 4. In Replit Secrets (🔒), add:
 *      GEMINI_API_KEY = AIza...your key here...
 * 5. Get your FREE key at: https://aistudio.google.com/apikey
 *    (No credit card! 1500 free requests/day)
 * 6. Click Run → copy your public URL
 * 7. In AIBall_ServerScript.lua set:
 *      PROXY_URL = "https://yourapp.yourname.repl.co/gemini"
 */

const express = require('express');
const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 8080;

// Gemini model — gemini-1.5-flash is free tier and very fast
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

if (!GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY environment variable!");
    console.error("Get your free key at: https://aistudio.google.com/apikey");
    process.exit(1);
}

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'AIBall Gemini proxy running 🎱', free: true });
});

// Main Gemini proxy endpoint
app.post('/gemini', async (req, res) => {
    try {
        const body = req.body;

        if (!body.contents || !Array.isArray(body.contents)) {
            return res.status(400).json({ error: 'Missing contents array' });
        }

        // Forward to Gemini API
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: body.system_instruction,
                contents: body.contents.slice(-10), // limit history
                generationConfig: {
                maxOutputTokens: 800,
                    temperature: 1.0,
                    ...body.generationConfig,
                },
                safetySettings: [
                    // Relaxed for a Roblox game context — adjust as needed
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
                ]
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API error:', JSON.stringify(data));
            return res.status(response.status).json(data);
        }

        res.json(data);

    } catch (err) {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy server error', message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🎱 AIBall Gemini proxy running on port ${PORT}`);
    console.log(`📡 Using model: ${GEMINI_MODEL} (FREE tier)`);
    console.log(`🆓 Get your API key at: https://aistudio.google.com/apikey`);
});

/*
===== package.json =====
Create this as a separate file called package.json in your Replit:

{
  "name": "aiball-gemini-proxy",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
*/
