  // Enhanced Document Processing Service with better summary generation
  import dotenv from 'dotenv';
  dotenv.config();
  import { documentAI, languageClient, translateClient, vertexAI, PROCESSORS, MODELS, getAvailableModel } from './googleCloud.js';
  import ClauseDictionary from './clauseDictionary.js';
  import mammoth from 'mammoth';
  import pdf from 'pdf-parse';

  export class DocumentProcessor {
    constructor() {
      this.clauseDict = new ClauseDictionary();
      this.apiTimeout = 30000; // Increased from 15000
      this.maxRetries = 2;     // Increased from 1
      this.apiCallCount = 0;   // Track API usage
    }
    extractKeyEntities(text) {
    // For now, just reuse extractParties as key entities
    return this.extractParties(text);
  }
  getDetailedFallbackSummary(text) {
    return this.generateDetailedStructuredSummary(text);
  }
  generateStructuredFallbackSummary(text) {
  return this.generateDetailedStructuredSummary(text);
}

    // Helper function to wrap AI calls with timeout and retry logic
    async withTimeout(promise, timeoutMs = this.apiTimeout, retries = this.maxRetries, operation = 'API call') {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`${operation} - Attempt ${attempt + 1}/${retries + 1}`);
        
        const result = await Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms (attempt ${attempt + 1})`)), timeoutMs)
          )
        ]);
        
        console.log(`${operation} - Success on attempt ${attempt + 1}`);
        return result;
        
      } catch (error) {
        if (attempt === retries) {
          console.error(`${operation} - Failed after ${retries + 1} attempts:`, error.message);
          throw error;
        }
        
        const backoffDelay = Math.min(5000, 1000 * Math.pow(2, attempt));
        console.warn(`${operation} - Attempt ${attempt + 1} failed, retrying in ${backoffDelay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }


    // Detect document type from content
    detectDocumentType(text) {
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('lease') || lowerText.includes('rental') || lowerText.includes('tenant') || lowerText.includes('landlord')) {
        return 'lease';
      } else if (lowerText.includes('loan') || lowerText.includes('credit') || lowerText.includes('mortgage')) {
        return 'loan';
      } else if (lowerText.includes('employment') || lowerText.includes('job') || lowerText.includes('employee')) {
        return 'employment';
      } else if (lowerText.includes('service') || lowerText.includes('contractor') || lowerText.includes('consulting')) {
        return 'service';
      } else if (lowerText.includes('purchase') || lowerText.includes('sale') || lowerText.includes('buy') || lowerText.includes('sell')) {
        return 'purchase';
      } else if (lowerText.includes('partnership') || lowerText.includes('joint venture')) {
        return 'partnership';
      } else if (lowerText.includes('license') || lowerText.includes('licensing')) {
        return 'license';
      } else if (lowerText.includes('confidentiality') || lowerText.includes('non-disclosure') || lowerText.includes('nda')) {
        return 'nda';
      }
      
      return 'general';
    }


    extractParties(text) {
  const parties = [];
  const commonPartyTerms = [
    /tenant|renter|lessee/gi,
    /landlord|lessor|owner/gi,
    /employer|company/gi,
    /employee|worker/gi,
    /buyer|purchaser/gi,
    /seller|vendor/gi,
    /contractor|service provider/gi,
    /client|customer/gi
  ];

  commonPartyTerms.forEach(regex => {
    const matches = text.match(regex);
    if (matches) {
      parties.push(...matches.slice(0, 2).map(m => m.toLowerCase()));
    }
  });

  return [...new Set(parties)];
}
extractSpecificObligations(text) {
  const obligations = [];
  
  // Look for obligation patterns
  const obligationPatterns = [
    /(?:shall|must|will|required to|obligated to)\s+([^.!?]+)/gi,
    /(?:tenant|employee|party|you)\s+(?:shall|must|will|agree to)\s+([^.!?]+)/gi,
    /(?:it is agreed that|you agree to)\s+([^.!?]+)/gi
  ];

  obligationPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.slice(0, 3).forEach(match => {
      const cleaned = match.replace(/^(shall|must|will|required to|obligated to)\s+/i, '').trim();
      if (cleaned.length > 10 && cleaned.length < 150) {
        obligations.push(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
      }
    });
  });

  return [...new Set(obligations)];
}

// Extract penalty information
extractPenalties(text) {
  const penalties = [];
  const penaltyPatterns = [
    /penalty.*?\$[\d,]+(?:\.\d{2})?/gi,
    /fine.*?\$[\d,]+(?:\.\d{2})?/gi,
    /late fee.*?\$[\d,]+(?:\.\d{2})?/gi,
    /breach.*?result.*?(?:penalty|fine|fee|termination)/gi,
    /violation.*?(?:penalty|fine|fee)/gi
  ];

  penaltyPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.slice(0, 2).forEach(match => {
      if (match.length < 200) {
        penalties.push(match.trim());
      }
    });
  });

  return penalties;
}

