// lib/clauseDictionary.js - Fixed constructor error
import dotenv from 'dotenv';
dotenv.config();

class ClauseDictionary {
  constructor() {
    this.collectionName = "clauseDictionary";
    this.adminDb = null;
    this.admin = null;
    
    // Initialize Firebase Admin if available
    this.initializeFirebase();
    
    // Fallback in-memory dictionary
    this.fallbackDictionary = {
      'general': {
        plainLanguageExplanation: 'This clause covers the overall terms of the agreement. It applies to both sides and provides the basic rules everyone must follow.',
        suggestedQuestions: [
          'What general obligations do I have under this agreement?',
          'Are there exceptions to these general terms?'
        ],
        keywords: ['agreement', 'terms', 'conditions', 'general', 'hereby', 'parties']
      },
      'termination': {
        plainLanguageExplanation: 'This clause explains how and when the agreement can be ended by either party.',
        suggestedQuestions: [
          'How do I give proper written notice?',
          'What happens after I give notice?'
        ],
        keywords: ['terminate', 'thirty days', 'written notice', 'either party', 'end', 'cancel', 'expiration']
      },
      'payment': {
        plainLanguageExplanation: 'This clause outlines payment obligations, amounts, timing, and consequences for late payment.',
        suggestedQuestions: [
          'What if I pay a few days late?',
          'Can the late fee be waived?'
        ],
        keywords: ['payment', 'rent', 'late', 'fee', '$', 'pay', 'due', 'cost', 'monthly']
      },
      'penalty': {
        plainLanguageExplanation: 'This clause describes consequences for not following the agreement, including potential financial penalties.',
        suggestedQuestions: [
          'What counts as a breach?',
          'Can penalties be avoided?'
        ],
        keywords: ['penalty', 'breach', 'fine', 'violation', 'charge', 'dishonored', 'returned check']
      },
      'renewal': {
        plainLanguageExplanation: 'This clause explains how the agreement continues or renews, often automatically unless proper notice is given.',
        suggestedQuestions: [
          'How do I prevent automatic renewal?',
          'When do I need to give notice to avoid renewal?'
        ],
        keywords: ['automatically', 'renewal', 'successive', 'month-to-month', 'extend', 'continue']
      },
      'liability': {
        plainLanguageExplanation: 'This clause defines who is responsible for damages, losses, or injuries that may occur.',
        suggestedQuestions: [
          'What am I responsible for paying?',
          'How are damages calculated?'
        ],
        keywords: ['liable', 'damages', 'responsible', 'injury', 'loss', 'indemnify', 'repair']
      },
      'confidentiality': {
        plainLanguageExplanation: 'This clause requires keeping certain information private and not sharing it with others.',
        suggestedQuestions: [
          'What information must I keep private?',
          'How long does this confidentiality requirement last?'
        ],
        keywords: ['confidential', 'private', 'secret', 'disclosure', 'proprietary']
      },
      'warranty': {
        plainLanguageExplanation: 'This clause provides guarantees or promises about performance, quality, or other aspects of the agreement.',
        suggestedQuestions: [
          'What is guaranteed under this warranty?',
          'What happens if the warranty is broken?'
        ],
        keywords: ['warrant', 'guarantee', 'assure', 'promise', 'represent']
      }
    };
  }

  // Initialize Firebase Admin safely
  initializeFirebase() {
    try {
      // Use dynamic import to avoid issues with missing modules
      const firebaseAdmin = require('./firebase-admin.js');
      this.adminDb = firebaseAdmin.adminDb;
      this.admin = firebaseAdmin.admin;
      if (this.adminDb) {
        console.log('Firebase Admin initialized for ClauseDictionary');
      }
    } catch (error) {
      console.warn('Firebase Admin not available for ClauseDictionary, using fallback only');
      this.adminDb = null;
      this.admin = null;
    }
  }

