// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../lib/authContext';
import { firestoreService } from '../lib/firestoreService';
import Modal from '../components/Modal'; 
import { Loader, Upload, FileText, Zap, CheckCircle, MessageSquare, AlertCircle, User } from 'lucide-react';

export default function LoginPage() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await signInWithGoogle();
      
      await firestoreService.createUserProfile(userData.uid, {
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        provider: 'google'
      });
      
      setShowSignInModal(false);
      router.push('/dashboard');
      
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    setShowSignInModal(true);
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <Loader className="h-8 w-8 text-[#4285F4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F1F1F] font-sans text-gray-100">
      <Head>
        <title>Legal Document Demystifier</title>
      </Head>

      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 bg-[#1F1F1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <span className="text-xl font-bold text-white tracking-tight">
               Legal Document Demystifier
             </span>
          </div>
          
          <button 
              onClick={handleGoogleSignIn}
              className="bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold px-6 py-2 rounded shadow-sm transition-colors text-sm uppercase tracking-wide"
          >
              Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#1F1F1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pt-12 lg:pb-24">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 text-left z-10 relative">
              <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
                Simplify complex legal documents & protect your interests
              </h2>
              
              <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-lg">
                Upload your document to receive a plain-language summary, risk assessment, and clause-by-clause explanation powered by Google Cloud AI.
              </p>

              {/* Upload CTA */}
              <button
                onClick={handleUploadClick}
                disabled={loading}
                className={`flex items-center justify-center space-x-3 px-8 py-3 rounded-md text-base font-bold transition-all w-72 
                  bg-[#4285F4] text-white hover:bg-[#3367D6] shadow-lg`}
              >
                {loading ? (
                    <Loader className="h-5 w-5 animate-spin text-white" />
                ) : (
                    <>
                        <Upload className="h-5 w-5 text-white" />
                        <span>Upload Document</span>
                    </>
                )}
              </button>

              <p className="mt-8 text-sm text-gray-500 max-w-xl leading-relaxed">
                Our application uses AI technology to summarize documents for informational purposes only and does not provide legal advice. The results may be incomplete or inaccurate. To get legal guidance on a document, connect with an attorney by{' '}
                <button 
                  onClick={() => router.push('/subscription')}
                  className="underline cursor-pointer hover:text-[#4285F4] text-gray-400 transition-colors focus:outline-none"
                >
                  clicking here
                </button>.
              </p>
            </div>

            {/* Right Visual Section */}
            <div className="lg:col-span-6 mt-16 lg:mt-0 relative h-[430px] hidden lg:flex items-center justify-center">
              {[
                {
                  id: 1,
                  title: "Loan Contract",
                  color: "from-[#4285F4] via-[#EA4335] to-[#FBBC04]",
                  risk: "Unlimited Indemnity clause found.",
                  icon: FileText
                },
                {
                  id: 2,
                  title: "Rental Agreement",
                  color: "from-[#34A853] via-[#4285F4] to-[#FBBC04]",
                  risk: "Unclear maintenance responsibilities.",
                  icon: FileText
                },
                {
                  id: 3,
                  title: "Terms of Service",
                  color: "from-[#EA4335] via-[#FBBC04] to-[#34A853]",
                  risk: "Forced arbitration clause detected.",
                  icon: FileText
                }
              ].map((card, index) => {
                const isHovered = hoveredCard === card.id;
                const initialTilt = [
                  "-translate-x-32 -rotate-3",
                  "translate-x-0 rotate-0",
                  "translate-x-32 rotate-3"
                ];
                const straight = "rotate-0 scale-110 z-50 translate-x-0";
                const fadeLeft = "-translate-x-40 opacity-20 blur-[1px] rotate-0 scale-[0.9]";
                const fadeRight = "translate-x-40 opacity-20 blur-[1px] rotate-0 scale-[0.9]";

                let applyClass = initialTilt[index];

                if (hoveredCard && !isHovered) {
                  applyClass = index < hoveredCard - 1 ? fadeLeft : fadeRight;
                }

                if (isHovered) {
                  applyClass = straight;
                }

                return (
                  <div
                    key={card.id}
                    onMouseEnter={() => setHoveredCard(card.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`
                      absolute w-64 h-80 bg-[#2D2E31]
                      rounded-xl border border-gray-700
                      shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                      backdrop-blur-md
                      transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]
                      ${applyClass}
                    `}
                    style={{ transitionDelay: `${index * 80}ms` }}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} rounded-t-xl`}></div>
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-gray-800 p-2 rounded border border-gray-700">
                          <card.icon className="h-6 w-6 text-[#4285F4]" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white block">{card.title}</span>
                          <span className="text-xs text-gray-500">Analysis Preview</span>
                        </div>
                      </div>
                      <div className="p-3 bg-[#3C4043] rounded border border-gray-600 mb-4">
                        <span className="text-xs text-red-400 block mb-1">High Risk Detected</span>
                        <span className="text-sm text-gray-300">{card.risk}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-orange-400">
                          <AlertCircle className="h-4 w-4" />
                          <span>Medium risk clause found.</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <CheckCircle className="h-4 w-4 text-[#34A853]" />
                          <span>Some obligations look standard.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-[#171717] border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="mb-4"><Zap className="h-8 w-8 text-[#FBBC05]" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Summaries</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Obtain a clear, summarized breakdown of any contract or terms of service in seconds.</p>
            </div>
            <div>
              <div className="mb-4"><AlertCircle className="h-8 w-8 text-[#EA4335]" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Automated Risk Analysis</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Automatically flag potential risks, hidden fees, and one-sided clauses you need to watch out for.</p>
            </div>
            <div>
              <div className="mb-4"><MessageSquare className="h-8 w-8 text-[#34A853]" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Chat with your Document</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Ask specific questions about penalties, deadlines, and rights in plain language.</p>
            </div>
            <div>
              <div className="mb-4"><CheckCircle className="h-8 w-8 text-[#4285F4]" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Language Support</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Translate complex legal terms and analysis into multiple Indian languages instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-in Modal */}
      <Modal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} title="Start Document Analysis">
        <div className="text-center p-4">
          <User className="h-12 w-12 text-[#4285F4] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-3">Sign In to Analyze</h3>
          <p className="text-gray-300 mb-6">
            To start the AI analysis and securely save your session, please sign in with Google.
          </p>
          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500/30 rounded-lg p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-[#4285F4] text-white py-3 px-4 rounded-lg hover:bg-[#3367D6] transition-colors font-bold disabled:opacity-50"
          >
            {loading ? (
                <Loader className="h-5 w-5 animate-spin text-white" />
            ) : (
                <>
                    <svg className="h-5 w-5" viewBox="0 0 533.5 544.3">
                        <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272.1v95.3h147.5c-6.4 34.5-25.8 63.7-55 83.2v68h88.8c52-47.8 80.1-118.3 80.1-196.1z"/>
                        <path fill="#34A853" d="M272.1 544.3c74.8 0 137.6-24.6 183.4-66.7l-88.8-68c-24.6 16.5-56.2 26-94.6 26-72.8 0-134.4-49.2-156.4-115.2H23.7v72.3c44.8 88.5 136.9 151.6 248.4 151.6z"/>
                        <path fill="#FBBC05" d="M115.7 320.4c-10.8-32.2-10.8-67.3 0-99.5v-72.3H23.7c-47.3 94.4-47.3 207.4 0 301.8l92-72.3z"/>
                        <path fill="#EA4335" d="M272.1 107.7c40.6 0 77.1 14 105.9 41.5l79.3-79.3C409.7 24.6 346.9 0 272.1 0 160.6 0 68.5 63.1 23.7 151.6l92 72.3c22-66 83.6-115.2 156.4-115.2z"/>
                    </svg>
                    <span>Sign In with Google</span>
                </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}