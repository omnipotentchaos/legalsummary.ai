// lib/clauseDictionary.js - Enhanced with context-aware explanations
import dotenv from 'dotenv';
dotenv.config();

class ClauseDictionary {
  constructor() {
    this.collectionName = "clauseDictionary";
    this.adminDb = null;
    this.admin = null;
    
    this.initializeFirebase();
    
    // Enhanced fallback dictionary with context-aware logic
    // UPDATE the clauseDictionary.js fallback dictionary with better loan-specific entries

// Inside ClauseDictionary constructor, REPLACE the fallbackDictionary with this:
// UPDATE the clauseDictionary.js fallback dictionary with better loan-specific entries

// Inside ClauseDictionary constructor, REPLACE the fallbackDictionary with this:
this.fallbackDictionary = {
  'general': {
    plainLanguageExplanation: 'This clause establishes the general framework and foundational terms of the agreement that both parties must follow.',
    suggestedQuestions: [
      'What are my general obligations under this agreement?',
      'Are there any exceptions to these general terms?'
    ],
    keywords: ['agreement', 'contract', 'terms', 'conditions', 'general', 'hereby', 'parties', 'document']
  },
  'termination': {
    plainLanguageExplanation: 'This clause specifies how the agreement can be terminated.',
    suggestedQuestions: [
      'How much notice do I need to give to terminate?',
      'What happens if I don\'t give proper notice?'
    ],
    keywords: ['terminate', 'end', 'cancel', 'expire', 'cessation', 'conclusion']
  },
  'payment': {
    plainLanguageExplanation: 'This clause outlines when and how payments must be made, including amounts, due dates, and any late fees.',
    suggestedQuestions: [
      'When exactly is payment due?',
      'How much is the late fee if I pay late?'
    ],
    keywords: ['payment', 'pay', 'rent', 'fee', '$', 'due', 'owe', 'monthly', 'installment']
  },
  'penalty': {
    plainLanguageExplanation: 'This clause describes serious consequences for not following the agreement, including potential financial penalties or legal action.',
    suggestedQuestions: [
      'What specific actions trigger these penalties?',
      'How much will I owe if I violate this clause?'
    ],
    keywords: ['penalty', 'breach', 'fine', 'violation', 'default', 'forfeit', 'damages']
  },
  'renewal': {
    plainLanguageExplanation: 'This clause explains how the agreement continues or renews, often automatically unless proper notice is given.',
    suggestedQuestions: [
      'How do I prevent automatic renewal?',
      'When do I need to give notice to avoid renewal?'
    ],
    keywords: ['automatically', 'renewal', 'renew', 'successive', 'month-to-month', 'extend', 'continue']
  },
  'liability': {
    plainLanguageExplanation: 'This clause defines who is responsible for damages, losses, or injuries that may occur.',
    suggestedQuestions: [
      'What am I responsible for paying if something goes wrong?',
      'Are there any limits on my liability?'
    ],
    keywords: ['liable', 'responsible', 'damages', 'injury', 'loss', 'indemnify', 'repair']
  },
  'confidentiality': {
    plainLanguageExplanation: 'This clause requires keeping certain information private and not sharing it with others.',
    suggestedQuestions: [
      'What information must I keep confidential?',
      'How long does this confidentiality requirement last?'
    ],
    keywords: ['confidential', 'private', 'secret', 'disclosure', 'proprietary', 'non-disclosure']
  },
  'warranty': {
    plainLanguageExplanation: 'This clause provides guarantees about performance, quality, or condition.',
    suggestedQuestions: [
      'What exactly is guaranteed under this warranty?',
      'How long does the warranty last?'
    ],
    keywords: ['warrant', 'guarantee', 'assure', 'promise', 'represent', 'covenant']
  },
  'collateral': {
    plainLanguageExplanation: 'This clause describes assets or property that secure the loan and can be taken if you fail to repay.',
    suggestedQuestions: [
      'What exactly am I putting up as collateral?',
      'Under what circumstances can the lender take my collateral?'
    ],
    keywords: ['collateral', 'security', 'pledge', 'secure', 'shares', 'stock', 'asset', 'guarantee', 'release']
  },
  'interest': {
    plainLanguageExplanation: 'This clause specifies the interest rate charged on the loan and how it is calculated.',
    suggestedQuestions: [
      'What is the exact interest rate I\'m paying?',
      'How is the interest calculated?'
    ],
    keywords: ['interest', 'rate', 'annual', 'APR', 'percentage', 'accrue', 'compound']
  },
  'default': {
    plainLanguageExplanation: 'This clause defines what happens if you fail to meet your obligations, such as missing payments.',
    suggestedQuestions: [
      'What counts as being in default?',
      'What are the consequences if I default?'
    ],
    keywords: ['default', 'failure', 'missed payment', 'acceleration', 'demand', 'breach']
  }
};
  }

  initializeFirebase() {
    try {
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

  async getClauseExplanation(clauseType, clauseText) {
    try {
      // Try Firebase first if available
      if (this.adminDb) {
        const querySnapshot = await this.adminDb
          .collection(this.collectionName)
          .where("type", "==", clauseType)
          .get();
          
        if (!querySnapshot.empty) {
          const clauseLower = clauseText.toLowerCase();
          for (const doc of querySnapshot.docs) {
            const data = doc.data();
            if (data.keywords && data.keywords.some(keyword => 
              clauseLower.includes(keyword.toLowerCase())
            )) {
              console.log(`Firebase dictionary match found for ${clauseType}`);
              return { id: doc.id, ...data };
            }
          }
        }
      }

      // Use enhanced fallback with context-aware explanations
      if (this.fallbackDictionary[clauseType]) {
        const clauseLower = clauseText.toLowerCase();
        const dictEntry = this.fallbackDictionary[clauseType];
        
        const matchedKeywords = dictEntry.keywords.filter(keyword => 
          clauseLower.includes(keyword.toLowerCase())
        );
        
        if (matchedKeywords.length >= 1) {
          console.log(`Fallback dictionary match for ${clauseType} with keywords: ${matchedKeywords.join(', ')}`);
          
          // Generate context-aware explanation
          const contextExplanation = typeof dictEntry.getExplanation === 'function'
            ? dictEntry.getExplanation(clauseText)
            : dictEntry.plainLanguageExplanation || 'This clause requires review.';
          
          return {
            plainLanguageExplanation: contextExplanation,
            suggestedQuestions: dictEntry.suggestedQuestions,
            keywords: dictEntry.keywords,
            fromFallback: true
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting clause explanation:", error);
      
      if (this.fallbackDictionary[clauseType]) {
        const dictEntry = this.fallbackDictionary[clauseType];
        const contextExplanation = typeof dictEntry.getExplanation === 'function'
          ? dictEntry.getExplanation(clauseText)
          : dictEntry.plainLanguageExplanation || 'This clause requires review.';
          
        return {
          plainLanguageExplanation: contextExplanation,
          suggestedQuestions: dictEntry.suggestedQuestions,
          fromFallback: true
        };
      }
      
      return null;
    }
  }

  // Rest of the methods remain the same
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

  async getClauseAnalytics() {
    try {
      if (!this.adminDb) {
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

export default ClauseDictionary;
export { ClauseDictionary };