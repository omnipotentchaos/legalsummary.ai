// pages/index.js - Homepage that redirects to login or dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/authContext';
import { Loader } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader className="h-8 w-8 text-blue-500 animate-spin" />
    </div>
  );
}