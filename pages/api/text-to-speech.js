// pages/api/text-to-speech.js
// FIXED: Handles text chunking for 5000 byte limit

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const VOICE_CONFIG = {
  en: { languageCode: 'en-US', name: 'en-US-Neural2-J', ssmlGender: 'MALE' },
  hi: { languageCode: 'hi-IN', name: 'hi-IN-Neural2-A', ssmlGender: 'FEMALE' },
  es: { languageCode: 'es-ES', name: 'es-ES-Neural2-A', ssmlGender: 'FEMALE' },
  fr: { languageCode: 'fr-FR', name: 'fr-FR-Neural2-A', ssmlGender: 'FEMALE' },
  de: { languageCode: 'de-DE', name: 'de-DE-Neural2-A', ssmlGender: 'FEMALE' },
  bn: { languageCode: 'bn-IN', name: 'bn-IN-Standard-A', ssmlGender: 'FEMALE' },
  te: { languageCode: 'te-IN', name: 'te-IN-Standard-A', ssmlGender: 'FEMALE' },
  mr: { languageCode: 'mr-IN', name: 'mr-IN-Standard-A', ssmlGender: 'FEMALE' },
  ta: { languageCode: 'ta-IN', name: 'ta-IN-Standard-A', ssmlGender: 'FEMALE' },
  gu: { languageCode: 'gu-IN', name: 'gu-IN-Standard-A', ssmlGender: 'FEMALE' },
  kn: { languageCode: 'kn-IN', name: 'kn-IN-Standard-A', ssmlGender: 'FEMALE' },
  ml: { languageCode: 'ml-IN', name: 'ml-IN-Standard-A', ssmlGender: 'FEMALE' },
  pa: { languageCode: 'pa-IN', name: 'pa-IN-Standard-A', ssmlGender: 'FEMALE' },
  ur: { languageCode: 'ur-IN', name: 'ur-IN-Standard-A', ssmlGender: 'FEMALE' },
  zh: { languageCode: 'zh-CN', name: 'zh-CN-Neural2-A', ssmlGender: 'FEMALE' },
  ja: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-A', ssmlGender: 'FEMALE' },
};

// Helper function to split text into chunks that fit within byte limit
function splitTextIntoChunks(text, maxBytes = 4500) {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?\n])\s+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
    const byteLength = Buffer.byteLength(testChunk, 'utf8');
    
    if (byteLength > maxBytes) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If single sentence is too long, force split it
      if (Buffer.byteLength(sentence, 'utf8') > maxBytes) {
        const words = sentence.split(' ');
        let wordChunk = '';
        for (const word of words) {
          const testWord = wordChunk + (wordChunk ? ' ' : '') + word;
          if (Buffer.byteLength(testWord, 'utf8') > maxBytes) {
            if (wordChunk) chunks.push(wordChunk.trim());
            wordChunk = word;
          } else {
            wordChunk = testWord;
          }
        }
        currentChunk = wordChunk;
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk = testChunk;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Helper to concatenate audio buffers
function concatenateAudioBuffers(buffers) {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
  const result = Buffer.concat(buffers, totalLength);
  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, language = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const voiceConfig = VOICE_CONFIG[language] || VOICE_CONFIG.en;
    
    // Check text size
    const textBytes = Buffer.byteLength(text, 'utf8');
    console.log(`TTS request: ${textBytes} bytes, language: ${language}`);

    // If text is small enough, process normally
    if (textBytes <= 4500) {
      const request = {
        input: { text },
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name,
          ssmlGender: voiceConfig.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
        },
      };

      const [response] = await client.synthesizeSpeech(request);
      const audioContent = response.audioContent.toString('base64');

      return res.status(200).json({
        success: true,
        audioContent,
        language: voiceConfig.languageCode,
        chunked: false,
      });
    }

    // Text is too large, split into chunks
    console.log('Text too large, splitting into chunks...');
    const chunks = splitTextIntoChunks(text, 4500);
    console.log(`Split into ${chunks.length} chunks`);

    // Process each chunk
    const audioBuffers = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${Buffer.byteLength(chunks[i], 'utf8')} bytes)`);
      
      const request = {
        input: { text: chunks[i] },
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name,
          ssmlGender: voiceConfig.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
        },
      };

      const [response] = await client.synthesizeSpeech(request);
      audioBuffers.push(response.audioContent);
    }

    // Concatenate all audio buffers
    console.log('Concatenating audio chunks...');
    const finalAudio = concatenateAudioBuffers(audioBuffers);
    const audioContent = finalAudio.toString('base64');

    console.log(`TTS complete: ${chunks.length} chunks, ${audioContent.length} base64 chars`);

    return res.status(200).json({
      success: true,
      audioContent,
      language: voiceConfig.languageCode,
      chunked: true,
      chunkCount: chunks.length,
    });

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return res.status(500).json({
      error: 'Failed to generate speech',
      details: error.message,
    });
  }
}