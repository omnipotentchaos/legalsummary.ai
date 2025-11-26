import { useState, useRef } from 'react';
import { Mic, X, Loader } from 'lucide-react';

export default function MicrophoneButton({ onTranscription, onError, selectedLanguage, isChatLoading }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      if (isChatLoading) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use 'audio/webm' as it is widely supported and works well with STT
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' }); 
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // Stop all tracks in the stream to release the mic light/icon
        stream.getTracks().forEach(track => track.stop());
        
        // Process the recording once it stops
        processRecording();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      onError(null); // Clear previous errors
    } catch (err) {
      console.error('Microphone access denied or failed:', err);
      onError('Microphone access denied. Please allow access in browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-query.webm');
      // Map your app's language code (e.g., 'hi') to a full locale (e.g., 'hi-IN')
      formData.append('language', getSpeechLanguageCode(selectedLanguage));

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.transcription) {
        onTranscription(result.transcription);
      } else {
        onError(result.message || 'Transcription failed. Please speak clearly.');
      }
    } catch (err) {
      console.error('Transcription submission error:', err);
      onError('Network or API error during transcription.');
    } finally {
      setIsProcessing(false);
      setIsRecording(false);
    }
  };

  // Helper to map app's 2-letter codes to Speech-to-Text compatible codes
  const getSpeechLanguageCode = (appCode) => {
    const codeMap = {
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN', 
      'ta': 'ta-IN', 'ur': 'ur-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 
      'pa': 'pa-IN', 'or': 'or-IN', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 
    };
    return codeMap[appCode] || 'en-IN';
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing || isChatLoading}
      className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[60px] disabled:opacity-50 ${
        isRecording
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      }`}
      title={isRecording ? "Stop Recording" : isProcessing ? "Processing..." : "Voice Query"}
    >
      {isProcessing ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <X className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
}