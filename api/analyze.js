export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'No input provided' });
  }

  const prompt = `당신은 미소(Miso)의 핵심가치 전문가입니다. 사용자의 업무 상황이나 고민을 입력받아 아래 8가지 핵심가치 중 가장 관련 있는 1~2개를 분석해주세요.

핵심가치:
1. Customers First - 고객 경험 최우선
2. Simplicity - 복잡함을 걷어내고 본질에 집중
3. Operational Excellence (Know Your Numbers) - 숫자로 말하고 데이터로 판단
4. Be An Owner (회사 > 팀 > 나) - 주인의식
5. Say What You Will Do & Do Whatever It Takes - 말한 것은 반드시 실행
6. Move Fast - 빠른 실행과 학습
7. Raise the Bar - 더 높은 기준
8. Disagree & Commit - 솔직한 의견, 결정 후 온전한 실행

사용자 입력: ${input}

반드시 아래 JSON 형식으로만 응답하세요. 마크다운, 코드블록, 설명 없이 순수 JSON만:
{"primary":"핵심가치 이름","primaryReason":"이유 2-3문장","secondary":"두번째 핵심가치 또는 null","secondaryReason":"이유 또는 null","advice":"실천 조언 2-3문장"}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        }),
      }
    );

    const data = await response.json();
    return res.status(200).json({ debug: data });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
}
