import { callGemini } from '../config/gemini.js';

/**
 * Generate a complete HTML website using Google Gemini AI
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
9. The page should be fully functional and interactive where applicable.
10. CRITICAL: Keep your CSS extremely concise. Do not write thousands of lines of CSS. Use utility classes or simple rules. You MUST finish writing the entire HTML body before you run out of tokens.`;

  // Forcefully truncate the prompt if the user pastes too much text
  // This guarantees the AI won't try to build a massive app and hit the output token limit!
  const safePrompt = prompt.length > 400 ? prompt.substring(0, 400) + '...' : prompt;

  const result = await callGemini(safePrompt, systemInstruction);

  let html = result.candidates[0].content.parts[0].text;

  // Clean up: remove markdown code blocks if wraps them
  html = html.replace(/^```html?\s*/i, '').replace(/\s*```$/i, '');
  html = html.trim();

  // Safeguard: If the AI hit its output token limit and got truncated in the middle of the CSS
  // (which happens if the user gives a massive prompt), it will never close the <style> tag.
  // This causes the browser to render a completely blank white page. 
  // We will forcibly close the tags so the user at least sees an error message on the screen!
  if (!html.includes('</html>')) {
    html += `
      </style>
    </head>
    <body style="display:flex; justify-content:center; align-items:center; height:100vh; background:#111; color:#ff4444; font-family:sans-serif; text-align:center; padding:2rem;">
      <div>
        <h1 style="font-size:2rem; margin-bottom:1rem;">⚠️ Code Generation Incomplete</h1>
        <p style="color:#ccc; line-height:1.5;">Your prompt was too large and the AI ran out of space while writing the CSS styling!<br/>Because of this, it was unable to finish writing the actual HTML body elements.</p>
        <p style="color:#fff; margin-top:1.5rem; font-weight:bold;">Please try again with a shorter, single-page prompt!</p>
      </div>
    </body>
    </html>`;
  }

  // Extract a title from the HTML
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : 'Generated Website';

  return { html, title };
};

