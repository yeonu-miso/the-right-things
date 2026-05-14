export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'No input provided' });
  }

  const prompt = `You are an expert on Miso company core values. Analyze the user's work situation and identify 1-2 most relevant core values from the list below.

Core values:
1. Customers First
2. Simplicity
3. Operational Excellence (Know Your Numbers)
4. Be An Owner
5. Say What You Will Do & Do Whatever It Takes
6. Move Fast
7. Raise the Bar
8. Disagree & Commit

User input: ${input}

Respond ONLY with this exact JSON structure, no markdown, no explanation:
{"primary":"value name in Korean","primaryReason":"reason in Korean 2-3 sentences","secondary":"second value name in Korean or null","secondaryReason":"reason in Korean or null","advice":"practical advice in Korean 2-3 sentences"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        }),
      }
    );

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: 'Gemini error: ' + JSON.stringify(data) });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
