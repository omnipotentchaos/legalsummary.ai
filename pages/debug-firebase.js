// Create this file: pages/debug-firebase.js
// This will help you see what environment variables are actually available

export default function DebugFirebase() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Firebase Configuration Debug</h1>
      <p style={{ color: 'red' }}>⚠️ DELETE THIS FILE AFTER DEBUGGING!</p>
      
      <h2>Environment Variables:</h2>
      <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(firebaseConfig, null, 2)}
      </pre>

      <h2>Status:</h2>
      <ul>
        <li>API Key: {firebaseConfig.apiKey ? '✅ Present' : '❌ Missing'}</li>
        <li>Auth Domain: {firebaseConfig.authDomain ? '✅ Present' : '❌ Missing'}</li>
        <li>Project ID: {firebaseConfig.projectId ? '✅ Present' : '❌ Missing'}</li>
        <li>Storage Bucket: {firebaseConfig.storageBucket ? '✅ Present' : '❌ Missing'}</li>
        <li>Messaging Sender ID: {firebaseConfig.messagingSenderId ? '✅ Present' : '❌ Missing'}</li>
        <li>App ID: {firebaseConfig.appId ? '✅ Present' : '❌ Missing'}</li>
      </ul>
    </div>
  );
}