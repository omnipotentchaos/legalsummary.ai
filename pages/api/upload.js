// pages/api/upload.js
import dotenv from 'dotenv';
dotenv.config();
import formidable from 'formidable';
import fs from 'fs';
import { DocumentProcessor } from '../../lib/documentProcessor';
// ADDED: Import the redact function
import { redactPII } from '../../lib/dlpService';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let uploadedFile = null;
  
  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024,
      filter: ({ mimetype }) => {
        return mimetype === 'application/pdf' || 
               mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
    });

    const [fields, files] = await form.parse(req);
    uploadedFile = files.document?.[0];
    
    // EXTRACT PERSONA
    const persona = fields.persona ? fields.persona[0] : 'General User';

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const processingId = Date.now().toString();
    
    try {
      const fileBuffer = fs.readFileSync(uploadedFile.filepath);
      
      let processor;
      try {
        processor = new DocumentProcessor();
        processor.resetApiCallCounter();
        console.log('DocumentProcessor initialized successfully', processingId);
      } catch (initError) {
        console.error('Failed to initialize DocumentProcessor:', initError.message);
        throw new Error('Document processor initialization failed');
      }

      console.log('Starting document processing...', processingId);

      // Extract text
      const extractedText = await processor.extractText(fileBuffer, uploadedFile.mimetype);
      console.log('Text extraction completed for', processingId, 'text length:', extractedText.length);

      // Detect language with improved detection
      let languageDetection = { language: 'en', confidence: 0.5 };
      try {
        languageDetection = await processor.detectLanguage(extractedText);
        console.log(`Language detected: ${languageDetection.language} (confidence: ${languageDetection.confidence})`, processingId);
      } catch (langError) {
        console.warn('Language detection failed:', langError.message);
      }

      // Use detected language for all subsequent processing
      const processingLanguage = languageDetection.language || 'en';
      console.log(`Using language for processing: ${processingLanguage}`);

      // Process clauses with language context
      console.log('Starting clause classification...', processingId);
      let classifiedClauses = [];
      try {
        classifiedClauses = await Promise.race([
          processor.classifyDocument(extractedText, processingLanguage),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Clause classification timeout')), 45000)
          )
        ]);
        console.log('Clause classification completed', processingId);
      } catch (clauseError) {
        console.warn('Clause classification failed:', clauseError.message);
        classifiedClauses = processor.getFallbackClauses(extractedText);
      }

      // Generate summary in detected language
      let summary = 'Document uploaded successfully.';
      try {
        summary = await Promise.race([
          processor.generateSummary(extractedText, processingLanguage, persona),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Summary generation timeout')), 60000)
          )
        ]);
        
        // --- ADDED: SANITIZE SUMMARY WITH DLP ---
        console.log('Sanitizing summary with DLP...');
        const originalSummaryLength = summary.length;
        summary = await redactPII(summary);
        console.log(`DLP redaction complete. Length: ${originalSummaryLength} -> ${summary.length}`);
        // ----------------------------------------

        console.log('Summary generated successfully in', processingLanguage, processingId);
      } catch (summaryError) {
        console.warn('Summary generation failed:', summaryError.message);
        // Fallback if summary generation fails
        if (processor.generateDetailedStructuredSummary) {
             summary = processor.generateDetailedStructuredSummary(extractedText);
        } else {
             summary = "Summary generation failed.";
        }
      }

      // Generate smart questions in detected language
      let smartQuestions = processor.getFallbackQuestions();
      try {
        smartQuestions = await 
          processor.generateSmartQuestions(extractedText, classifiedClauses, processingLanguage);
        console.log('Smart questions generated in', processingLanguage, processingId);
      } catch (questionError) {
        console.warn('Smart questions generation failed:', questionError.message);
        smartQuestions = processor.getFallbackQuestions();
      }

      console.log('All processing completed for', processingId);

      const documentData = {
        id: processingId,
        summary: summary || 'Document analysis completed.',
        clauses: Array.isArray(classifiedClauses) ? classifiedClauses : [],
        entities: [],
        sentiment: { score: 0, magnitude: 0 },
        smartQuestions: Array.isArray(smartQuestions) ? smartQuestions : [],
        fileType: uploadedFile.mimetype,
        fileName: uploadedFile.originalFilename,
        processedAt: new Date(),
        detectedLanguage: processingLanguage,
        languageConfidence: languageDetection.confidence || 0.5,
        recommendedLanguage: languageDetection.confidence > 0.7 ? processingLanguage : 'en',
        // Store original extracted text for regeneration (Note: You might want to redact this too if storing!)
        originalText: extractedText,
        processingStats: {
          totalClauses: Array.isArray(classifiedClauses) ? classifiedClauses.length : 0,
          dictionaryMatches: Array.isArray(classifiedClauses) ? classifiedClauses.filter(c => c.fromDictionary).length : 0,
          highRiskClauses: Array.isArray(classifiedClauses) ? classifiedClauses.filter(c => c.riskCategory === 'high').length : 0,
          processingTime: Date.now() - parseInt(processingId),
          languageDetected: processingLanguage,
          languageConfidence: languageDetection.confidence || 0.5
        }
      };

      res.status(200).json({
        success: true,
        data: documentData,
        languageDetection: {
          detected: processingLanguage,
          confidence: languageDetection.confidence || 0.5,
          recommended: languageDetection.confidence > 0.7 ? processingLanguage : 'en'
        }
      });

    } catch (processingError) {
      console.error('Processing error:', processingError.message);
      
      const fallbackData = {
        id: processingId,
        summary: 'Document uploaded successfully. Please review the document carefully.',
        clauses: processor ? processor.getFallbackClauses('') : [],
        entities: [],
        sentiment: { score: 0, magnitude: 0 },
        smartQuestions: [
          "What are the main terms and conditions?",
          "Are there any important deadlines?",
          "What are my rights and obligations?",
          "Are there any fees or penalties mentioned?"
        ],
        fileType: uploadedFile.mimetype,
        fileName: uploadedFile.originalFilename,
        processedAt: new Date(),
        detectedLanguage: 'en',
        languageConfidence: 0.5,
        recommendedLanguage: 'en',
        originalText: '', 
        hasPartialFailure: true,
        processingError: 'Limited processing due to technical constraints'
      };

      res.status(200).json({
        success: true,
        data: fallbackData,
        warning: 'Document processed with basic analysis.',
        languageDetection: {
          detected: 'en',
          confidence: 0.5,
          recommended: 'en'
        }
      });
    }

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ 
      error: 'Failed to process document',
      details: error.message 
    });
  } finally {
    if (uploadedFile) {
      try {
        fs.unlinkSync(uploadedFile.filepath);
        console.log('Temporary file cleaned up');
      } catch (cleanupError) {
        console.warn('Failed to clean up temp file:', cleanupError);
      }
    }
  }
}