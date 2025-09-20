// Fixed API route for document upload - better error handling
import dotenv from 'dotenv';
dotenv.config();
import formidable from 'formidable';
import fs from 'fs';
import { DocumentProcessor } from '../../lib/documentProcessor';

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
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: ({ mimetype }) => {
        return mimetype === 'application/pdf' || 
               mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
    });

    const [fields, files] = await form.parse(req);
    uploadedFile = files.document?.[0];
    
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const processingId = Date.now().toString();
    
    try {
      const fileBuffer = fs.readFileSync(uploadedFile.filepath);
      
      // Initialize processor with better error handling
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

      // Detect language with fallback
      let languageDetection = { language: 'en', confidence: 0.5 };
      try {
        languageDetection = await processor.detectLanguage(extractedText);
        console.log(`Language detected: ${languageDetection.language} (confidence: ${languageDetection.confidence})`, processingId);
      } catch (langError) {
        console.warn('Language detection failed:', langError.message);
      }

      // Process document with better error handling
      console.log('Starting clause classification...', processingId);

      // Process clauses with timeout protection
      let classifiedClauses = [];
      try {
        classifiedClauses = await Promise.race([
          processor.classifyDocument(extractedText, languageDetection.language),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Clause classification timeout')), 15000)
          )
        ]);
        console.log('Clause classification completed', processingId);
      } catch (clauseError) {
        console.warn('Clause classification failed:', clauseError.message);
        classifiedClauses = [{
          text: extractedText.substring(0, 500) + "...",
          type: 'general',
          confidence: 0.5,
          riskScore: 2,
          riskCategory: 'medium',
          explanation: 'This document contains legal terms that should be reviewed carefully.',
          fromDictionary: false,
          suggestedQuestions: [
            'What are the main obligations in this document?',
            'Are there any penalties or fees mentioned?'
          ],
        }];
      }

      // Generate summary with timeout protection
      let summary = 'Document uploaded successfully. This appears to be a legal document containing various terms and conditions.';
      try {
        summary = await Promise.race([
          processor.generateSummary(extractedText, languageDetection.language),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Summary generation timeout')), 30000)
          )
        ]);
        console.log('Summary generated successfully', processingId);
      } catch (summaryError) {
        console.warn('Summary generation failed:', summaryError.message);
        try {
          // Try to get structured fallback summary
          summary = processor.generateStructuredFallbackSummary(extractedText);
          console.log('Using structured fallback summary', processingId);
        } catch (fallbackError) {
          console.warn('Fallback summary failed:', fallbackError.message);
          // Use basic fallback
          summary = processor.getDetailedFallbackSummary(extractedText);
        }
      }

      // Generate smart questions with timeout protection
      let smartQuestions = [
        "What are the main terms and conditions?",
        "Are there any important deadlines?",
        "What are my rights and obligations?",
        "Are there any fees or penalties mentioned?"
      ];
      try {
        smartQuestions = await Promise.race([
          processor.generateSmartQuestions(extractedText, classifiedClauses, languageDetection.language),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Smart questions timeout')), 8000)
          )
        ]);
        console.log('Smart questions generated', processingId);
      } catch (questionError) {
        console.warn('Smart questions generation failed:', questionError.message);
        // Use fallback questions
        smartQuestions = processor.getFallbackQuestions();
      }

      console.log('All processing completed for', processingId);

      // Build response with validation
      const documentData = {
        id: processingId,
        summary: summary || 'Document analysis completed.',
        clauses: Array.isArray(classifiedClauses) ? classifiedClauses : [],
        entities: [], // Placeholder for future feature
        sentiment: { score: 0, magnitude: 0 },
        smartQuestions: Array.isArray(smartQuestions) ? smartQuestions : [],
        fileType: uploadedFile.mimetype,
        fileName: uploadedFile.originalFilename,
        processedAt: new Date(),
        detectedLanguage: languageDetection.language || 'en',
        languageConfidence: languageDetection.confidence || 0.5,
        recommendedLanguage: languageDetection.confidence > 0.7 ? languageDetection.language : 'en',
        processingStats: {
          totalClauses: Array.isArray(classifiedClauses) ? classifiedClauses.length : 0,
          dictionaryMatches: Array.isArray(classifiedClauses) ? classifiedClauses.filter(c => c.fromDictionary).length : 0,
          highRiskClauses: Array.isArray(classifiedClauses) ? classifiedClauses.filter(c => c.riskCategory === 'high').length : 0,
          processingTime: Date.now() - parseInt(processingId),
          languageDetected: languageDetection.language || 'en',
          languageConfidence: languageDetection.confidence || 0.5
        }
      };

      res.status(200).json({
        success: true,
        data: documentData,
        languageDetection: {
          detected: languageDetection.language || 'en',
          confidence: languageDetection.confidence || 0.5,
          recommended: languageDetection.confidence > 0.7 ? languageDetection.language : 'en'
        }
      });

    } catch (processingError) {
      console.error('Processing error:', processingError.message);
      console.error('Processing error stack:', processingError.stack);
      
      // Return structured fallback response
      const fallbackData = {
        id: processingId,
        summary: `
DOCUMENT OVERVIEW:
Document uploaded successfully. This appears to be a legal document containing various terms and conditions that establish obligations between parties.

KEY TERMS & CONDITIONS:
The document contains provisions related to agreements, responsibilities, and procedural requirements that should be carefully reviewed.

RIGHTS & OBLIGATIONS:
Both parties have defined rights and corresponding duties under this agreement that must be understood and followed.

RISKS & PENALTIES:
The document may contain provisions addressing consequences for non-compliance and potential penalties.

IMPORTANT DEADLINES & NOTICES:
Review the document for specific timing requirements, notice periods, and deadline structures.

RECOMMENDED ACTIONS:
Please review all sections carefully and consider seeking legal advice if you have questions about specific terms or your obligations.
        `.trim(),
        clauses: [{
          text: 'Document processing completed with limited analysis due to technical constraints.',
          type: 'general',
          confidence: 0.5,
          riskScore: 2,
          riskCategory: 'medium',
          explanation: 'This document has been uploaded successfully but requires manual review for detailed analysis.',
          fromDictionary: false,
          suggestedQuestions: [
            'What are the key terms in this document?',
            'What should I pay attention to?',
            'Are there any important deadlines?',
            'What are my main obligations?'
          ],
        }],
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
        hasPartialFailure: true,
        processingError: 'Limited processing due to technical constraints'
      };

      res.status(200).json({
        success: true,
        data: fallbackData,
        warning: 'Document processed with basic analysis due to technical limitations.',
        languageDetection: {
          detected: 'en',
          confidence: 0.5,
          recommended: 'en'
        }
      });
    }

  } catch (error) {
    console.error('Upload error:', error.message);
    console.error('Upload error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to process document',
      details: error.message 
    });
  } finally {
    // Clean up uploaded file
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