import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, AlertCircle, Globe, CheckCircle } from 'lucide-react';

export default function DocumentUpload({ onDocumentProcessed, onUploadStart, isProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef(null);

  // Fix hydration error
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file only.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    onUploadStart();

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Pass both document data and language detection info
        onDocumentProcessed(result.data, result.languageDetection);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to process document. Please try again.');
      onDocumentProcessed(null);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border-2 border-dashed border-gray-600 p-8">
      <div className="text-center">
        <div className="mb-6">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
        </div>

        <h2 className="text-2xl font-semibold text-white mb-2">
          Upload Your Legal Document
        </h2>
        <p className="text-gray-300 mb-6">
          Upload a PDF or DOCX file to get started. We'll analyze the document and automatically detect the language.
        </p>

        {/* Enhanced Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
          <div className="bg-gray-700 rounded-lg p-4">
            <Globe className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-gray-200 font-medium">Auto Language Detection</p>
            <p className="text-gray-400 text-xs mt-1">Detects document language automatically</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-gray-200 font-medium">Smart Analysis</p>
            <p className="text-gray-400 text-xs mt-1">AI-powered clause identification</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <FileText className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-gray-200 font-medium">Multi-format Support</p>
            <p className="text-gray-400 text-xs mt-1">PDF and DOCX files supported</p>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-900/20' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.docx"
            onChange={handleChange}
            disabled={isProcessing}
          />

          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-lg font-medium text-white mb-2">
              Drop your document here, or{' '}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300"
                onClick={onButtonClick}
                disabled={isProcessing}
              >
                browse
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Supports PDF and DOCX files up to 10MB
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-3"></div>
              <div className="text-left">
                <p className="text-blue-200 font-medium">Processing Document...</p>
                <p className="text-blue-300 text-sm">Extracting text, detecting language, and analyzing clauses</p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-200">
            <strong>Privacy Notice:</strong> Your documents are processed securely and are not stored permanently. 
            Only anonymized analysis data is retained to improve our service.
          </p>
        </div>

        {/* Document AI Status - Fixed hydration issue */}
        
      </div>
    </div>
  );
}