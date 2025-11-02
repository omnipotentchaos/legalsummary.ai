import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadPage({ onFileSelect, onProcessingStart }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState({
    role: 'individual',
    jurisdiction: 'india',
    riskTolerance: 'medium',
    priorities: [],
    readingLevel: 'simplified'
  });
  const [consentGiven, setConsentGiven] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    setError('');
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError(`Please select a PDF or DOCX file. Received file type: ${file.type}`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(`File size must be less than 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    if (file.size === 0) {
      setError('The selected file is empty.');
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    if (!consentGiven) {
      setError('Please agree to the terms and conditions to proceed.');
      return;
    }
    
    if (onProcessingStart) onProcessingStart(selectedFile, userProfile);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Legal Document Demystifier
          </h1>
          <p className="text-xl text-gray-300">
            Upload your legal documents and let AI simplify the complex language
          </p>
        </div>

        {/* Upload Zone */}
        <div className="mb-8">
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all duration-300 ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-900/20 scale-105' 
                  : 'border-gray-600 bg-gray-800 hover:border-blue-500 hover:bg-gray-700'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform ${
                  isDragOver ? 'scale-110 rotate-12' : ''
                }`}>
                  <Upload className="h-10 w-10 text-white" />
                </div>

                <h3 className="text-2xl font-semibold text-white mb-2">
                  {isDragOver ? 'Drop your file here' : 'Upload your document'}
                </h3>

                <p className="text-gray-300 mb-6">
                  Drag and drop your PDF or DOCX file, or click to browse
                </p>

                <div className="text-sm text-gray-400">
                  <p>Supported formats: PDF, DOCX</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{selectedFile.name}</h4>
                    <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* User Profile Section */}
              {/* <div className="bg-gray-900 rounded-lg p-4 mb-4 space-y-4">
                <h5 className="font-medium text-white mb-3">Document Analysis Profile</h5>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Role
                  </label>
                  <select
                    value={userProfile.role}
                    onChange={(e) => setUserProfile({...userProfile, role: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="individual">Individual/Consumer</option>
                    <option value="small_business">Small Business Owner</option>
                    <option value="enterprise">Enterprise/Legal Team</option>
                    <option value="lawyer">Legal Professional</option>
                    <option value="student">Student/Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Jurisdiction
                  </label>
                  <select
                    value={userProfile.jurisdiction}
                    onChange={(e) => setUserProfile({...userProfile, jurisdiction: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="india">India</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="delhi">Delhi</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="chennai">Chennai</option>
                    <option value="kolkata">Kolkata</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Risk Tolerance
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setUserProfile({...userProfile, riskTolerance: level})}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          userProfile.riskTolerance === level
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Explanation Level
                  </label>
                  <select
                    value={userProfile.readingLevel}
                    onChange={(e) => setUserProfile({...userProfile, readingLevel: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="simplified">Simplified (Beginner-friendly)</option>
                    <option value="standard">Standard (Balanced)</option>
                    <option value="technical">Technical (Legal terminology)</option>
                  </select>
                </div>
              </div> */}

              {/* Consent Checkbox */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-600 focus:ring-blue-500 bg-gray-700"
                  />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-white mb-1">Consent to Process Document</p>
                    <p>
                      I consent to have this document processed by AI for analysis. I understand that:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                      <li>The document will be temporarily stored and processed using Google Cloud AI</li>
                      <li>AI-generated analysis is for informational purposes only</li>
                      <li>I should consult qualified legal counsel for binding advice</li>
                    </ul>
                  </div>
                </label>
              </div>

              <button
                onClick={handleUpload}
                disabled={!consentGiven}
                className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 ${
                  consentGiven
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {consentGiven ? 'Analyze Document' : 'Please Accept Terms to Continue'}
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              title: 'AI-Powered Analysis',
              description: 'Advanced AI breaks down complex legal language into simple explanations'
            },
            {
              icon: CheckCircle,
              title: 'Risk Assessment',
              description: 'Identify potential risks and important clauses in your documents'
            },
            {
              icon: Upload,
              title: 'Secure & Private',
              description: 'Your documents are processed securely and never stored permanently'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 hover:shadow-xl hover:border-gray-600 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by Google Cloud AI • Secure document processing</p>
        </div>
      </div>
    </div>
  );
}