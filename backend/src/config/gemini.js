/**
 * Call the Google Gemini API
 * @param {object} payload - The request payload
 * @returns {Promise<object>} The JSON response from Gemini API
 */
export const callGemini = async (prompt, systemInstruction) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: { text: systemInstruction }
          },
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 503 || response.status === 429) {
          console.warn(`Gemini API ${response.status} (Attempt ${attempt + 1}/${maxRetries}): ${errorText}`);
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(res => setTimeout(res, delay));
            attempt++;
            continue;
          }
        }
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt >= maxRetries - 1) {
        throw error;
      }
      console.warn(`Gemini API Request Failed (Attempt ${attempt + 1}/${maxRetries}): ${error.message}`);
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(res => setTimeout(res, delay));
      attempt++;
    }
  }
};
