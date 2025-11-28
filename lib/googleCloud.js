// lib/googleCloud.js
import dotenv from 'dotenv';
dotenv.config();
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { LanguageServiceClient } from '@google-cloud/language';
import { TranslationServiceClient } from '@google-cloud/translate';
import { VertexAI } from '@google-cloud/vertexai';
import { Storage } from '@google-cloud/storage';
import { SpeechClient } from '@google-cloud/speech';
import { DlpServiceClient } from '@google-cloud/dlp';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Get client configuration based on available credentials
const getClientConfig = () => {
  // Option 1: Using key file (RECOMMENDED)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Using credentials file:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    return {
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: projectId
    };
  }
  
  // Option 2: Using inline credentials from environment variables
  if (process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
    console.log('Using inline credentials for:', process.env.GOOGLE_CLOUD_CLIENT_EMAIL);
    return {
      credentials: {
        type: 'service_account',
        project_id: projectId,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      },
      projectId: projectId
    };
  }
  
  // Option 3: No explicit credentials (will use Application Default Credentials)
  console.warn('No explicit credentials found, will attempt to use Application Default Credentials');
  return { projectId: projectId };
};

const clientConfig = getClientConfig();

// Initialize clients
let documentAI = null;
let languageClient = null;
let translateClient = null;
let vertexAI = null;
let cloudStorage = null;
let speechClient = null;
let dlpClient = null;

// Document AI
try {
  if (projectId && process.env.FORM_PARSER_PROCESSOR_NAME) {
    documentAI = new DocumentProcessorServiceClient(clientConfig);
    console.log('✓ Document AI client initialized');
  } else {
    console.log('✗ Document AI not configured - missing project ID or processor name');
  }
} catch (error) {
  console.warn('✗ Failed to initialize Document AI:', error.message);
  documentAI = null;
}

// Language API
try {
  if (projectId) {
    languageClient = new LanguageServiceClient(clientConfig);
    console.log('✓ Language API client initialized');
  } else {
    console.log('✗ Language API not configured - missing project ID');
  }
} catch (error) {
  console.warn('✗ Failed to initialize Language API:', error.message);
  languageClient = null;
}

// Translation API
try {
  if (projectId) {
    translateClient = new TranslationServiceClient(clientConfig);
    console.log('✓ Translation API client initialized');
  } else {
    console.log('✗ Translation API not configured - missing project ID');
  }
} catch (error) {
  console.warn('✗ Failed to initialize Translation API:', error.message);
  translateClient = null;
}

// Vertex AI
try {
  if (projectId) {
    const vertexConfig = {
      project: projectId,
      location: location,
    };
    
    // Add auth options based on credential type
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      vertexConfig.googleAuthOptions = {
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      };
    } else if (process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
      vertexConfig.googleAuthOptions = {
        credentials: {
          type: 'service_account',
          project_id: projectId,
          private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        }
      };
    }
    
    vertexAI = new VertexAI(vertexConfig);
    console.log('✓ Vertex AI client initialized');
  } else {
    console.log('✗ Vertex AI not configured - missing project ID');
  }
} catch (error) {
  console.warn('✗ Failed to initialize Vertex AI:', error.message);
  vertexAI = null;
}

// Cloud Storage
try {
  if (projectId) {
    cloudStorage = new Storage(clientConfig);
    console.log('✓ Cloud Storage client initialized');
  } else {
    console.log('✗ Cloud Storage not configured - missing project ID');
  }
} catch (error) {
  console.warn('✗ Failed to initialize Cloud Storage:', error.message);
  cloudStorage = null;
}

// Speech-to-Text
try {
  if (projectId) {
    speechClient = new SpeechClient(clientConfig);
    console.log('✓ Speech-to-Text client initialized');
  } else {
    console.log('✗ Speech-to-Text not configured - missing project ID');
  }
} catch (error) {
  console.warn('✗ Failed to initialize Speech-to-Text:', error.message);
  speechClient = null;
}

// DLP (Data Loss Prevention)
try {
  if (projectId) {
    dlpClient = new DlpServiceClient(clientConfig);
    console.log('✓ DLP Client initialized');
  } else {
    console.log('✗ DLP not configured - missing project ID');
  }
} catch (error) {
  console.warn('✗ Failed to initialize DLP:', error.message);
  dlpClient = null;
}

// Export all clients
export { 
  documentAI, 
  languageClient, 
  translateClient, 
  vertexAI, 
  cloudStorage, 
  speechClient, 
  dlpClient 
};

// Processor configurations
export const PROCESSORS = {
  FORM_PARSER: {
    name: process.env.FORM_PARSER_PROCESSOR_NAME 
      ? `projects/${projectId}/locations/${location}/processors/${process.env.FORM_PARSER_PROCESSOR_NAME}`
      : null,
    type: 'FORM_PARSER_PROCESSOR'
  },
  DOCUMENT_OCR: {
    name: process.env.OCR_PROCESSOR_ID
      ? `projects/${projectId}/locations/${location}/processors/${process.env.OCR_PROCESSOR_ID}`
      : null,
    type: 'OCR_PROCESSOR'
  }
};

// Model configurations
export const MODELS = {
  GEMINI_PRO: 'gemini-2.5-flash',
  GEMINI_PRO_FALLBACK: 'gemini-1.5-pro',
  TEXT_BISON: 'text-bison'
};

// Get available model with fallback
export const getAvailableModel = async () => {
  if (!vertexAI) {
    throw new Error('Vertex AI not initialized - check your Google Cloud configuration');
  }
  
  try {
    return MODELS.GEMINI_PRO;
  } catch (error) {
    console.warn('Gemini 2.0 Flash not available, falling back to Gemini 1.5 Pro');
    try {
      return MODELS.GEMINI_PRO_FALLBACK;
    } catch (fallbackError) {
      console.warn('Gemini 1.5 Pro not available, falling back to Text Bison');
      return MODELS.TEXT_BISON;
    }
  }
};

// Log initialization summary
console.log('\n=== Google Cloud Services Initialization Summary ===');
console.log('Project ID:', projectId || 'NOT SET');
console.log('Location:', location);
console.log('Document AI:', documentAI ? '✓ Ready' : '✗ Not available');
console.log('Language API:', languageClient ? '✓ Ready' : '✗ Not available');
console.log('Translation API:', translateClient ? '✓ Ready' : '✗ Not available');
console.log('Vertex AI:', vertexAI ? '✓ Ready' : '✗ Not available');
console.log('Cloud Storage:', cloudStorage ? '✓ Ready' : '✗ Not available');
console.log('Speech-to-Text:', speechClient ? '✓ Ready' : '✗ Not available');
console.log('DLP:', dlpClient ? '✓ Ready' : '✗ Not available');
console.log('====================================================\n');