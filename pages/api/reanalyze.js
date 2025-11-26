// pages/api/reanalyze.js - Updated with Firestore (no Redis)
import { DocumentProcessor } from '../../lib/documentProcessor';
import TranslationService from '../../lib/translationService';
import { adminDb } from '../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentId, newLanguage, documentData, userId } = req.body;

    if (!documentId || !newLanguage || !documentData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check Firestore cache if user is authenticated
    if (userId && adminDb) {
      try {
        const cacheRef = adminDb
          .collection('translation_cache')
          .doc(documentId)
          .collection('languages')
          .doc(newLanguage);
        
        const cacheDoc = await cacheRef.get();
        
        if (cacheDoc.exists) {
          console.log(`✅ Firestore cache HIT: ${documentId} -> ${newLanguage}`);
          
          return res.status(200).json({
            success: true,
            data: {
              ...cacheDoc.data().data,
              id: documentId,
              fromCache: true
            }
          });
        }
      } catch (cacheError) {
        console.warn('Cache check failed:', cacheError.message);
      }
    }

    console.log(`❌ Cache MISS, translating to ${newLanguage}...`);

    const translationService = new TranslationService();
    const translatedData = await translationService.translateDocument(
      documentData,
      newLanguage
    );

    // Cache in Firestore if user is authenticated
    if (userId && adminDb) {
      try {
        const cacheRef = adminDb
          .collection('translation_cache')
          .doc(documentId)
          .collection('languages')
          .doc(newLanguage);
        
        await cacheRef.set({
          data: translatedData,
          cachedAt: new Date(),
          language: newLanguage
        });
        
        console.log(`✅ Translation cached in Firestore`);
      } catch (cacheError) {
        console.warn('Failed to cache translation:', cacheError.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...translatedData,
        id: documentId,
        fromCache: false
      }
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Failed to translate document',
      details: error.message
    });
  }
}