  // Get clause explanation from dictionary
  async getClauseExplanation(clauseType, clauseText) {
    try {
      // Try Firebase first if available
      if (this.adminDb) {
        const querySnapshot = await this.adminDb
          .collection(this.collectionName)
          .where("type", "==", clauseType)
          .get();
          
        if (!querySnapshot.empty) {
          // Match based on type and keywords instead of full text
          const clauseLower = clauseText.toLowerCase();
          for (const doc of querySnapshot.docs) {
            const data = doc.data();
            // Check if keywords match
            if (data.keywords && data.keywords.some(keyword => 
              clauseLower.includes(keyword.toLowerCase())
            )) {
              console.log(`Firebase dictionary match found for ${clauseType} using keywords`);
              return { id: doc.id, ...data };
            }
          }
        }
      }

      // Fallback to in-memory dictionary
      if (this.fallbackDictionary[clauseType]) {
        const clauseLower = clauseText.toLowerCase();
        const dictEntry = this.fallbackDictionary[clauseType];
        
        // Check if any keywords match with higher threshold
        const matchedKeywords = dictEntry.keywords.filter(keyword => 
          clauseLower.includes(keyword.toLowerCase())
        );
        
        if (matchedKeywords.length >= 1) { // At least 1 keyword match for fallback
          console.log(`Fallback dictionary match found for ${clauseType} with keywords: ${matchedKeywords.join(', ')}`);
          return {
            ...dictEntry,
            fromFallback: true
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting clause explanation:", error);
      
      // Last resort - return fallback if type exists
      if (this.fallbackDictionary[clauseType]) {
        return {
          ...this.fallbackDictionary[clauseType],
          fromFallback: true
        };
      }
      
      return null;
    }
  }

  // Add new clause
  async addClause(clauseData) {
    try {
      if (!this.adminDb) {
        console.warn("Firebase Admin DB not initialized, cannot add clause");
        return null;
      }

      const clauseEntry = {
        type: clauseData.type,
        originalText: clauseData.originalText,
        plainLanguageExplanation: clauseData.plainLanguageExplanation,
        riskScore: clauseData.riskScore,
        riskCategory: clauseData.riskCategory,
        suggestedQuestions: clauseData.suggestedQuestions || [],
        keywords: clauseData.keywords || [],
        createdAt: new Date(),
        lastUsed: new Date(),
        usageCount: 1,
        isVerified: false,
      };

      const docRef = await this.adminDb
        .collection(this.collectionName)
        .add(clauseEntry);

      return docRef.id;
    } catch (error) {
      console.error("Error adding clause:", error);
      return null;
    }
  }

  // Simple Jaccard similarity
  calculateSimilarity(text1, text2) {
    try {
      const words1 = new Set(text1.toLowerCase().split(/\s+/));
      const words2 = new Set(text2.toLowerCase().split(/\s+/));

      const intersection = new Set([...words1].filter((x) => words2.has(x)));
      const union = new Set([...words1, ...words2]);

      return union.size > 0 ? intersection.size / union.size : 0;
    } catch (error) {
      console.error("Error calculating similarity:", error);
      return 0;
    }
  }

  // Analytics
  async getClauseAnalytics() {
    try {
      if (!this.adminDb) {
        console.warn("Firebase Admin DB not initialized, returning fallback analytics");
        return {
          general: { count: 1, totalUsage: 0, avgRiskScore: 2 },
          termination: { count: 1, totalUsage: 0, avgRiskScore: 2 },
          payment: { count: 1, totalUsage: 0, avgRiskScore: 3 },
          penalty: { count: 1, totalUsage: 0, avgRiskScore: 4 },
          renewal: { count: 1, totalUsage: 0, avgRiskScore: 3 },
          liability: { count: 1, totalUsage: 0, avgRiskScore: 4 }
        };
      }

      const querySnapshot = await this.adminDb.collection(this.collectionName).get();

      if (querySnapshot.empty) {
        console.log("No clauses in database yet, returning empty analytics");
        return {};
      }

      const analytics = {};
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (!analytics[data.type]) {
          analytics[data.type] = {
            count: 0,
            totalUsage: 0,
            avgRiskScore: 0,
          };
        }
        analytics[data.type].count++;
        analytics[data.type].totalUsage += data.usageCount || 0;
        analytics[data.type].avgRiskScore += data.riskScore || 0;
      });

      Object.keys(analytics).forEach((type) => {
        analytics[type].avgRiskScore =
          analytics[type].avgRiskScore / analytics[type].count;
      });

      return analytics;
    } catch (error) {
      console.error("Error getting clause analytics:", error);
      return {};
    }
  }
}

// Export the class as default
export default ClauseDictionary;

// Also export as named export for backward compatibility
export { ClauseDictionary };