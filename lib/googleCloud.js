// Updated Google Cloud Services Configuration with working models
import dotenv from 'dotenv';
dotenv.config();
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { LanguageServiceClient } from '@google-cloud/language';
import { TranslationServiceClient } from '@google-cloud/translate';
import { VertexAI } from '@google-cloud/vertexai';
import { Storage } from '@google-cloud/storage';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Credentials configuration for all services
const getCredentials = () => {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use service account key file if specified
    return undefined; // Let the SDK use the file path from environment variable
  }
  
  // Use inline credentials if available
  if (process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
    return {
      type: 'service_account',
      project_id: projectId,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    };
  }
  
  return undefined; // Let the SDK use default credentials
};

const credentials = getCredentials();

// Initialize clients only if we have proper configuration
let documentAI = null;
let languageClient = null;
let translateClient = null;
let vertexAI = null;
let cloudStorage = null;

try {
  // Document AI Configuration
  if (projectId && credentials && process.env.FORM_PARSER_PROCESSOR_NAME) {
    documentAI = new DocumentProcessorServiceClient({
      credentials
    });
    console.log('Document AI client initialized');
  } else {
    console.log('Document AI not configured - missing project ID, credentials, or processor ID');
  }
} catch (error) {
  console.warn('Failed to initialize Document AI:', error.message);
}

try {
  if (projectId && credentials) {
    languageClient = new LanguageServiceClient({
      credentials,
      projectId: projectId
    });
    
    console.log('Language API client initialized');
  } else {
    console.log('Language API not configured - missing project ID or credentials');
  }
} catch (error) {
  console.warn('Failed to initialize Language API:', error.message);
  languageClient = null;
}


try {
  // Translation API
  if (projectId && credentials) {
    translateClient = new TranslationServiceClient({
      credentials
    });
    console.log('Translation API client initialized');
  } else {
    console.log('Translation API not configured');
  }
} catch (error) {
  console.warn('Failed to initialize Translation API:', error.message);
}


// Replace the Vertex AI initialization section with this:
try {
  if (projectId && credentials) {
    vertexAI = new VertexAI({
      project: projectId,
      location: location,
      googleAuthOptions: {
        credentials: credentials
      }
    });
    console.log('Vertex AI client initialized');
  } else {
    console.log('Vertex AI not configured - missing project ID or credentials');
  }
} catch (error) {
  console.warn('Failed to initialize Vertex AI:', error.message);
}

// Export the initialized clients
export { documentAI, languageClient, translateClient, vertexAI, cloudStorage };

// Document AI Processor Configuration
export const PROCESSORS = {
  FORM_PARSER: {
    name: `projects/${projectId}/locations/${location}/processors/${process.env.FORM_PARSER_PROCESSOR_NAME}`,
    type: 'FORM_PARSER_PROCESSOR'
  },
  DOCUMENT_OCR: {
    name: `projects/${projectId}/locations/${location}/processors/${process.env.OCR_PROCESSOR_ID}`,
    type: 'OCR_PROCESSOR'
  }
};

// Updated model list with your original working versions
export const MODELS = {
  GEMINI_PRO: 'gemini-2.5-flash',  // Your original model
  GEMINI_PRO_FALLBACK: 'gemini-pro', // Your original fallback
  TEXT_BISON: 'text-bison'
};

// Helper function to get available model - using your original logic
export const getAvailableModel = async () => {
  if (!vertexAI) {
    throw new Error('Vertex AI not initialized - check your Google Cloud configuration');
  }

  try {
    // Try your preferred Gemini 2.5 Flash first
    return MODELS.GEMINI_PRO;
  } catch (error) {
    console.warn('Gemini 2.5 Flash not available, falling back to Gemini Pro');
    try {
      return MODELS.GEMINI_PRO_FALLBACK;
    } catch (fallbackError) {
      console.warn('Gemini Pro not available, falling back to Text Bison');
      return MODELS.TEXT_BISON;
    }
  }
};