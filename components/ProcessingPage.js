import { FileText, Clock, Sparkles, Activity } from 'lucide-react';

export default function ProcessingPage({ fileName, progress = 0, onBack }) {
  const processingSteps = [
    { text: "Extracting text from document", icon: FileText },
    { text: "Analyzing legal language", icon: Sparkles },
    { text: "Generating simplified summary", icon: Clock },
    { text: "Creating risk assessment", icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Main content */}
        <div className="relative z-10">
          {/* Animated orb */}
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />

            {/* Middle ring */}
            <div className="absolute inset-2 border-4 border-purple-500/30 rounded-full border-dashed animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />

            {/* Inner orb */}
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center animate-pulse">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Analyzing your legal document
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-300 mb-8">
            This usually takes less than a minute. We're using AI to understand and simplify your document.
          </p>

          {/* File info */}
          {fileName && (
            <div className="bg-gray-800 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 mb-8 inline-block">
              <div className="flex items-center justify-center space-x-3">
                <FileText className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">{fileName}</span>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-8">
            <div className="max-w-md mx-auto mb-4 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${Math.max(progress, 10)}%` }}
              />
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Processing... {Math.round(progress)}%</span>
            </div>
          </div>

          {/* Processing steps */}
          <div className="space-y-3">
            {processingSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-center justify-center space-x-3 text-gray-400"
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    progress > (index + 1) * 25
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-110'
                      : 'bg-gray-600'
                  }`}
                />
                <span className="text-sm">{step.text}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-xs text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Google Cloud AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}