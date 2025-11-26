import formidable from 'formidable';
import fs from 'fs';
// Ensure the SpeechClient import is correct
import { speechClient } from '../../lib/googleCloud';

export const config = {
  api: {
    // Crucial: disables Next.js's body parser to allow formidable to handle the audio file upload
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!speechClient) {
      return res.status(503).json({ error: 'Speech-to-Text service is unavailable on the server.' });
  }

  let uploadedFile = null;
  
  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit for audio
    });

    // Parse the multipart form data (audio file and language code)
    const [fields, files] = await form.parse(req);
    uploadedFile = files.audio?.[0]; // Expected field name is 'audio'
    
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    // Extract language code passed from the client (e.g., 'hi-IN')
    const languageCode = fields.language ? fields.language[0] : 'en-IN';

    // Read the audio file buffer (Next.js temporary file path)
    const audioBytes = fs.readFileSync(uploadedFile.filepath);

    const request = {
        audio: {
            content: audioBytes.toString('base64'),
        },
        config: {
            // Use the language code from the user's selected language
            languageCode: languageCode,
            // Enable to clean up transcription
            enableAutomaticPunctuation: true, 
            model: 'default', // Best for short phrases/questions
        },
    };

    console.log(`Sending ${audioBytes.length} bytes for transcription in ${languageCode}...`);
    
    // Call the Google Cloud Speech-to-Text API
    const [response] = await speechClient.recognize(request);
    
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

    if (!transcription) {
        return res.status(200).json({ success: false, transcription: '', message: 'Could not understand the audio. Please speak clearly.' });
    }

    res.status(200).json({
        success: true,
        transcription: transcription,
        language: languageCode,
    });

  } catch (error) {
    console.error('Speech-to-Text API error:', error.message);
    res.status(500).json({ 
      error: 'Failed to process audio',
      details: error.message 
    });
  } finally {
    // Clean up the temporary file created by formidable
    if (uploadedFile) {
      try {
        fs.unlinkSync(uploadedFile.filepath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temp audio file:', cleanupError);
      }
    }
  }
}