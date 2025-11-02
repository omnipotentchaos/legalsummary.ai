// pages/api/simplify.js - Uses Generative AI to simplify text

import { vertexAI, getAvailableModel } from '../../lib/googleCloud.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, type } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text to simplify' });
    }
    
    // Safety check for Vertex AI initialization
    if (!vertexAI) {
      return res.status(503).json({ error: 'Vertex AI not initialized. Check your Google Cloud configuration.' });
    }

    const model = vertexAI.getGenerativeModel({
      model: await getAvailableModel()
    });
    
    const prompt = `
      Simplify the following legal clause into plain, concise English suitable for a 5th-grade reading level. 
      The clause type is: **${type || 'General'}**.
      
      Original Clause: "${text}"
      
      Simplified Version:
    `;

    const result = await model.generateContent(prompt);
    const simplifiedText = result.response.candidates[0].content.parts[0].text;
    
    // Clean up markdown/unwanted characters from the AI response
    const cleanedText = simplifiedText.replace(/\*\*(.*?)\*\*/g, '$1').trim();

    res.status(200).json({ success: true, simplified: cleanedText });
    
  } catch (error) {
    console.error('Simplification API error:', error);
    res.status(500).json({ 
      error: 'Failed to simplify clause using AI',
      details: error.message
    });
  }
}