// Extract termination conditions
extractTerminationConditions(text) {
  const conditions = [];
  const termPatterns = [
    /(?:terminat|end|cancel).*?(?:\d+)\s+days?\s+notice/gi,
    /either party.*?(?:terminat|end|cancel)/gi,
    /this agreement.*?(?:terminat|end|expire)/gi,
    /notice.*?(?:terminat|end|cancel)/gi
  ];

  termPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.slice(0, 3).forEach(match => {
      if (match.length < 200) {
        conditions.push(match.trim());
      }
    });
  });

  return conditions;
}

    // Extract key financial information
    extractFinancialInfo(text) {
      const financialInfo = {
        amounts: [],
        fees: [],
        penalties: []
      };

      // Find dollar amounts
      const dollarRegex = /\$[\d,]+(?:\.\d{2})?/g;
      const amounts = text.match(dollarRegex) || [];
      financialInfo.amounts = [...new Set(amounts)];

      // Find fee-related terms
      const feeTerms = ['late fee', 'penalty', 'fine', 'charge', 'cost'];
      for (const term of feeTerms) {
        const regex = new RegExp(`${term}[^.]*\\$[\\d,]+(?:\\.\\d{2})?`, 'gi');
        const matches = text.match(regex) || [];
        if (matches.length > 0) {
          financialInfo.fees.push(...matches);
        }
      }

      return financialInfo;
    }

    
    // Extract key dates and deadlines
    extractDates(text) {
      const dates = [];
      
      // Find date patterns
      const datePatterns = [
        /\d{1,2}\/\d{1,2}\/\d{2,4}/g, // MM/DD/YYYY
        /\d{1,2}-\d{1,2}-\d{2,4}/g,   // MM-DD-YYYY
        /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g,
        /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/g
      ];

      for (const pattern of datePatterns) {
        const matches = text.match(pattern) || [];
        dates.push(...matches);
      }

      // Find deadline terms with context
      const deadlineTerms = ['deadline', 'due date', 'expiration', 'notice period', 'termination date'];
      const deadlines = [];
      
      for (const term of deadlineTerms) {
        const regex = new RegExp(`${term}[^.]*`, 'gi');
        const matches = text.match(regex) || [];
        deadlines.push(...matches);
      }

      return { dates: [...new Set(dates)], deadlines };
    }

    // Detect language of the document text
    async detectLanguage(text) {
    try {
      // First try simple pattern detection
      const simpleDetection = this.simpleLanguageDetection(text);
      
      // If we have Google Cloud Language API configured and available
      if (languageClient && typeof languageClient.detectLanguage === 'function' && process.env.GOOGLE_CLOUD_PROJECT_ID) {
        try {
          const document = {
            content: text.substring(0, 1000), // First 1000 characters for detection
            type: 'PLAIN_TEXT',
          };

          console.log('Attempting Google Language API detection...');
          const [result] = await this.withTimeout(
            languageClient.detectLanguage({ document }),
            5000,
            1
          );

          if (result.languages && result.languages.length > 0) {
            const topLanguage = result.languages[0];
            const detectedLanguage = this.mapToSupportedLanguage(topLanguage.language);
            const confidence = topLanguage.confidence || 0.5;

            console.log(`Google detected language: ${detectedLanguage} (confidence: ${confidence})`);
            
            return {
              language: detectedLanguage,
              confidence: confidence
            };
          }
        } catch (apiError) {
          console.warn('Google Language API detection failed:', apiError.message);
        }
      } else {
        console.log('Google Language API not available, client exists:', !!languageClient, 'has method:', !!(languageClient && typeof languageClient.detectLanguage === 'function'));
      }

      console.log('Using simple language detection fallback');
      return simpleDetection;

    } catch (error) {
      console.warn('Language detection failed:', error.message);
      return { language: 'en', confidence: 0.5 };
    }
  }

  generateDetailedFallbackQuestions(text, clauses) {
  const lowerText = text.toLowerCase();
  const documentType = this.detectDocumentType(text);
  const financialInfo = this.extractFinancialInfo(text);
  const questions = [];

  // Extract specific amounts and timeframes for targeted questions
  const amounts = financialInfo.amounts || [];
  const hasLateFees = lowerText.includes('late fee') || lowerText.includes('penalty');
  const hasNoticeRequirement = lowerText.includes('notice') || lowerText.includes('days');
  const hasTermination = lowerText.includes('terminat') || lowerText.includes('cancel');
  
  // Get specific timeframes mentioned
  const dayMatches = text.match(/(\d+)\s+days?/gi) || [];
  const specificTimeframe = dayMatches[0] || '';

  // Document type specific questions with actual content
  if (documentType === 'lease') {
    // Rental/Lease specific questions
    if (amounts.length > 0) {
      questions.push(`What happens if I'm late paying the ${amounts[0]}?`);
    } else {
      questions.push("What are the exact rent amount and payment due dates?");
    }
    
    if (hasNoticeRequirement && specificTimeframe) {
      questions.push(`Do I really need to give ${specificTimeframe} notice to move out?`);
    } else {
      questions.push("How much notice do I need to give before moving out?");
    }
    
    questions.push("What repairs and maintenance am I responsible for vs. the landlord?");
    
    if (hasLateFees) {
      questions.push("How much are the late fees and when do they start?");
    } else {
      questions.push("Are there any deposits or fees I need to pay upfront?");
    }
    
  } else if (documentType === 'employment') {
    // Employment specific questions
    questions.push("What exactly is my salary/wage and when do I get paid?");
    questions.push("What happens if I want to quit - what notice do I need to give?");
    questions.push("What benefits am I entitled to (health, vacation, etc.)?");
    
    if (lowerText.includes('non-compete') || lowerText.includes('confidential')) {
      questions.push("What are the non-compete and confidentiality restrictions?");
    } else {
      questions.push("Can I be fired without cause and what severance would I get?");
    }
    
  } else if (documentType === 'service') {
    // Service agreement questions
    if (amounts.length > 0) {
      questions.push(`When and how do I pay the ${amounts[0]} service fee?`);
    } else {
      questions.push("What are the exact service costs and payment schedule?");
    }
    
    questions.push("What specific services will be provided and by when?");
    questions.push("What happens if the service provider doesn't deliver as promised?");
    
    if (hasTermination) {
      questions.push("How can I cancel this service agreement if I'm not satisfied?");
    } else {
      questions.push("What are my rights if the service is unsatisfactory?");
    }
    
  } else if (documentType === 'loan') {
    // Loan specific questions
    if (amounts.length > 0) {
      questions.push(`What happens if I miss a payment on this ${amounts[0]} loan?`);
    } else {
      questions.push("What are the exact loan amount, interest rate, and payment schedule?");
    }
    
    questions.push("What collateral or assets are at risk if I default?");
    questions.push("Are there prepayment penalties if I pay off early?");
    questions.push("What fees and charges apply beyond the stated interest rate?");
    
  } else {
    // General document questions - but still specific
    if (amounts.length > 0) {
      if (hasLateFees) {
        questions.push(`What penalties apply if I'm late with the ${amounts[0]} payment?`);
      } else {
        questions.push(`When exactly is the ${amounts[0]} payment due?`);
      }
    } else {
      questions.push("What are all the costs, fees, and financial obligations?");
    }
    
    if (hasTermination && specificTimeframe) {
      questions.push(`How do I properly cancel this agreement with ${specificTimeframe} notice?`);
    } else if (hasTermination) {
      questions.push("How can I end or cancel this agreement?");
    } else {
      questions.push("What are my options if I want to get out of this agreement?");
    }
    
    if (lowerText.includes('breach') || lowerText.includes('violation')) {
      questions.push("What specific actions could get me in trouble or breach this contract?");
    } else {
      questions.push("What are my main obligations and what must I avoid doing?");
    }
    
    if (lowerText.includes('damages') || lowerText.includes('liable')) {
      questions.push("What am I potentially liable for and how much could it cost me?");
    } else {
      questions.push("What happens if something goes wrong - who pays for what?");
    }
  }

  // Ensure we have exactly 4 questions
  const finalQuestions = questions.slice(0, 4);
  
  // Fill up to 4 if we don't have enough
  while (finalQuestions.length < 4) {
    const genericQuestions = [
      "What are the most important deadlines I need to remember?",
      "What could void or terminate this agreement?",
      "Who do I contact if there's a problem or dispute?",
      "What documentation do I need to keep for my records?"
    ];
    
    for (const q of genericQuestions) {
      if (!finalQuestions.includes(q) && finalQuestions.length < 4) {
        finalQuestions.push(q);
      }
    }
  }

  console.log(`Generated ${finalQuestions.length} detailed fallback questions for ${documentType} document`);
  return finalQuestions;
}

    // Enhanced simple language detection with better patterns
    simpleLanguageDetection(text) {
      const lowerText = text.toLowerCase().substring(0, 2000);
      
      const languagePatterns = {
        'en': {
          words: ['agreement', 'contract', 'tenant', 'landlord', 'hereby', 'whereas', 'rental', 'lease', 'property', 'terms', 'conditions', 'shall', 'party', 'parties', 'signed', 'covenant', 'obligation'],
          score: 0
        },
        'es': {
          words: ['contrato', 'acuerdo', 'arrendatario', 'arrendador', 'clausula', 'articulo', 'condiciones', 'terminos', 'derechos', 'obligaciones', 'partes', 'firmado', 'propiedad'],
          score: 0
        },
        'fr': {
          words: ['contrat', 'accord', 'locataire', 'proprietaire', 'article', 'clause', 'conditions', 'termes', 'droits', 'obligations', 'parties', 'signe', 'propriete'],
          score: 0
        },
        'de': {
          words: ['vertrag', 'vereinbarung', 'mieter', 'vermieter', 'artikel', 'klausel', 'bedingungen', 'rechte', 'verpflichtungen', 'parteien', 'unterzeichnet', 'eigentum'],
          score: 0
        }
      };

      for (const [lang, data] of Object.entries(languagePatterns)) {
        for (const word of data.words) {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = (lowerText.match(regex) || []).length;
          data.score += matches * (word.length > 6 ? 3 : 2);
        }
      }

      let detectedLang = 'en';
      let maxScore = 0;
      let confidence = 0.5;

      for (const [lang, data] of Object.entries(languagePatterns)) {
        if (data.score > maxScore) {
          maxScore = data.score;
          detectedLang = lang;
        }
      }

      if (detectedLang === 'en' && maxScore > 5) {
        confidence = Math.min(0.95, 0.7 + (maxScore * 0.05));
      } else if (maxScore > 3) {
        confidence = Math.min(0.9, 0.6 + (maxScore * 0.05));
      } else {
        detectedLang = 'en';
        confidence = 0.8;
      }

      const strongEnglishIndicators = ['hereby', 'whereas', 'landlord', 'tenant', 'rental agreement', 'lease', 'shall', 'covenant'];
      let englishIndicatorCount = 0;
      for (const indicator of strongEnglishIndicators) {
        if (lowerText.includes(indicator)) {
          englishIndicatorCount++;
        }
      }

      if (englishIndicatorCount >= 2) {
        detectedLang = 'en';
        confidence = Math.min(0.95, 0.8 + (englishIndicatorCount * 0.05));
      }

      console.log(`Simple detection: ${detectedLang} (english indicators: ${englishIndicatorCount}, max score: ${maxScore}, confidence: ${confidence})`);

      return {
        language: detectedLang,
        confidence: confidence
      };
    }

    mapToSupportedLanguage(detectedLang) {
      const langMapping = {
        'spanish': 'es',
        'french': 'fr', 
        'german': 'de',
        'italian': 'it',
        'portuguese': 'pt',
        'chinese': 'zh',
        'japanese': 'ja',
        'korean': 'ko',
        'hindi': 'hi',
        'english': 'en'
      };

      const supportedCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'hi'];
      if (supportedCodes.includes(detectedLang)) {
        return detectedLang;
      }

      return langMapping[detectedLang.toLowerCase()] || 'en';
    }

    // Enhanced text extraction
    async extractText(fileBuffer, fileType) {
      let extractedText = '';

      try {
        if (fileType === 'application/pdf') {
          const data = await pdf(fileBuffer);
          extractedText = data.text;
        } else if (
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
        } else {
          throw new Error('Unsupported file type');
        }

        console.log('Standard extraction completed, text length:', extractedText.length);

        if (this.isDocumentAIConfigured()) {
          try {
            console.log('Attempting Document AI processing...');
            const docAIText = await this.processWithDocumentAI(fileBuffer, fileType);
            
            if (docAIText && docAIText.length > extractedText.length * 0.8) {
              console.log('Document AI provided better extraction');
              extractedText = docAIText;
            } else {
              console.log('Standard extraction was better, using that');
            }
          } catch (docAIError) {
            console.warn('Document AI processing failed:', docAIError.message);
          }
        } else {
          console.log('Document AI not configured, using standard extraction only');
        }

        return extractedText;
      } catch (error) {
        console.error('Error extracting text:', error);
        throw error;
      }
    }

    isDocumentAIConfigured() {
      return !!(
        documentAI &&
        process.env.FORM_PARSER_PROCESSOR_NAME &&
        process.env.FORM_PARSER_PROCESSOR_NAME.trim() !== '' &&
        process.env.GOOGLE_CLOUD_PROJECT_ID &&
        process.env.GOOGLE_CLOUD_LOCATION
      );
    }

    // Fix for documentProcessor.js - Update the processWithDocumentAI method

  async processWithDocumentAI(fileBuffer, fileType) {
    if (!this.isDocumentAIConfigured()) {
      throw new Error('Document AI not properly configured');
    }

    // Fix: Use the full processor name format
    const processorName = process.env.FORM_PARSER_PROCESSOR_NAME;

    
    // Fix: Ensure proper MIME type mapping
    const mimeTypeMap = {
      'application/pdf': 'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    const mappedMimeType = mimeTypeMap[fileType];
    if (!mappedMimeType) {
      throw new Error(`Unsupported file type for Document AI: ${fileType}`);
    }

    const request = {
      name: processorName,
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType: mappedMimeType,
      },
      // Fix: Add field mask to specify what we want extracted
      fieldMask: {
        paths: ['text', 'entities', 'pages.paragraphs']
      }
    };

    try {
      console.log(`Calling Document AI with processor: ${processorName}`);
      console.log(`File type: ${fileType} -> MIME: ${mappedMimeType}`);
      console.log(`File size: ${fileBuffer.length} bytes`);
      
      const [result] = await this.withTimeout(
        documentAI.processDocument(request),
        45000, // Increased timeout for Document AI
        0      // No retries for Document AI
      );

      if (result?.document?.text) {
        console.log('Document AI extraction successful, text length:', result.document.text.length);
        return result.document.text;
      }

      console.log('Document AI returned no text content');
      return null;
    } catch (docAIError) {
      console.warn('Document AI processing failed:', docAIError.message);
      
      // Log more details for debugging
      if (docAIError.details) {
        console.warn('Document AI error details:', docAIError.details);
      }
      
      return null;
    }
  }

    // Enhanced summary generation with structured output
    async generateSummary(text, detectedLanguage = 'en') {
  if (!vertexAI || !process.env.GOOGLE_CLOUD_PROJECT_ID) {
    console.warn('Vertex AI not configured, using detailed structured fallback');
    return this.generateDetailedStructuredSummary(text);
  }
  
  try {
    const model = vertexAI.getGenerativeModel({
      model: await getAvailableModel(),
    });

    const documentType = this.detectDocumentType(text);
    const financialInfo = this.extractFinancialInfo(text);
    const dateInfo = this.extractDates(text);

    // Extract key parties and specific terms
    const keyEntities = this.extractKeyEntities(text);
    const obligations = this.extractSpecificObligations(text);

    const languageInstruction = detectedLanguage !== 'en' 
      ? `Provide the analysis in ${this.getLanguageName(detectedLanguage)}.` 
      : '';

    // Corrected code with a better prompt
const prompt = `
  Analyze the following legal document and provide a clear, concise, and easy-to-read summary. Use markdown for structure.

  **Instructions:**
  - Use natural language. Do NOT use a question-and-answer format.
  - Use markdown headings (##), bold text for key terms (**Term**), and bullet points (-) for lists.
  - Extract and highlight the most critical financial numbers and dates.

  **Output Structure:**

  ## Key Details At a Glance
  - **Document Type:** (e.g., Fixed-Term Residential Lease)
  - **Monthly Rent:** (e.g., **$1,500**)
  - **Security Deposit:** (e.g., **$1,500**)
  - **Lease Start Date:** (e.g., **July 1, 2024**)
  - **Lease End Date:** (e.g., **June 30, 2025**)
  - **Notice Period for Termination:** (e.g., **30 days**)

  ## Parties Involved
  - **Landlord:** [Name and responsibilities]
  - **Tenant:** [Name and responsibilities]

  ## Financial Obligations
  - **Rent Payment:** [Details on when and how rent is due, e.g., "Due on the 1st of each month."]
  - **Late Fees:** [Specific details of any late fees, e.g., "**$50** if paid after the 5th of the month."]
  - **Other Charges:** [Mention any other fees like returned check fees, etc.]

  ## Rights and Obligations
  - **Landlord's Key Obligations:**
    - [Responsibility 1]
    - [Responsibility 2]
  - **Tenant's Key Obligations:**
    - [Responsibility 1]
    - [Responsibility 2]

  ## Termination and Renewal
  - **Termination:** [How either party can terminate the agreement. Include notice periods.]
  - **Renewal:** [What happens at the end of the lease term, e.g., "Becomes month-to-month unless 30 days notice is given."]

  ## Risks and Penalties
  - [List any specific actions that result in a penalty, fine, or breach of contract.]
  - [Mention any clauses about liability or damages.]

  ---
  Document Text:
  ${text.substring(0, 4000)}
`;

    console.log('Generating detailed legal summary...');
    const result = await this.withTimeout(
      model.generateContent(prompt),
      30000,
      1,
      'Detailed summary generation'
    );
    
    const generatedSummary = result.response.candidates[0].content.parts[0].text;
    console.log('Detailed summary generated successfully, length:', generatedSummary.length);
    return generatedSummary;

  } catch (error) {
    console.error('Detailed summary generation failed:', error.message);
    console.log('Using detailed structured fallback');
    return this.generateDetailedStructuredSummary(text);
  }
}

    // Generate structured fallback summary using extracted information
    generateDetailedStructuredSummary(text) {
  const documentType = this.detectDocumentType(text);
  const financialInfo = this.extractFinancialInfo(text);
  const dateInfo = this.extractDates(text);
  const lowerText = text.toLowerCase();
  
  // Extract specific details
  const parties = this.extractParties(text);
  const obligations = this.extractSpecificObligations(text);
  const penalties = this.extractPenalties(text);
  const termConditions = this.extractTerminationConditions(text);

  const typeDescriptions = {
    lease: 'Rental/Lease Agreement',
    loan: 'Loan/Financing Agreement',
    employment: 'Employment Contract',
    service: 'Service Agreement',
    purchase: 'Purchase/Sale Agreement',
    partnership: 'Partnership Agreement',
    license: 'License Agreement',
    nda: 'Non-Disclosure Agreement',
    general: 'Legal Contract'
  };

  let summary = `DOCUMENT OVERVIEW:
This is a ${typeDescriptions[documentType]} establishing a legal relationship between the parties. `;

  if (parties.length > 0) {
    summary += `The parties involved include: ${parties.join(', ')}. `;
  }

  summary += `This document creates binding obligations and defines specific rights and responsibilities for each party.

KEY FINANCIAL TERMS:`;

  if (financialInfo.amounts.length > 0) {
    summary += `
- MONETARY AMOUNTS: ${financialInfo.amounts.join(', ')}`;
    
    // Try to identify payment types
    if (lowerText.includes('monthly')) {
      const monthlyAmount = financialInfo.amounts.find(amt => 
        text.toLowerCase().includes('monthly') && text.toLowerCase().indexOf(amt.toLowerCase()) > -1
      );
      if (monthlyAmount) summary += `
- MONTHLY PAYMENT: ${monthlyAmount}`;
    }
    
    if (lowerText.includes('late fee') || lowerText.includes('penalty')) {
      summary += `
- LATE FEES/PENALTIES: Additional charges apply for late payments`;
    }
  } else {
    summary += `
- No specific monetary amounts clearly identified in the document`;
  }

  if (financialInfo.fees.length > 0) {
    summary += `
- ADDITIONAL FEES: ${financialInfo.fees.slice(0, 3).join('; ')}`;
  }

  summary += `

SPECIFIC OBLIGATIONS - WHAT YOU MUST DO:`;

  if (obligations.length > 0) {
    obligations.slice(0, 5).forEach(obligation => {
      summary += `
- ${obligation}`;
    });
  } else {
    // Generic obligations based on document type
    if (documentType === 'lease') {
      summary += `
- Pay rent on time as specified
- Maintain the property in good condition
- Follow all rules and restrictions
- Provide proper notice before moving out`;
    } else if (documentType === 'employment') {
      summary += `
- Perform assigned work duties
- Follow company policies and procedures
- Maintain confidentiality where required
- Provide appropriate notice if leaving`;
    } else {
      summary += `
- Comply with all terms and conditions specified
- Meet all deadlines and performance requirements
- Provide required notices and communications
- Maintain standards specified in the agreement`;
    }
  }

  summary += `

TERMINATION & CANCELLATION:`;

  if (termConditions.length > 0) {
    termConditions.forEach(condition => {
      summary += `
- ${condition}`;
    });
  } else {
    if (lowerText.includes('30 days') && lowerText.includes('notice')) {
      summary += `
- 30 days written notice appears to be required`;
    } else if (lowerText.includes('notice')) {
      summary += `
- Written notice is required (specific timeframe should be reviewed)`;
    } else {
      summary += `
- Termination conditions should be reviewed carefully in the full document`;
    }
  }

  summary += `

HIGH-RISK AREAS & PENALTIES:`;

  if (penalties.length > 0) {
    penalties.forEach(penalty => {
      summary += `
- ${penalty}`;
    });
  } else {
    if (lowerText.includes('breach') || lowerText.includes('violation')) {
      summary += `
- Breach or violation of terms may result in penalties`;
    }
    if (lowerText.includes('damages') || lowerText.includes('liability')) {
      summary += `
- Financial liability may apply for damages or losses`;
    }
    if (lowerText.includes('immediate') && lowerText.includes('terminat')) {
      summary += `
- Certain violations may result in immediate termination`;
    }
    if (!penalties.length && !(lowerText.includes('breach') || lowerText.includes('damages'))) {
      summary += `
- Review the full document for specific penalty and liability provisions`;
    }
  }

  summary += `

IMPORTANT DATES & DEADLINES:`;

  if (dateInfo.dates.length > 0) {
    summary += `
- KEY DATES: ${dateInfo.dates.slice(0, 5).join(', ')}`;
  }

  if (dateInfo.deadlines.length > 0) {
    summary += `
- DEADLINE REQUIREMENTS: ${dateInfo.deadlines.slice(0, 3).join('; ')}`;
  }

  // Extract notice periods
  const noticeMatches = text.match(/(\d+)\s+days?\s+(?:written\s+)?notice/gi) || [];
  if (noticeMatches.length > 0) {
    summary += `
- NOTICE REQUIREMENTS: ${noticeMatches.join(', ')}`;
  }

  if (dateInfo.dates.length === 0 && dateInfo.deadlines.length === 0) {
    summary += `
- Review the document carefully for specific dates, deadlines, and notice requirements`;
  }

  summary += `

CRITICAL ACTION ITEMS:
1. Review all financial amounts and payment schedules carefully
2. Understand exactly what you must do and when
3. Know how to properly terminate or cancel if needed
4. Be aware of all potential penalties and fees
5. Mark all important dates and deadlines in your calendar
6. Consider seeking legal advice if any terms are unclear

Remember: This analysis provides key insights, but you should review the complete document thoroughly before signing.`;

  return summary.trim();
}
    // Enhanced document classification
    async classifyDocument(text, detectedLanguage = 'en') {
      try {
        const clauses = this.splitIntoClauses(text);
        const classifiedClauses = [];

        const clausesToProcess = clauses.slice(0, 3);
        console.log(`Processing ${clausesToProcess.length} clauses in ${detectedLanguage}...`);

        for (const [index, clause] of clausesToProcess.entries()) {
          try {
            console.log(`Processing clause ${index + 1}/${clausesToProcess.length}`);
            
            const classification = await this.classifyClause(clause);
            const riskAssessment = await this.assessRisk(clause);
            
            let dictionaryMatch = null;
            try {
              dictionaryMatch = await this.clauseDict.getClauseExplanation(
                classification.type,
                clause
              );
            } catch (dictError) {
              console.warn('Dictionary lookup failed:', dictError.message);
            }

            let explanation = dictionaryMatch?.plainLanguageExplanation;
            let suggestedQuestions = dictionaryMatch?.suggestedQuestions || [];

            if (!explanation && classifiedClauses.length < 2) {
              try {
                explanation = await this.generateClauseExplanation(clause, classification.type, detectedLanguage);
                console.log(`AI explanation generated for ${classification.type} clause`);
              } catch (error) {
                console.warn(`AI explanation failed for ${classification.type}:`, error.message);
                explanation = this.getFallbackExplanation(classification.type);
              }
            }

            if (!explanation) {
              explanation = this.getFallbackExplanation(classification.type);
            }
            if (suggestedQuestions.length === 0) {
              suggestedQuestions = this.getFallbackQuestionsForType(classification.type);
            }

            classifiedClauses.push({
              text: clause,
              type: classification.type,
              confidence: classification.confidence,
              riskScore: riskAssessment.score,
              riskCategory: riskAssessment.category,
              explanation,
              fromDictionary: !!dictionaryMatch,
              suggestedQuestions,
            });

          } catch (clauseError) {
            console.error(`Error processing clause ${index + 1}:`, clauseError);
            classifiedClauses.push({
              text: clause.substring(0, 200) + "...",
              type: 'general',
              confidence: 0.3,
              riskScore: 2,
              riskCategory: 'medium',
              explanation: 'This clause requires manual review due to processing limitations.',
              fromDictionary: false,
              suggestedQuestions: ['What does this clause mean?', 'How does this affect me?'],
            });
          }
        }

        return classifiedClauses.length > 0 ? classifiedClauses : this.getFallbackClauses(text);
      } catch (error) {
        console.error('Error classifying document:', error);
        return this.getFallbackClauses(text);
      }
    }

    async generateClauseExplanation(clause, type, language = 'en') {
      if (!vertexAI) {
        return null;
      }

      try {
        const model = vertexAI.getGenerativeModel({
          model: await getAvailableModel(),
        });

        const languageInstruction = language !== 'en' 
          ? `Respond in ${this.getLanguageName(language)}.` 
          : '';

        const prompt = `${languageInstruction} Explain this ${type} clause in 2-3 simple sentences that a regular person can understand. Be direct and clear, no formatting or special characters: "${clause.substring(0, 200)}"`;
        
        const result = await this.withTimeout(
          model.generateContent(prompt),
          8000,
          1
        );
        
        const response = result.response.candidates[0].content.parts[0].text;
        return this.cleanAIResponse(response);
      } catch (error) {
        console.warn('Failed to generate clause explanation:', error.message);
        return null;
      }
    }

    cleanAIResponse(text) {
      if (!text) return '';
      
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/[-•]\s/g, '')
        .replace(/\d+\.\s/g, '')
        .replace(/\n\s*\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 300);
    }

    getLanguageName(code) {
      const names = {
        'es': 'Spanish',
        'fr': 'French', 
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'hi': 'Hindi',
        'en': 'English'
      };
      return names[code] || 'English';
    }

    getFallbackQuestions() {
      return [
        "What are the main costs and fees mentioned?",
        "How can this agreement be terminated?", 
        "What penalties apply if I don't follow the terms?",
        "What are my key rights and obligations?"
      ];
    }

    getFallbackExplanation(type) {
      const explanations = {
        'termination': 'This clause explains how and when the agreement can be ended.',
        'payment': 'This clause outlines payment obligations, amounts, and timing.',
        'penalty': 'This clause describes consequences for not following the agreement.',
        'renewal': 'This clause explains how the agreement continues or renews.',
        'liability': 'This clause defines who is responsible for damages or losses.',
        'confidentiality': 'This clause requires keeping certain information private.',
        'warranty': 'This clause provides guarantees or promises about performance.',
        'general': 'This clause contains important terms and conditions that should be reviewed carefully.'
      };
      return explanations[type] || explanations['general'];
    }

    getFallbackQuestionsForType(type) {
      const questionsByType = {
        'termination': ['How do I end this agreement?', 'What notice is required?'],
        'payment': ['When are payments due?', 'Are there late fees?'],
        'penalty': ['What happens if I violate this?', 'How much could I owe?'],
        'renewal': ['Does this automatically renew?', 'How do I prevent renewal?'],
        'liability': ['What am I responsible for?', 'Are there limits on damages?'],
        'confidentiality': ['What information must I keep private?', 'How long does this last?'],
        'warranty': ['What is guaranteed?', 'What if something goes wrong?']
      };
      return questionsByType[type] || ['What does this clause mean?', 'How does this affect me?'];
    }
    resetApiCallCounter() {
      this.apiCallCount = 0;
    }


    getFallbackClauses(text) {
      return [{
        text: text.substring(0, 500) + "...",
        type: 'general',
        confidence: 0.5,
        riskScore: 2,
        riskCategory: 'medium',
        explanation: 'This document contains legal terms that should be reviewed carefully with attention to obligations, deadlines, and potential penalties.',
        fromDictionary: false,
        suggestedQuestions: [
          'What are the main obligations in this document?',
          'Are there any important deadlines or penalties?'
        ],
      }];
    }

    splitIntoClauses(text) {
      try {
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 25);
        const clauses = [];
        
        for (let i = 0; i < sentences.length && clauses.length < 6; i += 2) {
          const clause = sentences.slice(i, i + 2).join('. ').trim();
          if (clause.length > 40) {
            clauses.push(clause);
          }
        }
        
        return clauses.length > 0 ? clauses : [text.substring(0, 500)];
      } catch (error) {
        console.error('Error splitting clauses:', error);
        return [text.substring(0, 500)];
      }
    }

    async classifyClause(clause) {
      try {
        const clauseTypes = {
          'termination': ['terminate', 'end', 'cancel', 'expire', 'dissolution', 'conclude'],
          'payment': ['pay', 'fee', 'cost', 'amount', 'money', 'charge', 'bill', 'due', 'owe'],
          'penalty': ['penalty', 'fine', 'violation', 'breach', 'forfeit', 'damages', 'liquidated'],
          'renewal': ['renew', 'extend', 'automatic', 'continue', 'successive'],
          'liability': ['liable', 'responsible', 'damages', 'injury', 'loss', 'indemnify'],
          'confidentiality': ['confidential', 'private', 'secret', 'disclosure', 'proprietary'],
          'warranty': ['warrant', 'guarantee', 'assure', 'promise', 'represent'],
        };

        let bestType = 'general';
        let maxScore = 0;
        const lowerClause = clause.toLowerCase();

        for (const [type, keywords] of Object.entries(clauseTypes)) {
          let score = 0;
          for (const keyword of keywords) {
            if (lowerClause.includes(keyword)) {
              score += keyword.length > 5 ? 2 : 1;
            }
          }
          if (score > maxScore) {
            maxScore = score;
            bestType = type;
          }
        }

        return {
          type: bestType,
          confidence: maxScore > 0 ? Math.min(0.9, 0.4 + (maxScore * 0.1)) : 0.4
        };
      } catch (error) {
        console.error('Error classifying clause:', error);
        return { type: 'general', confidence: 0.3 };
      }
    }

    async assessRisk(clause) {
      try {
        const riskKeywords = {
          high: ['penalty', 'forfeit', 'liability', 'damages', 'terminate immediately', 'breach', 'violation', 'liquidated damages', 'indemnify'],
          medium: ['fee', 'charge', 'notice', 'obligation', 'must', 'required', 'shall', 'responsible', 'due'],
          low: ['option', 'may', 'discretion', 'suggest', 'recommend', 'voluntary']
        };

        let riskScore = 1;
        let riskCategory = 'low';
        const lowerClause = clause.toLowerCase();

        for (const [category, keywords] of Object.entries(riskKeywords)) {
          let matches = 0;
          for (const keyword of keywords) {
            if (lowerClause.includes(keyword)) {
              matches += keyword.length > 6 ? 2 : 1;
            }
          }
          
          if (matches > 0) {
            if (category === 'high') {
              riskScore = Math.min(5, 3 + Math.floor(matches / 2));
              riskCategory = 'high';
              break;
            } else if (category === 'medium' && riskCategory !== 'high') {
              riskScore = Math.min(4, 2 + Math.floor(matches / 3));
              riskCategory = 'medium';
            }
          }
        }

        return { score: riskScore, category: riskCategory };
      } catch (error) {
        console.error('Error assessing risk:', error);
        return { score: 2, category: 'medium' };
      }
    }

  // Corrected code with safety settings
