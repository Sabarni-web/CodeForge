import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

/**
 * Get or initialize the Google Generative AI client
 * @returns {GoogleGenerativeAI} configured AI client
 */
export const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Get a configured Gemini model instance
 * @param {string} modelName - Model name (default: gemini-2.0-flash)
 * @returns {GenerativeModel} configured model
 */
export const getModel = (modelName = 'gemini-pro') => {
  const ai = getGenAI();
  return ai.getGenerativeModel({ model: modelName });
};

export default getGenAI;
