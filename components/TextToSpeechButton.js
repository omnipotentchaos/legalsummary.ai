// components/TextToSpeechButton.js
// DO NOT IMPORT @google-cloud/text-to-speech HERE - it's server-side only!

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader } from 'lucide-react';

export default function TextToSpeechButton({ textToRead, selectedLanguage, isTranslating }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when text or language changes
  useEffect(() => {
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  }, [textToRead, selectedLanguage, isTranslating]);

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const startSpeaking = async () => {
    if (!textToRead) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call your API to get the audio
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToRead,
          language: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate speech');
      }

      // Convert base64 to audio blob
      const audioBlob = base64ToBlob(data.audioContent, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to play audio');
        setIsSpeaking(false);
        setIsLoading(false);
      };

      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setError(err.message);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  };

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      startSpeaking();
    }
  };

  // Helper function to convert base64 to blob
  function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={!textToRead || isTranslating || isLoading}
        className={`flex items-center space-x-2 px-4 py-2 border border-gray-600 rounded-lg transition-colors text-white font-medium ${
          isSpeaking
            ? 'bg-red-700 hover:bg-red-600'
            : 'bg-green-700 hover:bg-green-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={
          isSpeaking
            ? 'Stop Reading'
            : isLoading
            ? 'Generating Audio...'
            : 'Read Full Analysis Aloud'
        }
      >
        {isLoading ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : isSpeaking ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isLoading
            ? 'Loading...'
            : isTranslating
            ? 'Wait...'
            : isSpeaking
            ? 'Stop Reading'
            : 'Read Analysis'}
        </span>
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-900 border border-red-700 rounded text-xs text-white whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}