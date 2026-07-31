/**
 * Call the Nvidia NIM Chat Completions API
 * @param {object} payload - The request payload containing messages, temperature, max_tokens, etc.
 * @returns {Promise<object>} The JSON response from Nvidia NIM API
 */
export const callNvidiaNIM = async (payload) => {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not defined in environment variables');
  }

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: payload.model || 'meta/llama-3.3-70b-instruct',
      messages: payload.messages,
      temperature: payload.temperature ?? 0.7,
      max_tokens: payload.max_tokens ?? 4096,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nvidia NIM API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
};
