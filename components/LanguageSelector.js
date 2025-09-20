import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

export default function LanguageSelector({ selectedLanguage, onLanguageChange, showDetectedLanguage = null }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);

  const handleLanguageSelect = (languageCode) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white"
      >
        <Globe className="h-4 w-4 text-gray-300" />
        <span className="text-sm font-medium text-gray-100">
          {selectedLang?.flag} {selectedLang?.name}
        </span>
        {showDetectedLanguage && showDetectedLanguage !== selectedLanguage && (
          <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">
            Detected: {SUPPORTED_LANGUAGES.find(l => l.code === showDetectedLanguage)?.flag}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
          <div className="py-2">
            {showDetectedLanguage && showDetectedLanguage !== selectedLanguage && (
              <>
                <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Detected Language
                </div>
                {SUPPORTED_LANGUAGES
                  .filter(lang => lang.code === showDetectedLanguage)
                  .map((language) => (
                    <button
                      key={`detected-${language.code}`}
                      onClick={() => handleLanguageSelect(language.code)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition-colors text-blue-300 bg-blue-900/30"
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                          <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">
                            Auto-detected
                          </span>
                        </span>
                      </span>
                    </button>
                  ))}
                <div className="border-t border-gray-600 my-2"></div>
                <div className="px-4 py-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
                  All Languages
                </div>
              </>
            )}
            
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition-colors ${
                  language.code === selectedLanguage 
                    ? 'bg-blue-900/50 text-blue-200' 
                    : 'text-gray-200'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </span>
                  {language.code === selectedLanguage && (
                    <span className="text-blue-400">✓</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}