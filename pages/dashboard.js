import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { firestoreService } from '../lib/firestoreService';
import { saveFileToLocal, getFileFromLocal } from '../lib/localFileStore';

import UserProfile from '../components/UserProfile';
import DocumentSummary from '../components/DocumentSummary';
import ChatInterface from '../components/ChatInterface';
import KeyTermsExtracted, { extractDateTerms } from '../components/KeyTermsExtracted';
import LanguageSelector from '../components/LanguageSelector';
import UploadPage from '../components/UploadPage';
import ProcessingPage from '../components/ProcessingPage';
import ImportantClauseList from '../components/ImportantClauseList';
import TextToSpeechButton from '../components/TextToSpeechButton';
import PDFViewer from '../components/PDFViewer';

import { Loader, Upload, History, Gavel, FileText, ArrowLeft, Eye, EyeOff, PlusCircle } from 'lucide-react';

const VIEW_STATES = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULTS: 'results',
};

const STORAGE_KEYS = {
  DOCUMENT_ID: 'currentDocId',
  LANGUAGE: 'selectedLanguage',
};

const dateTranslations = {
  en: { importantDateType: 'Important Date', startDateType: 'Start Date', endDateType: 'End Date', dueDateType: 'Due Date', updateDateType: 'Update Date' },
  de: { importantDateType: 'Wichtige Daten', startDateType: 'Anfangsdatum', endDateType: 'Enddatum', dueDateType: 'Fälligkeitsdatum', updateDateType: 'Aktualisierungsdatum' },
  es: { importantDateType: 'Fecha Importante', startDateType: 'Fecha de Inicio', endDateType: 'Fecha de Fin', dueDateType: 'Fecha de Vencimiento', updateDateType: 'Fecha de Actualización' },
  fr: { importantDateType: 'Date Importante', startDateType: 'Date de Début', endDateType: 'Date de Fin', dueDateType: 'Date d\'échéance', updateDateType: 'Date de Mise à Jour' },
  hi: { importantDateType: 'महत्वपूर्ण तिथि', startDateType: 'प्रारंभ तिथि', endDateType: 'समाप्ति तिथि', dueDateType: 'नियत तिथि', updateDateType: 'अद्यतन तिथि' }
};

