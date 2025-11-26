import { useState } from 'react';
import { Send, MessageSquare, Bot, User, AlertTriangle, DollarSign, XCircle, Shield, Calendar, MessageCircle, Mic, AlertCircle } from 'lucide-react';
import MicrophoneButton from './MicrophoneButton'; // <-- NEW IMPORT
export default function ChatInterface({ documentData, language }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [micError, setMicError] = useState(null); // <-- NEW STATE

  const getIconComponent = (iconName) => {
    const icons = {
      'alert-triangle': AlertTriangle,
      'dollar-sign': DollarSign,
      'x-circle': XCircle,
      'shield': Shield,
      'calendar': Calendar,
      'message-circle': MessageCircle
    };
    return icons[iconName] || MessageCircle;
  };

  // FIX: This function already correctly returns static class strings used below.
  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: 'bg-red-900/20 border-red-500/30',
        icon: 'text-red-400',
        accent: 'border-l-red-500'
      },
      green: {
        bg: 'bg-green-900/20 border-green-500/30',
        icon: 'text-green-400',
        accent: 'border-l-green-500'
      },
      orange: {
        bg: 'bg-orange-900/20 border-orange-500/30',
        icon: 'text-orange-400',
        accent: 'border-l-orange-500'
      },
      purple: {
        bg: 'bg-purple-900/20 border-purple-500/30',
        icon: 'text-purple-400',
        accent: 'border-l-purple-500'
      },
      blue: {
        bg: 'bg-blue-900/20 border-blue-500/30',
        icon: 'text-blue-400',
        accent: 'border-l-blue-500'
      }
    };
    return colors[color] || colors.blue;
  };
  
  // ADDED UI TRANSLATION DICTIONARY
  const uiTranslations = {
    en: {
      askQuestions: 'Ask Questions About Your Document',
      getAnswers: 'Get instant answers about your legal document in plain English',
      suggestedQuestions: 'Suggested Questions:',
      typeQuestion: 'Type your question about the document...',
      emptyState: 'Click on a suggested question above or type your own question to get started!',
    },
    es: {
      askQuestions: 'Pregunte Sobre Su Documento',
      getAnswers: 'Obtenga respuestas instantáneas sobre su documento legal en lenguaje sencillo',
      suggestedQuestions: 'Preguntas Sugeridas:',
      typeQuestion: 'Escriba su pregunta sobre el documento...',
      emptyState: 'Haga clic en una pregunta sugerida o escriba su propia pregunta para comenzar!',
    },
    fr: {
      askQuestions: 'Posez des Questions sur Votre Document',
      getAnswers: 'Obtenez des réponses instantanées sur votre document juridique',
      suggestedQuestions: 'Questions Suggérées :',
      typeQuestion: 'Tapez votre question sur le document...',
      emptyState: 'Cliquez sur une question suggérée ci-dessus ou tapez votre propre question pour commencer !',
    },
    hi: {
      askQuestions: 'अपने दस्तावेज़ के बारे में प्रश्न पूछें',
      getAnswers: 'अपने कानूनी दस्तावेज़ के बारे में तुरंत जवाब पाएं',
      suggestedQuestions: 'सुझाए गए प्रश्न:',
      typeQuestion: 'दस्तावेज़ के बारे में अपना प्रश्न टाइप करें...',
      emptyState: 'शुरू करने के लिए ऊपर सुझाए गए प्रश्न पर क्लिक करें या अपना प्रश्न टाइप करें!',
    },
    kn: {
      askQuestions: 'ನಿಮ್ಮ ಡಾಕ್ಯುಮೆಂಟ್ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ',
      getAnswers: 'ನಿಮ್ಮ ಕಾನೂನು ಡಾಕ್ಯುಮೆಂಟ್ ಬಗ್ಗೆ ತ್ವರಿತ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ',
      suggestedQuestions: 'ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು:',
      typeQuestion: 'ಡಾಕ್ಯುಮೆಂಟ್ ಬಗ್ಗೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ...',
      emptyState: 'ಪ್ರಾರಂಭಿಸಲು ಮೇಲಿನ ಸೂಚಿತ ಪ್ರಶ್ನೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಸ್ವಂತ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ!',
    }
  };

  const t = uiTranslations[language] || uiTranslations.en;
  // ===========================================

  const formatMessage = (text, decoration) => {
    if (!decoration) return text;

    let formatted = text;
    
    // Convert **text** to bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-yellow-300 font-semibold">$1</strong>');
    
    // Convert bullet points
    formatted = formatted.replace(/^• (.*$)/gm, '<div class="flex items-start space-x-2 my-1"><span class="text-gray-400 mt-1">•</span><span>$1</span></div>');
    
    // Convert paragraph breaks
    formatted = formatted.replace(/\n\n/g, '</p><p class="mt-3">');
    
    // Wrap in paragraph tags if not already wrapped
    if (!formatted.includes('<p>')) {
      formatted = `<p>${formatted}</p>`;
    }
    
    return formatted;
  };

  // NEW HANDLER: To accept transcription from the MicrophoneButton
  const handleTranscription = async (transcription) => {
    // Automatically submit the question after successful transcription
    await handleSubmit(transcription); 
  };

  const handleSuggestedQuestion = async (question) => {
    await handleSubmit(question);
  };

  const handleSubmit = async (question = inputValue) => {
    const questionToSubmit = question.trim();
    if (!questionToSubmit || isLoading) return;


    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: questionToSubmit,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setMicError(null); // <-- Clear error
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          documentText: documentData.originalText,
          language: language
        }),
      });

      const result = await response.json();

      if (result.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: result.answer,
          decoration: result.decoration,
          metadata: result.metadata,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      {/* Header */}
      <div className="border-b border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <MessageSquare className="h-6 w-6 text-blue-400 mr-2" />
          {t.askQuestions}
        </h3>
        <p className="text-gray-300 mt-1">
          {t.getAnswers}
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="p-6 border-b border-gray-700 bg-gray-800/50">
        <h4 className="font-medium text-white mb-3">
          {t.suggestedQuestions}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* NOTE: documentData.smartQuestions must contain translated strings (handled in documentProcessor.js) */}
          {documentData.smartQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(question)}
              disabled={isLoading}
              className="text-left p-3 bg-gray-700 border border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm text-gray-200">{question}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-6">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {t.emptyState}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => {
              const colorClasses = message.decoration 
                ? getColorClasses(message.decoration.color) 
                : getColorClasses('blue'); // Default to blue

              return (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isError 
                      ? 'bg-red-900/50 border border-red-500/30' 
                      : colorClasses.bg // FIX: Use static class from lookup
                  }`}>
                    {message.decoration && !message.isError ? (
                      (() => {
                        const IconComponent = getIconComponent(message.decoration.icon);
                        return <IconComponent className={`h-4 w-4 ${colorClasses.icon}`} />;
                      })()
                    ) : (
                      <Bot className={`h-4 w-4 ${
                        message.isError ? 'text-red-400' : 'text-blue-400'
                      }`} />
                    )}
                  </div>
                )}
                
                <div className={`max-w-3xl ${
                  message.type === 'user' ? 'order-1' : 'order-2'
                }`}>
                  <div className={`rounded-lg px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.isError
                      ? 'bg-red-900/50 border border-red-500/30 text-red-200'
                      : message.decoration
                      ? `${colorClasses.bg} border-l-4 ${colorClasses.accent} text-gray-100` // FIX: Use static class from lookup
                      : 'bg-gray-700 text-gray-100 border border-gray-600'
                  }`}>
                    {message.type === 'bot' && message.decoration && (
                      <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-600/50">
                        {/* NOTE: These classes are also dynamically generated but use a finite set 
                           (red, green, orange, purple, blue) which Tailwind often includes if used 
                           statically somewhere, but for safety, consider using a full static object if 
                           these break too. */}
                        <span className={`text-xs font-medium capitalize px-2 py-1 rounded ${
                          message.decoration.color === 'red' ? 'bg-red-900/50 text-red-200' :
                          message.decoration.color === 'green' ? 'bg-green-900/50 text-green-200' :
                          message.decoration.color === 'orange' ? 'bg-orange-900/50 text-orange-200' :
                          message.decoration.color === 'purple' ? 'bg-purple-900/50 text-purple-200' :
                          'bg-blue-900/50 text-blue-200'
                        }`}>
                          {message.metadata?.category || message.decoration.type}
                        </span>
                        {message.metadata?.hasWarning && (
                          <span className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded">
                            ⚠️ Important
                          </span>
                        )}
                      </div>
                    )}
                    <div 
                      className="text-sm prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: message.type === 'bot' && message.decoration 
                          ? formatMessage(message.content, message.decoration)
                          : message.content.replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center order-2 flex-shrink-0">
                    <User className="h-4 w-4 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-900/30 border border-blue-500/30 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-400" />
                </div>
                <div className="bg-gray-700 rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">


        {/* NEW: Microphone Error Display */}
        {micError && (
            <div className="mb-3 p-3 bg-red-900/50 border border-red-500/30 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-200">{micError}</p>
            </div>
        )}
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.typeQuestion}
              disabled={isLoading}
              className="w-full resize-none border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              rows="2"
            />
          </div>

          {/* NEW: Microphone Button Integration */}
          <MicrophoneButton 
            onTranscription={handleTranscription}
            onError={setMicError} // Pass setter for displaying errors
            selectedLanguage={language}
            isChatLoading={isLoading}
          />
          
          <button
            onClick={() => handleSubmit()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[60px]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}