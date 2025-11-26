// pages/login.js - Dedicated Login/Signup Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../lib/authContext';
import { firestoreService } from '../lib/firestoreService';
import { Mail, AlertCircle, Loader, FileText, Globe, Shield } from 'lucide-react';

export default function LoginPage() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      console.log('🔐 Initiating Google sign-in...');
      const userData = await signInWithGoogle();
      
      console.log('👤 User data received:', userData.email);
      
      // Create user profile in Firestore
      await firestoreService.createUserProfile(userData.uid, {
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        provider: 'google'
      });
      
      console.log('✅ Profile created, redirecting...');
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Head>
        <title>Sign In - Legal Document Demystifier</title>
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Legal Document Demystifier
          </h1>
          <p className="text-gray-300">
            Understand your legal documents with AI-powered insights
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700 p-8">
          <h2 className="text-2xl font-semibold text-white mb-2 text-center">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Sign in to access your document analysis
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500/30 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-200 font-medium">Sign In Failed</p>
                <p className="text-xs text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Features List */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center mb-4">
              What you'll get:
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <Shield className="h-4 w-4 text-green-400 mr-2" />
                <span>Secure storage for analysis of Documents</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Globe className="h-4 w-4 text-blue-400 mr-2" />
                <span>Multi-language support</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <FileText className="h-4 w-4 text-purple-400 mr-2" />
                <span>Access document history</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
         
        </div>

        {/* Footer */}
        
        
      </div>
    </div>
  );
}