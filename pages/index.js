import { useState, useEffect } from 'react';
import Head from 'next/head';
import DocumentUpload from '../components/DocumentUpload';
import DocumentSummary from '../components/DocumentSummary';
import ChatInterface from '../components/ChatInterface';
import ClauseDictionary from '../components/ClauseDictionary';
import LanguageSelector from '../components/LanguageSelector';
import { Globe, CheckCircle, AlertCircle } from 'lucide-react';

export default function Home() {
  const [documentData, setDocumentData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [languageDetection, setLanguageDetection] = useState(null);
  const [showLanguagePrompt, setShowLanguagePrompt] = useState(false);

  const handleDocumentProcessed = (data, detectionInfo = null) => {
    setDocumentData(data);
    setIsProcessing(false);
    
    // Handle language detection
    if (detectionInfo && data) {
  setLanguageDetection(detectionInfo);

  // Only proceed if a different language is detected.
  if (detectionInfo.detected !== selectedLanguage) {
    // Auto-switch if confidence is very high (e.g., > 90%).
    if (detectionInfo.confidence > 0.9) {
      setSelectedLanguage(detectionInfo.detected);
    } 
    // Otherwise, prompt the user if confidence is moderately high (e.g., > 70%).
    else if (detectionInfo.confidence > 0.7) {
      setShowLanguagePrompt(true);
    }
  }
}
  };

  const handleUploadStart = () => {
    setIsProcessing(true);
    setDocumentData(null);
    setLanguageDetection(null);
    setShowLanguagePrompt(false);
  };

  const handleLanguageSwitch = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    setShowLanguagePrompt(false);
  };

  const dismissLanguagePrompt = () => {
    setShowLanguagePrompt(false);
  };

  const getLanguageName = (code) => {
    const names = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'hi': 'Hindi'
    };
    return names[code] || 'English';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Head>
        <title>Legal Document Demystifier</title>
        <meta name="description" content="Simplify complex legal documents with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Legal Document Demystifier
              </h1>
              <p className="text-gray-300 mt-1">
                Understand your legal documents with AI-powered insights
              </p>
              
              {/* Language Detection Status */}
              {languageDetection && (
                <div className="mt-2 flex items-center text-sm text-gray-400">
                  <Globe className="h-4 w-4 mr-1" />
                  <span>
                    Detected: {getLanguageName(languageDetection.detected)} 
                    ({Math.round(languageDetection.confidence * 100)}% confidence)
                  </span>
                </div>
              )}
            </div>
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        </div>
      </header>

      {/* Language Detection Prompt */}
      {showLanguagePrompt && languageDetection && (
        <div className="bg-blue-900 border-b border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-blue-100 font-medium">
                    Document appears to be in {getLanguageName(languageDetection.detected)}
                  </p>
                  <p className="text-blue-200 text-sm">
                    Would you like to switch to {getLanguageName(languageDetection.detected)} for better analysis?
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleLanguageSwitch(languageDetection.detected)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Switch to {getLanguageName(languageDetection.detected)}
                </button>
                <button
                  onClick={dismissLanguagePrompt}
                  className="text-blue-200 hover:text-white px-3 py-2 text-sm transition-colors"
                >
                  Keep {getLanguageName(selectedLanguage)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {!documentData && (
          <div className="mb-8">
            <DocumentUpload 
              onDocumentProcessed={handleDocumentProcessed}
              onUploadStart={handleUploadStart}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-300">Processing your document...</p>
              {languageDetection && (
                <p className="mt-2 text-sm text-gray-400">
                  Detected language: {getLanguageName(languageDetection.detected)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {documentData && !isProcessing && (
          <div className="space-y-8">
            {/* Language Detection Info */}
            {languageDetection && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-blue-400 mr-3" />
                    <div>
                      <p className="text-gray-200 font-medium">
                        Language Analysis Complete
                      </p>
                      <p className="text-gray-400 text-sm">
                        Document language: {getLanguageName(languageDetection.detected)} 
                        ({Math.round(languageDetection.confidence * 100)}% confidence) • 
                        Analysis language: {getLanguageName(selectedLanguage)}
                      </p>
                    </div>
                  </div>
                  {languageDetection.confidence > 0.8 && (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
              </div>
            )}

            {/* Document Summary */}
            <DocumentSummary 
              documentData={documentData}
              language={selectedLanguage}
            />

            {/* Chat Interface */}
            <ChatInterface 
              documentData={documentData}
              language={selectedLanguage}
            />

            {/* Clause Dictionary Insights */}
            <ClauseDictionary 
              clauses={documentData.clauses}
              language={selectedLanguage}
            />

            {/* New Document Button */}
            <div className="text-center pt-8 border-t border-gray-700">
              <button
                onClick={() => {
                  setDocumentData(null);
                  setLanguageDetection(null);
                  setShowLanguagePrompt(false);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Process New Document
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>© 2025 Legal Document Demystifier. Built for educational purposes.</p>
            <p className="mt-2 text-sm">
              This tool provides general information only and should not replace professional legal advice.
            </p>
            {languageDetection && (
              <p className="mt-2 text-xs text-gray-500">
                Language detection powered by Google Cloud AI
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}