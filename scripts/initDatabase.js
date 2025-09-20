// scripts/initDatabase.js - Run this once to populate your Firebase database
import dotenv from 'dotenv';
dotenv.config();
import { ClauseDictionary } from "../lib/clauseDictionary.js";
import { adminDb } from "../lib/firebase-admin.js";

const clauseDict = new ClauseDictionary();

const sampleClauses = [
  {
    type: 'general',
    originalText: 'This agreement sets forth the general terms and conditions that apply to both parties.',
    plainLanguageExplanation: 'This clause covers the overall terms of the agreement. It applies to both sides and provides the basic rules everyone must follow.',
    riskScore: 2,
    riskCategory: 'medium',
    suggestedQuestions: [
      'What general obligations do I have under this agreement?',
      'Are there exceptions to these general terms?'
    ],
    keywords: ['agreement', 'terms', 'conditions', 'general']
  },
  {
    type: 'termination',
    originalText: 'Either party may terminate this agreement with thirty (30) days written notice.',
    plainLanguageExplanation: 'Both you and the other party can end this agreement by giving 30 days notice in writing.',
    riskScore: 2,
    riskCategory: 'low',
    suggestedQuestions: [
      'How do I give proper written notice?',
      'What happens after I give notice?'
    ],
    keywords: ['terminate', 'thirty days', 'written notice', 'either party']
  },
  {
    type: 'payment',
    originalText: 'Payment is due on the first day of each month. Late payments shall incur a fee of $50.',
    plainLanguageExplanation: 'You must pay by the 1st of each month. If you pay late, there is a $50 fee.',
    riskScore: 3,
    riskCategory: 'medium',
    suggestedQuestions: [
      'What if I pay a few days late?',
      'Can the late fee be waived?'
    ],
    keywords: ['payment', 'first day', 'late', 'fee', '$50']
  },
  {
    type: 'penalty',
    originalText: 'Breach of this agreement may result in immediate termination and forfeiture of all deposits.',
    plainLanguageExplanation: 'If you break the rules of this agreement, it can be ended immediately and you may lose any money you put down as a deposit.',
    riskScore: 5,
    riskCategory: 'high',
    suggestedQuestions: [
      'What counts as a breach?',
      'Can I get my deposit back if there is a breach?'
    ],
    keywords: ['breach', 'immediate termination', 'forfeiture', 'deposits']
  },
  {
    type: 'renewal',
    originalText: 'This agreement shall automatically renew for successive one-year terms unless terminated.',
    plainLanguageExplanation: 'This agreement will automatically continue for another year unless you or the other party ends it.',
    riskScore: 3,
    riskCategory: 'medium',
    suggestedQuestions: [
      'How do I prevent automatic renewal?',
      'When do I need to give notice to avoid renewal?'
    ],
    keywords: ['automatically renew', 'successive', 'one-year terms', 'unless terminated']
  },
  {
    type: 'liability',
    originalText: 'Tenant shall be liable for all damages to the property beyond normal wear and tear.',
    plainLanguageExplanation: 'You are responsible for paying for any damage you cause to the property, except for normal aging and use.',
    riskScore: 4,
    riskCategory: 'high',
    suggestedQuestions: [
      'What counts as normal wear and tear?',
      'How are damages calculated?'
    ],
    keywords: ['liable', 'damages', 'property', 'normal wear and tear']
  }
];

async function initializeDatabase() {
  console.log('Initializing clause dictionary with sample data...');

  try {
    for (const clause of sampleClauses) {
      // Check if clause already exists (by type + originalText)
      const existingSnapshot = await adminDb
        .collection('clauseDictionary')
        .where('type', '==', clause.type)
        .where('originalText', '==', clause.originalText)
        .get();

      if (!existingSnapshot.empty) {
        console.log(`Skipped ${clause.type} clause (already exists).`);
        continue;
      }

      const id = await clauseDict.addClause(clause);
      if (id) {
        console.log(`Added ${clause.type} clause with ID: ${id}`);
      } else {
        console.log(`Failed to add ${clause.type} clause`);
      }
    }

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initializeDatabase();
