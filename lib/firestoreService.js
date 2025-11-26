// lib/firestoreService.js - Firestore Database Operations
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  serverTimestamp,
  deleteDoc // ADDED
} from 'firebase/firestore';

class FirestoreService {
  // ==================
  // USER MANAGEMENT
  // ==================
  
  async createUserProfile(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ User profile created:', userId);
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateLastActive(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        lastActive: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last active:', error);
    }
  }

  // ==================
  // DOCUMENT MANAGEMENT
  // ==================

  async saveDocument(userId, documentData) {
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'documents'), {
        ...documentData,
        userId: userId,
        uploadedAt: serverTimestamp()
      });
      
      console.log('✅ Document saved:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  async getUserDocuments(userId, limit = 20) {
    try {
      const docsRef = collection(db, 'users', userId, 'documents');
      const q = query(docsRef, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`📄 Retrieved ${documents.length} documents for user ${userId}`);
      return documents;
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }

  async getDocument(userId, documentId) {
    try {
      const docRef = doc(db, 'users', userId, 'documents', documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }
  
  // ADDED: Delete document method
  async deleteDocument(userId, documentId) {
    try {
      const docRef = doc(db, 'users', userId, 'documents', documentId);
      await deleteDoc(docRef);
      
      console.log('✅ Document deleted:', documentId);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // ==================
  // TRANSLATION CACHE
  // ==================

  async cacheTranslation(documentId, language, translatedData) {
    try {
      const cacheRef = doc(db, 'translation_cache', documentId, 'languages', language);
      await setDoc(cacheRef, {
        data: translatedData,
        cachedAt: serverTimestamp(),
        language: language
      });
      
      console.log(`✅ Translation cached: ${documentId} -> ${language}`);
      return true;
    } catch (error) {
      console.error('Error caching translation:', error);
      return false;
    }
  }

  async getTranslation(documentId, language) {
    try {
      const cacheRef = doc(db, 'translation_cache', documentId, 'languages', language);
      const cacheSnap = await getDoc(cacheRef);
      
      if (cacheSnap.exists()) {
        console.log(`✅ Cache HIT: ${documentId} -> ${language}`);
        return cacheSnap.data().data;
      }
      
      console.log(`❌ Cache MISS: ${documentId} -> ${language}`);
      return null;
    } catch (error) {
      console.error('Error getting translation:', error);
      return null;
    }
  }

  async getAvailableTranslations(documentId) {
    try {
      const languagesRef = collection(db, 'translation_cache', documentId, 'languages');
      const querySnapshot = await getDocs(languagesRef);
      
      const languages = [];
      querySnapshot.forEach((doc) => {
        languages.push(doc.id);
      });
      
      return languages;
    } catch (error) {
      console.error('Error getting available translations:', error);
      return [];
    }
  }

  // ==================
  // ANALYTICS
  // ==================

  async incrementDocumentCount(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      const currentCount = userSnap.exists() ? (userSnap.data().documentCount || 0) : 0;
      
      await setDoc(userRef, {
        documentCount: currentCount + 1,
        lastActive: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error incrementing document count:', error);
    }
  }
}

export default FirestoreService;
export const firestoreService = new FirestoreService();