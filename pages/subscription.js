// pages/subscription.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Gavel, ArrowLeft, Zap } from 'lucide-react';

export default function SubscriptionPage() {
  const router = useRouter();
  const { docId } = router.query;

  const handleBack = () => {
    if (docId) {
      // Go back to the specific document
      router.push(`/dashboard?docId=${docId}&returnTo=subscription`);
    } else {
      // No document, go to dashboard
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Head>
        <title>Get Legal Advice - Subscription</title>
      </Head>

      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Gavel className="h-8 w-8 text-yellow-400 mr-2" />
                Legal Advice & Premium Tools
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Unlock Expert Legal Guidance
          </h2>
          <p className="text-xl text-gray-300">
            Get direct, personalized legal consultation by subscribing to our premium plan.
          </p>
        </div>

        {/* Premium card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700 max-w-xl mx-auto">
            
            {/* Premium Plan */}
            <div className="border border-yellow-500 rounded-lg p-6 flex flex-col justify-between h-full bg-yellow-900/10 relative">
                <span className="absolute top-0 right-0 -mt-3 -mr-3 bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full shadow-md">
                    Premium Plan
                </span>
                <div>
                    <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
                        <Gavel className="h-6 w-6 mr-2" />
                        Legal Connect Pro
                    </h3>
                    <p className="text-gray-300 mb-6">
                        Get direct, personalized advice from legal experts in your jurisdiction.
                    </p>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-center"><Gavel className="h-4 w-4 text-yellow-400 mr-2"/> 30-Minute Expert Consultation</li>
                        <li className="flex items-center"><Gavel className="h-4 w-4 text-yellow-400 mr-2"/> Custom Clause Review</li>
                        <li className="flex items-center"><Gavel className="h-4 w-4 text-yellow-400 mr-2"/> Unlimited Document History</li>
                        <li className="flex items-center"><Gavel className="h-4 w-4 text-yellow-400 mr-2"/> Document Comparison Tool Access</li>
                    </ul>
                </div>
                <a
                    href="#"
                    className="mt-6 w-full bg-yellow-500 text-gray-900 py-3 rounded-lg hover:bg-yellow-600 font-semibold transition-colors text-center block"
                >
                    Subscribe Now (₹299/month)
                </a>
            </div>

            <button
                onClick={handleBack}
                className="mt-6 w-full text-white py-3 rounded-lg hover:bg-gray-700 font-semibold transition-colors border border-gray-700"
            >
                <span className="flex items-center justify-center space-x-2">
                    <ArrowLeft className="h-4 w-4"/>
                    <span>Back to {docId ? 'Document' : 'Dashboard'}</span>
                </span>
            </button>

        </div>

        <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
                Disclaimer: We are an AI platform. Legal advice is provided by independent, third-party attorneys through our subscription service.
            </p>
        </div>
      </main>
    </div>
  );
}