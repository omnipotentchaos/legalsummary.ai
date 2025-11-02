// components/UserProfile.js - Updated with History Link
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { User, LogOut, History, ChevronDown, ChevronUp } from 'lucide-react';

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors border border-gray-600"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        )}
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-white">{user.displayName}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-20">
            {/* Profile Info */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-white">{user.displayName}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Document History Link */}
            {/* <button
              onClick={() => {
                router.push('/history');
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-2 border-b border-gray-700"
            >
              <History className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-200">Document History</span>
            </button> */}

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-2 text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}