async generateSmartQuestions(text, clauses, detectedLanguage = 'en') {
  try {
    if (!vertexAI) {
      console.warn('Vertex AI not available, generating detailed fallback questions');
      return this.generateDetailedFallbackQuestions(text, clauses);
    }

    // Define more lenient safety settings for this specific legal context
    const safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ];

    const model = vertexAI.getGenerativeModel({
      model: await getAvailableModel(),
      safetySettings, // <-- Add the safety settings here
    });

    const documentType = this.detectDocumentType(text);
    const financialInfo = this.extractFinancialInfo(text);
    const dateInfo = this.extractDates(text);
    
    const languageInstruction = detectedLanguage !== 'en' 
      ? `Generate questions in ${this.getLanguageName(detectedLanguage)}.` 
      : '';

    const prompt = `
      ${languageInstruction}
      
      Generate 4 specific, practical questions that someone should ask about THIS legal document. Focus on the actual content and help them understand their specific situation.

      Document type: ${documentType}
      Financial amounts found: ${financialInfo.amounts.slice(0, 3).join(', ') || 'None'}
      Key dates found: ${dateInfo.dates.slice(0, 3).join(', ') || 'None'}

      Document excerpt: ${text.substring(0, 2500)}

      Generate questions that are:
      1. Specific to this document's actual content
      2. About concrete things the person needs to know
      3. Practical and actionable
      4. About real consequences or obligations

      Examples of good questions:
      - "What happens if I'm 5 days late with the $1,200 monthly payment?"
      - "How much notice do I need to give to cancel this agreement?"
      - "What specific repairs am I responsible for vs. the landlord?"

      Generate 4 questions (one per line, no numbering):
    `;

    const result = await this.withTimeout(
      model.generateContent(prompt),
      50000,
      1,
      'Smart questions generation'
    );
    
    const response = result.response.candidates[0].content.parts[0].text;
    
    const questions = response.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.?\s*[-•]?\s*/, '').trim())
      .filter(q => q.length > 15 && q.includes('?'))
      .slice(0, 4);

    console.log(`Generated ${questions.length} specific smart questions from AI`);

    while (questions.length < 4) {
      const genericQuestions = this.getFallbackQuestions();
      for (const q of genericQuestions) {
        if (!questions.includes(q) && questions.length < 4) {
          questions.push(q);
        }
      }
    }

    return questions.slice(0, 4);
    
  } catch (error) {
    console.error('Smart questions generation failed:', error.message);
    return this.generateDetailedFallbackQuestions(text, clauses);
  }
}

    async answerQuestion(question, documentText, language = 'en') {
      try {
        if (!vertexAI) {
          return "I'm having trouble accessing AI services right now. Please try asking a more specific question about the document's terms, obligations, or key provisions.";
        }

        const model = vertexAI.getGenerativeModel({
          model: await getAvailableModel(),
        });

        const languageInstruction = language !== 'en' 
          ? `Answer in ${this.getLanguageName(language)}.` 
          : '';

        const prompt = `
          ${languageInstruction}
          Answer this question about the legal document in simple, clear language:
          
          Question: ${question}
          
          Document excerpt: ${documentText.substring(0, 1500)}
          
          Answer (be specific and helpful):
        `;

        const result = await this.withTimeout(
          model.generateContent(prompt),
          10000,
          1
        );
        
        return result.response.candidates[0].content.parts[0].text;

      } catch (error) {
        console.error('Error answering question:', error);
        return "I'm having trouble processing your question right now. This might be due to high demand on our AI services. Please try rephrasing your question or asking about specific terms, deadlines, or obligations in the document.";
      }
    }
  }