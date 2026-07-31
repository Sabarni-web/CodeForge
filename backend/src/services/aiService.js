import { callNvidiaNIM } from '../config/nvidia.js';

/**
 * Generate a complete HTML website using Nvidia NIM AI
 * @param {string} prompt - User's description of the website they want
 * @returns {Promise<{ html: string, title: string }>}
 */
export const generateWebsite = async (prompt) => {
  const systemInstruction = `You are an expert frontend developer. Generate a complete, self-contained HTML page based on the user's description.

RULES:
1. Return ONLY valid HTML with embedded CSS (inside <style> tags) and JavaScript (inside <script> tags).
2. The page must be fully self-contained — no external dependencies or CDN links.
3. Use modern CSS (flexbox, grid, gradients, animations, transitions).
4. Make the design visually stunning, responsive, and professional.
5. Include a proper <!DOCTYPE html> declaration.
6. Do NOT wrap the HTML in markdown code blocks. Return ONLY the raw HTML.
7. Do NOT include any explanations, comments outside the code, or markdown formatting.
8. Use vibrant colors, smooth animations, and modern typography.
9. The page should be fully functional and interactive where applicable.`;

  const result = await callNvidiaNIM({
    model: 'meta/llama-3.3-70b-instruct',
    messages: [
      {
        role: 'system',
        content: systemInstruction
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4096
  });

  let html = result.choices[0].message.content;

  // Clean up: remove markdown code blocks if wraps them
  html = html.replace(/^```html?\s*/i, '').replace(/\s*```$/i, '');
  html = html.trim();

  // Extract a title from the HTML
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : 'Generated Website';

  return { html, title };
};

