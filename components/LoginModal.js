// components/LoginModal.js - Authentication Modal
import { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { X, Mail, Github, AlertCircle } from 'lucide-react';
import { firestoreService } from '../lib/firestoreService';

export default function LoginModal({ isOpen, onClose }) {
  const { signInWithGoogle, signInWithGithub } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      
      // Create user profile in Firestore
      await firestoreService.createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'google'
      });
      
      onClose();
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGithub();
      
      // Create user profile in Firestore
      await firestoreService.createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'github'
      });
      
      onClose();
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in with GitHub. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Sign In</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-300 text-center mb-6">
            Sign in to save your documents and access them from any device
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Sign In Buttons */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="h-5 w-5" />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={handleGithubSignIn}
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-950 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-3 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Github className="h-5 w-5" />
            <span>Continue with GitHub</span>
          </button>

          {loading && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy. 
              Your documents are encrypted and stored securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}