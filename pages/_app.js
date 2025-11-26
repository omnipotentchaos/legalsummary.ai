// pages/_app.js - Updated with Authentication Provider
import '../styles/global.css';
import { AuthProvider } from '../lib/authContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}