const getAggregatedTextToRead = (documentData, dateTerms) => {
    if (!documentData || !documentData.summary) return '';
    let summaryText = documentData.summary;
    const sections = summaryText.split(/\n##\s+/);
    let aggregatedText = '';
  
    sections.slice(1).forEach((section) => {
      const lines = section.split('\n');
      const heading = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      if (heading) aggregatedText += `${heading}. `;
      if (content) {
        let cleanContent = content
          .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/\*/g, '')
          .replace(/^\s*[-*•]\s+/gm, '').replace(/^\s*\d+\.\s+/gm, '')
          .replace(/\*\*([^*:]+):\*\*/g, '$1,').replace(/([^:]+):/g, '$1,')
          .replace(/\n+/g, '. ').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();
        aggregatedText += cleanContent + '. ';
      }
    });
  
    if (documentData.clauses && documentData.clauses.length > 0) {
      aggregatedText += 'Important clauses include the following. ';
      documentData.clauses.slice(0, 4).forEach((clause) => {
        let explanation = clause.explanation.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s*/g, '').trim();
        if (explanation.length > 20) aggregatedText += `${clause.type}. ${explanation}. `;
      });
    }
    return aggregatedText.replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').replace(/\.\s*,/g, ',').replace(/,\s*\./g, '.').trim();
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { docId, returnTo } = router.query; 

  const [documentData, setDocumentData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [viewState, setViewState] = useState(null);
  const [languageDetection, setLanguageDetection] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [translationCache, setTranslationCache] = useState({});
  const [availableLanguages, setAvailableLanguages] = useState(['en']);
  const [loadingFromHistory, setLoadingFromHistory] = useState(false);

  // Processing States 
  const [processingProgress, setProcessingProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processingProfile, setProcessingProfile] = useState({});

  // PDF Preview States
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // REFS
  const isLoadingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const abortControllerRef = useRef(null); // NEW: To handle cancellation

  const navTranslations = {
    en: { new: 'Analyze New', legal: 'Get Legal Advice', history: 'History' },
    hi: { new: 'नया विश्लेषण', legal: 'कानूनी सलाह', history: 'इतिहास' },
    mr: { new: 'नवीन विश्लेषण', legal: 'कायदेशीर सल्ला', history: 'इतिहास' },
    // ... add others as needed, keeping en default for safety
  };
  
  const tNav = navTranslations[selectedLanguage] || navTranslations.en;

  const keyDateTerms = documentData?.originalText
    ? extractDateTerms(documentData.originalText, selectedLanguage, dateTranslations)
    : [];

  const textToRead = getAggregatedTextToRead(documentData, keyDateTerms);

  // Auth & Init Effects
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) firestoreService.updateLastActive(user.uid);
  }, [user]);

  useEffect(() => {
    if (user && !authLoading && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      initializeDashboard();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && !authLoading && hasInitializedRef.current && docId && !isLoadingRef.current) {
      if (!documentData || documentData.firestoreDocId !== docId) {
        const persistedLanguage = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en' : 'en';
        loadDocumentFromHistory(docId, persistedLanguage);
      }
    }
  }, [docId, user, authLoading]);

  const initializeDashboard = async () => {
    const persistedDocId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.DOCUMENT_ID) : null;
    const persistedLanguage = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en' : 'en';
    const targetDocId = docId || persistedDocId;

    if (targetDocId) {
      await loadDocumentFromHistory(targetDocId, persistedLanguage);
      if (persistedDocId && !docId) router.push(`/dashboard?docId=${persistedDocId}`, undefined, { shallow: true });
    } else {
      setViewState(VIEW_STATES.UPLOAD);
    }
  };

  useEffect(() => {
    let interval;
    if (viewState === VIEW_STATES.PROCESSING && processingProgress < 95) {
      interval = setInterval(() => {
        setProcessingProgress(prev => {
          const increment = Math.random() * 5 + 1;
          return Math.min(95, prev + increment);
        });
      }, 800);
    } else if (viewState !== VIEW_STATES.PROCESSING) {
      clearInterval(interval);
      setProcessingProgress(0);
    }
    return () => clearInterval(interval);
  }, [viewState, processingProgress]);

  // NEW: Cancel Processing Handler
  const handleCancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Cancel the fetch request
      abortControllerRef.current = null;
    }
    
    // Reset States
    setViewState(VIEW_STATES.UPLOAD);
    setProcessingProgress(0);
    setUploadedFile(null);
    setPdfUrl(null);
  };

  const loadDocumentFromHistory = async (firestoreDocId, targetLanguage = 'en') => {
    if (!firestoreDocId || !user || isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoadingFromHistory(true);

    try {
      const doc = await firestoreService.getDocument(user.uid, firestoreDocId);
      if (doc && doc.fullData) {
        const loadedData = {
            id: doc.documentId,
            fileName: doc.fileName,
            fileType: doc.fileType,
            summary: doc.fullData.summary || doc.summary,
            clauses: doc.fullData.clauses || [],
            smartQuestions: doc.fullData.smartQuestions || [],
            originalText: doc.fullData.originalText || '',
            firestoreDocId: firestoreDocId
          };
  
          const localBlob = await getFileFromLocal(doc.documentId);
          if (localBlob) {
            const url = URL.createObjectURL(localBlob);
            setPdfUrl(url);
          } else {
            setPdfUrl(null);
          }

          const detectedLang = doc.detectedLanguage || 'en';
          setLanguageDetection({ detected: detectedLang, confidence: doc.languageConfidence || 0 });
  
          let finalDocData = loadedData;
          if (targetLanguage !== detectedLang) {
            const cachedTranslation = await firestoreService.getTranslation(doc.documentId, targetLanguage);
            if (cachedTranslation) finalDocData = cachedTranslation;
            else targetLanguage = detectedLang;
          }
  
          setDocumentData(finalDocData);
          setSelectedLanguage(targetLanguage);
          setTranslationCache({
            [targetLanguage]: { data: finalDocData, cachedAt: new Date().toISOString(), isOriginal: targetLanguage === detectedLang }
          });
  
          const translations = await firestoreService.getAvailableTranslations(doc.documentId);
          setAvailableLanguages([detectedLang, ...translations].filter((v, i, a) => a.indexOf(v) === i));
  
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.DOCUMENT_ID, doc.documentId);
            localStorage.setItem(STORAGE_KEYS.LANGUAGE, targetLanguage);
          }
          setViewState(VIEW_STATES.RESULTS);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.DOCUMENT_ID);
          localStorage.removeItem(STORAGE_KEYS.LANGUAGE);
        }
        router.push('/dashboard', undefined, { shallow: true });
        setViewState(VIEW_STATES.UPLOAD);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setViewState(VIEW_STATES.UPLOAD);
    } finally {
      setLoadingFromHistory(false);
      isLoadingRef.current = false;
    }
  };

  const handleProcessingStart = async (file, profile) => {
    setViewState(VIEW_STATES.PROCESSING);
    setUploadedFile(file);
    setProcessingProfile(profile);
    setProcessingProgress(10);

    const url = URL.createObjectURL(file);
    setPdfUrl(url);

    // Create new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const formData = new FormData();
      formData.append('document', file);
      
      if (profile?.persona) {
        formData.append('persona', profile.persona);
      }

      // PASS SIGNAL TO FETCH
      const response = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData,
        signal: controller.signal // <--- Connect cancellation signal
      });
      
      const result = await response.json();

      if (result.success) {
        if (result.data?.id) {
            await saveFileToLocal(result.data.id, file);
        }

        setProcessingProgress(100);
        setTimeout(() => handleDocumentProcessed(result.data, result.languageDetection), 500);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Upload cancelled by user');
        // Do nothing, state is reset by handleCancelProcessing
      } else {
        alert(err.message || 'Failed to process document. Please try again.');
        setViewState(VIEW_STATES.UPLOAD);
      }
    }
  };

  const handleDocumentProcessed = async (data, detectionInfo = null) => {
    setDocumentData(data);
    if (detectionInfo && data) {
      setLanguageDetection(detectionInfo);
      const detectedLang = detectionInfo.detected || 'en';
      const documentId = data.id || `doc_${Date.now()}`;

      let savedDocId = null;
      if (user) {
        try {
          savedDocId = await firestoreService.saveDocument(user.uid, {
            documentId: documentId,
            fileName: data.fileName || 'Untitled Document',
            fileType: data.fileType || 'application/pdf',
            summary: data.summary || '',
            detectedLanguage: detectedLang,
            languageConfidence: detectionInfo.confidence || 0,
            clauseCount: data.clauses?.length || 0,
            fullData: { summary: data.summary, clauses: data.clauses, smartQuestions: data.smartQuestions, originalText: data.originalText }
          });
          setDocumentData(prev => ({ ...prev, id: documentId, firestoreDocId: savedDocId }));
          await firestoreService.incrementDocumentCount(user.uid);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.DOCUMENT_ID, documentId);
            localStorage.setItem(STORAGE_KEYS.LANGUAGE, detectedLang);
          }
          router.push(`/dashboard?docId=${savedDocId}`, undefined, { shallow: true });
        } catch (error) {
          console.error("Firestore save error:", error);
        }
      }
      setTranslationCache({ [detectedLang]: { data: data, cachedAt: new Date().toISOString(), isOriginal: true } });
      setAvailableLanguages([detectedLang]);
      setSelectedLanguage(detectedLang);
    }
    setViewState(VIEW_STATES.RESULTS);
  };

  const handleLanguageChange = async (newLanguage) => {
    if (!documentData) { setSelectedLanguage(newLanguage); return; }
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);

    const cachedTranslation = await firestoreService.getTranslation(documentData.id, newLanguage);
    if (cachedTranslation) { setSelectedLanguage(newLanguage); setDocumentData(cachedTranslation); return; }
    if (translationCache[newLanguage]) { setSelectedLanguage(newLanguage); setDocumentData(translationCache[newLanguage].data); return; }
    await regenerateInNewLanguage(newLanguage);
  };

  const regenerateInNewLanguage = async (targetLanguage) => {
    if (!documentData) return;
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/reanalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: documentData.id, newLanguage: targetLanguage, documentData: documentData, userId: user.uid })
      });
      const result = await response.json();
      if (result.success) {
        setSelectedLanguage(targetLanguage);
        await firestoreService.cacheTranslation(documentData.id, targetLanguage, result.data);
        setTranslationCache(prev => ({ ...prev, [targetLanguage]: { data: result.data, cachedAt: new Date().toISOString() } }));
        if (!availableLanguages.includes(targetLanguage)) setAvailableLanguages(prev => [...prev, targetLanguage]);
        setDocumentData(result.data);
      }
    } catch (error) {
      alert('Failed to translate document.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleNewDocument = () => {
    if (typeof window !== 'undefined') { localStorage.removeItem(STORAGE_KEYS.DOCUMENT_ID); localStorage.removeItem(STORAGE_KEYS.LANGUAGE); }
    setDocumentData(null); setLanguageDetection(null); setTranslationCache({}); setAvailableLanguages(['en']); setSelectedLanguage('en');
    setPdfUrl(null);
    setShowPdf(false);
    setViewState(VIEW_STATES.UPLOAD);
    router.push('/dashboard', undefined, { shallow: true });
  };

  const handleBackNavigation = () => {
    if (returnTo === 'history') router.push('/history');
    else if (returnTo === 'subscription') router.push('/subscription');
    else router.push('/history');
  };

  if (authLoading || loadingFromHistory || (viewState === null && user)) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 text-[#4285F4] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">
            {loadingFromHistory ? 'Loading document...' : 'Initializing...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex flex-col h-screen overflow-hidden">
      <Head>
        <title>Legal Document Demystifier</title>
      </Head>

      {/* TOP NAVIGATION */}
      <div className="flex-shrink-0 z-30 flex justify-between items-center px-8 py-3 bg-[#1F1F1F] border-b border-gray-800">
        <div className="flex items-center space-x-3">
            <div className="bg-white p-1.5 rounded-md">
                <FileText className="h-5 w-5 text-[#4285F4]" />
            </div>
            <h1 onClick={() => handleNewDocument()} className="text-xl font-extrabold text-white tracking-tight cursor-pointer">
                Legal Document Demystifier
            </h1>
        </div>

        <div className="flex items-center space-x-3">
          
          {/* ANALYZE NEW DOCUMENT BUTTON - HIDDEN IF PROCESSING */}
          {viewState !== VIEW_STATES.PROCESSING && (
            <button 
                onClick={handleNewDocument}
                className="hidden md:flex items-center space-x-1 px-3 py-2 border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-bold"
            >
                <PlusCircle className="h-4 w-4" />
                <span>{tNav.new}</span>
            </button>
          )}

          <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              showDetectedLanguage={languageDetection?.detected}
              availableLanguages={availableLanguages}
              isTranslating={isRegenerating}
          />

          <Link href={`/subscription`} passHref>
            <button className="flex items-center space-x-1 px-3 py-2 border border-[#EA4335] rounded-lg bg-[#EA4335] hover:bg-[#D93025] transition-colors text-white font-bold text-sm">
                <Gavel className="h-4 w-4" />
                <span>{tNav.legal}</span>
            </button>
          </Link>
          
          <Link href={'/history'} passHref>
            <button className="flex items-center space-x-1 px-3 py-2 border border-gray-600 rounded-lg bg-transparent hover:bg-gray-800 transition-colors text-white text-sm font-medium">
              <History className="h-4 w-4" />
              <span>{tNav.history}</span>
            </button>
          </Link>

          <UserProfile />
        </div>
      </div>

      {/* SPLIT SCREEN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: PDF VIEWER */}
        {viewState === VIEW_STATES.RESULTS && (
            <div 
                className={`transition-all duration-300 ease-in-out border-r border-gray-800 relative bg-[#121212] ${
                    showPdf ? 'w-full md:w-1/2 lg:w-5/12' : 'w-0 border-none'
                }`}
            >
                <div className="h-full w-full overflow-hidden">
                    <PDFViewer file={pdfUrl} onClose={() => setShowPdf(false)} />
                </div>
            </div>
        )}

        {/* RIGHT PANEL: CONTENT */}
        <div className="flex-1 overflow-y-auto bg-[#1F1F1F] scrollbar-thin scrollbar-thumb-gray-700">
            <main className="w-full max-w-7xl mx-auto px-6 py-8">
            
                {viewState === VIEW_STATES.UPLOAD && (
                <UploadPage 
                    onProcessingStart={handleProcessingStart} 
                    language={selectedLanguage}
                />
                )}

                {viewState === VIEW_STATES.PROCESSING && (
                <ProcessingPage
                    fileName={uploadedFile?.name || 'Your Document'}
                    progress={processingProgress}
                    // Pass the cancel handler here
                    onCancel={handleCancelProcessing} 
                    language={selectedLanguage}
                />
                )}

                {viewState === VIEW_STATES.RESULTS && documentData && (
                <div className="space-y-8">
                    
                    {/* RESULT TOOLBAR */}
                    <div className="flex justify-between items-center bg-[#171717] rounded-lg p-4 border border-gray-800 shadow-md sticky top-0 z-20 backdrop-blur-md bg-opacity-95">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            {docId && returnTo && (
                                <button onClick={handleBackNavigation} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800" title="Back">
                                <ArrowLeft className="h-5 w-5" />
                                </button>
                            )}
                            <h2 className="text-lg font-bold text-white truncate max-w-[200px]" title={documentData.fileName}>
                                {documentData.fileName || "Document Analysis"}
                            </h2>
                        </div>
                        
                        <div className="flex space-x-3 items-center">
                            {/* PDF View Button */}
                            {pdfUrl && (
                                <button 
                                    onClick={() => setShowPdf(!showPdf)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors font-medium text-sm whitespace-nowrap
                                        ${showPdf 
                                            ? 'bg-blue-900/30 border-blue-500 text-blue-300' 
                                            : 'bg-[#252525] border-gray-600 text-gray-300 hover:bg-[#333333]'
                                        }`}
                                >
                                    {showPdf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span className="hidden sm:inline">{showPdf ? 'Hide PDF' : 'View PDF'}</span>
                                </button>
                            )}

                            <TextToSpeechButton
                                textToRead={textToRead}
                                selectedLanguage={selectedLanguage}
                                isTranslating={isRegenerating}
                            />
                        </div>
                    </div>
                    
                    <DocumentSummary documentData={documentData} language={selectedLanguage} />
                    <ChatInterface documentData={documentData} language={selectedLanguage} />
                    <ImportantClauseList 
                        clauses={documentData.clauses} 
                        language={selectedLanguage}
                        onClauseClick={(text) => {
                            if(pdfUrl) {
                                setShowPdf(true);
                            }
                        }}
                    />
                    <KeyTermsExtracted documentData={documentData} language={selectedLanguage} />

                    <div className="text-center pt-8 border-t border-gray-800">
                        <button onClick={handleNewDocument} className="bg-[#4285F4] text-white px-6 py-3 rounded-lg hover:bg-[#3367D6] transition-colors flex items-center justify-center mx-auto font-bold shadow-md">
                            <Upload className="h-4 w-4 mr-2" />
                            Process New Document
                        </button>
                    </div>
                </div>
                )}

                {isRegenerating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center bg-[#171717] p-8 rounded-xl border border-gray-800 shadow-2xl">
                    <Loader className="h-12 w-12 text-[#4285F4] animate-spin mx-auto" />
                    <p className="mt-4 text-gray-300 font-medium">Translating document...</p>
                    </div>
                </div>
                )}
            </main>
        </div>
      </div>
    </div>
  );
}