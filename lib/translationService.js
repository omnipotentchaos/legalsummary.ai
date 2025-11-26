// lib/translationService.js - FIXED: Translate outputs only, don't regenerate
import { translateClient } from './googleCloud.js';

class TranslationService {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
  }

  // MODIFIED: Added a safe return on failure instead of throwing
  async translateText(text, targetLanguage, sourceLanguage) {
    if (!text || targetLanguage === sourceLanguage) {
      return text;
    }

    try {
      if (!translateClient || !this.projectId) {
        throw new Error('Translation client not fully configured or available');
      }

      const sourceCode = sourceLanguage.substring(0, 2);
      const targetCode = targetLanguage.substring(0, 2);
      
      if (sourceCode === targetCode) {
        return text;
      }
      
      // Use shorter content limit for robustness/cost control
      const maxContentSize = 4000;
      
      if (text.length < maxContentSize) {
        const [translation] = await translateClient.translateText({
          parent: `projects/${this.projectId}/locations/${this.location}`,
          contents: [text],
          mimeType: 'text/plain',
          sourceLanguageCode: sourceCode,
          targetLanguageCode: targetCode,
        });

        return translation.translations[0].translatedText;
      }

      // Chunking logic for long text
      const chunks = this.splitTextIntoChunks(text, maxContentSize);
      const translatedChunks = [];

      for (const chunk of chunks) {
        const [translation] = await translateClient.translateText({
          parent: `projects/${this.projectId}/locations/${this.location}`,
          contents: [chunk],
          mimeType: 'text/plain',
          sourceLanguageCode: sourceCode,
          targetLanguageCode: targetCode,
        });

        translatedChunks.push(translation.translations[0].translatedText);
      }

      return translatedChunks.join('\n\n');

    } catch (error) {
      // CRITICAL FIX: Log the error but return the original text on failure
      console.error(`❌ Translation FAILED from ${sourceLanguage} to ${targetLanguage}. Returning original text. Error:`, error.message);
      return text; 
    }
  }

  // FIXED: Only translate the outputs, keep original clause text
  async translateDocument(documentData, targetLanguage) {
    try {
      const sourceLanguage = documentData.detectedLanguage || 'en';
      console.log(`Translating outputs from ${sourceLanguage} to ${targetLanguage}...`);

      if (sourceLanguage === targetLanguage) {
        return {
          ...documentData,
          translatedTo: targetLanguage,
          analysisLanguage: targetLanguage
        };
      }

      // Translate summary
      // NOTE: translateText will return original text if the API fails
      const translatedSummary = await this.translateText(
        documentData.summary,
        targetLanguage,
        sourceLanguage
      );

      // Translate clause explanations only (keep original text)
      const translatedClauses = await Promise.all(
        documentData.clauses.map(async (clause) => {
          // NOTE: translateText will return original text if the API fails
          const translatedExplanation = await this.translateText(
            clause.explanation,
            targetLanguage,
            sourceLanguage
          );

          // NOTE: translateText will return original text if the API fails
          const translatedQuestions = await Promise.all(
            (clause.suggestedQuestions || []).map(q => 
              this.translateText(q, targetLanguage, sourceLanguage)
            )
          );

          return {
            ...clause,
            text: clause.text, // KEEP ORIGINAL
            explanation: translatedExplanation, // TRANSLATE (or original fallback)
            suggestedQuestions: translatedQuestions, // TRANSLATE (or original fallback)
          };
        })
      );

      // Translate smart questions
      // NOTE: translateText will return original text if the API fails
      const translatedQuestions = await Promise.all(
        documentData.smartQuestions.map(q => 
          this.translateText(q, targetLanguage, sourceLanguage)
        )
      );

      console.log(`Translation to ${targetLanguage} complete (with fallbacks if needed)`);

      return {
        ...documentData,
        summary: translatedSummary,
        clauses: translatedClauses,
        smartQuestions: translatedQuestions,
        translatedTo: targetLanguage,
        translatedAt: new Date(),
        detectedLanguage: documentData.detectedLanguage,
        analysisLanguage: targetLanguage
      };

    } catch (error) {
      // NOTE: This catch should now only fire on major, non-translation-API errors
      console.error('Document translation error (non-API error):', error);
      throw error; 
    }
  }

  splitTextIntoChunks(text, maxChunkSize) {
    const chunks = [];
    const paragraphs = text.split('\n\n');
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > maxChunkSize) {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }

  async translateChatResponse(response, targetLanguage, sourceLanguage = 'en') {
    if (targetLanguage === sourceLanguage) return response;
    
    // NOTE: translateText will return original text if the API fails
    return this.translateText(response, targetLanguage, sourceLanguage);
  }
}

export default TranslationService;
export { TranslationService };