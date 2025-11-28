// pages/history.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../lib/authContext';
import { firestoreService } from '../lib/firestoreService';
import UserProfile from '../components/UserProfile';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';
import {
  Loader,
  FileText,
  Clock,
  Search,
  Filter,
  Globe,
  ArrowLeft,
  Trash2,
  Eye,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [currentDocId, setCurrentDocId] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [deleteDocData, setDeleteDocData] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  // Define a set of colors to cycle through for the cards
  const cardColors = [
    { border: '#4285F4', bg: 'bg-[#4285F4]/10', text: 'text-[#4285F4]' }, // Blue
    { border: '#34A853', bg: 'bg-[#34A853]/10', text: 'text-[#34A853]' }, // Green
    { border: '#A142F4', bg: 'bg-[#A142F4]/10', text: 'text-[#A142F4]' }, // Purple
    { border: '#FBBC05', bg: 'bg-[#FBBC05]/10', text: 'text-[#FBBC05]' }, // Yellow
    { border: '#EA4335', bg: 'bg-[#EA4335]/10', text: 'text-[#EA4335]' }  // Red
  ];

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      if (router.query.currentDoc) setCurrentDocId(router.query.currentDoc);
      loadDocuments();
    }
  }, [user, router.query]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await firestoreService.getUserDocuments(user.uid, 50);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = (firestoreDocId, fileName, documentId) => {
    if (!user) return;
    setDeleteDocData({ firestoreDocId, fileName, documentId });
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteDocData) return;
    const { firestoreDocId, fileName } = deleteDocData;
    try {
      setDeletingDocId(firestoreDocId);
      await firestoreService.deleteDocument(user.uid, firestoreDocId);
      
      if (currentDocId === firestoreDocId) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentDocId');
          localStorage.removeItem('selectedLanguage');
        }
        setCurrentDocId(null);
      }
      await loadDocuments();
      setAlertMessage(`"${fileName}" has been deleted successfully.`);
      setShowSuccessAlert(true);
    } catch (error) {
      setAlertMessage(`Failed to delete "${fileName}". Please try again.`);
      setShowErrorAlert(true);
    } finally {
      setDeletingDocId(null);
      setDeleteDocData(null);
    }
  };

  const handleBackToDashboard = () => {
    if (currentDocId) router.push(`/dashboard?docId=${currentDocId}&returnTo=history`);
    else router.push('/dashboard');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getLanguageName = (code) => {
    const names = { 'en': 'English', 'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French', 'de': 'German' };
    return names[code] || code;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || doc.detectedLanguage === filterLanguage;
    return matchesSearch && matchesLanguage;
  });

  const uniqueLanguages = [...new Set(documents.map(d => d.detectedLanguage).filter(Boolean))];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <Loader className="h-8 w-8 text-[#4285F4] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <Head><title>Document History</title></Head>

      {/* Header */}
      <header className="bg-[#1F1F1F]/95 backdrop-blur-sm border-b border-[#333333] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#333333]"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Document History</h1>
                <p className="text-gray-400 text-xs mt-0.5">{documents.length} documents processed</p>
              </div>
            </div>
            <UserProfile />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#171717] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4285F4] text-sm transition-colors"
            />
          </div>

          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-[#171717] border border-[#333333] rounded-lg text-white text-sm focus:outline-none focus:border-[#4285F4] appearance-none cursor-pointer"
            >
              <option value="all">All Languages</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{getLanguageName(lang)}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="h-8 w-8 text-[#4285F4] animate-spin mb-3" />
            <span className="text-gray-500 text-sm">Loading history...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-16 bg-[#171717] rounded-xl border border-[#333333]">
            <div className="w-16 h-16 bg-[#202020] rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No documents found</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              {searchQuery || filterLanguage !== 'all' ? 'Try adjusting your search or filters.' : 'Upload your first legal document to get started.'}
            </p>
            {!searchQuery && filterLanguage === 'all' && (
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-6 bg-[#4285F4] text-white px-6 py-2.5 rounded-lg hover:bg-[#3367D6] transition-colors font-bold text-sm"
              >
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, index) => {
              // Cycle through colors based on index
              const colorTheme = cardColors[index % cardColors.length];
              
              return (
                <div
                  key={doc.id}
                  className={`
                    bg-[#171717] rounded-xl border-x border-b border-[#333333] p-5 
                    hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative flex flex-col
                    ${deletingDocId === doc.id ? 'opacity-50 pointer-events-none' : ''}
                  `}
                  style={{ borderTop: `4px solid ${colorTheme.border}` }}
                >
                  {/* Deleting Overlay */}
                  {deletingDocId === doc.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#171717]/80 rounded-xl z-20">
                      <Loader className="h-6 w-6 text-[#EA4335] animate-spin" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    {/* Tinted Icon Background */}
                    <div className={`p-2.5 rounded-lg ${colorTheme.bg}`}>
                      <FileText className={`h-6 w-6 ${colorTheme.text}`} />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id, doc.fileName, doc.documentId); }}
                      className="p-2 text-gray-500 hover:text-[#EA4335] hover:bg-[#EA4335]/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="text-white font-bold text-base mb-3 line-clamp-2 min-h-[48px] group-hover:text-gray-200 transition-colors">
                    {doc.fileName || 'Untitled Document'}
                  </h3>

                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5 mr-2 text-gray-500" />
                      {formatDate(doc.uploadedAt)}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Globe className="h-3.5 w-3.5 mr-2 text-gray-500" />
                      {getLanguageName(doc.detectedLanguage)}
                      {/* <span className="ml-2 text-[10px] bg-[#252525] text-gray-300 px-1.5 py-0.5 rounded border border-[#333333]">
                        {Math.round((doc.languageConfidence || 0) * 100)}%
                      </span> */}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/dashboard?docId=${doc.id}&returnTo=history`)}
                    className="w-full bg-[#202020] hover:bg-[#252525] text-white py-2.5 rounded-lg border border-[#333333] transition-colors flex items-center justify-center text-sm font-medium group-hover:border-gray-600"
                  >
                    <Eye className="h-4 w-4 mr-2 text-gray-400 group-hover:text-white transition-colors" />
                    View Analysis
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary - Kept dark and clean */}
        {!loading && documents.length > 0 && (
          <div className="mt-10 bg-[#171717] rounded-xl border border-[#333333] p-6">
            <h3 className="text-lg font-bold text-white mb-6">History Insights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#4285F4] mb-1">{documents.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#34A853] mb-1">{uniqueLanguages.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#A142F4] mb-1">
                  {documents.reduce((sum, doc) => sum + (doc.clauseCount || 0), 0)}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Clauses Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FBBC05] mb-1">
                  {documents.filter(d => {
                    const date = d.uploadedAt?.toDate?.() || new Date(d.uploadedAt);
                    return date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  }).length}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">This Week</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${deleteDocData?.fileName}"?\n\nThis will remove all analysis and chat history.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <AlertDialog
        isOpen={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        type="success"
        title="Success"
        message={alertMessage}
      />

      <AlertDialog
        isOpen={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        type="error"
        title="Error"
        message={alertMessage}
      />
    </div>
  );
}