import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User, AlertCircle, AlertTriangle, DollarSign, Shield, Calendar, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import MicrophoneButton from './MicrophoneButton';

export default function ChatInterface({ documentData, language }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [micError, setMicError] = useState(null);
  
  // CHANGED: Ref for the container instead of a bottom element
  const chatContainerRef = useRef(null);

  // --- TRANSLATIONS FOR UI LABELS ---
  const translations = {
    en: { header: 'Ask Questions About Your Document', subheader: 'Get instant answers about your legal document in plain English', suggested: 'SUGGESTED QUESTIONS:', placeholder: 'Type your question...', empty: 'Start a conversation about your document.', loading: 'Analyzing document...', thinking: 'Thinking...' },
    hi: { header: 'अपने दस्तावेज़ के बारे में प्रश्न पूछें', subheader: 'सादे भाषा में त्वरित उत्तर प्राप्त करें', suggested: 'सुझाए गए प्रश्न:', placeholder: 'अपना प्रश्न टाइप करें...', empty: 'बातचीत शुरू करें।', loading: 'विश्लेषण किया जा रहा है...', thinking: 'सोच रहा हूँ...' },
    mr: { header: 'तुमच्या दस्तऐवजाबद्दल प्रश्न विचारा', subheader: 'कायदेशीर दस्तऐवजाबद्दल त्वरित उत्तरे मिळवा', suggested: 'सुचवलेले प्रश्न:', placeholder: 'तुमचा प्रश्न टाइप करा...', empty: 'संभाषण सुरू करा.', loading: 'विश्लेषण करत आहे...', thinking: 'विचार करत आहे...' },
    bn: { header: 'প্রশ্ন জিজ্ঞাসা করুন', subheader: 'সহজ ভাষায় উত্তর পান', suggested: 'প্রস্তাবিত প্রশ্ন:', placeholder: 'প্রশ্ন টাইপ করুন...', empty: 'কথপোকথন শুরু করুন।', loading: 'বিশ্লেষণ করা হচ্ছে...', thinking: 'ভাবছি...' },
    te: { header: 'ప్రశ్నలు అడగండి', subheader: 'తక్షణ సమాధానాలను పొందండి', suggested: 'సూచించబడిన ప్రశ్నలు:', placeholder: 'ప్రశ్నను టైప్ చేయండి...', empty: 'సంభాషణను ప్రారంభించండి.', loading: 'విశ్లేషిస్తోంది...', thinking: 'ఆలోచిస్తోంది...' },
    ta: { header: 'கேள்விகள் கேட்கவும்', subheader: 'உடனடி பதில்களைப் பெறுங்கள்', suggested: 'பரிந்துரைக்கப்பட்ட கேள்விகள்:', placeholder: 'கேள்வியைத் தட்டச்சு செய்யவும்...', empty: 'உரையாடலைத் தொடங்கவும்.', loading: 'பகுப்பாய்வு செய்கிறது...', thinking: 'யோசிக்கிறது...' },
    ur: { header: 'سوالات پوچھیں', subheader: 'فوری جوابات حاصل کریں', suggested: 'تجویز کردہ سوالات:', placeholder: 'سوال ٹائپ کریں...', empty: 'گفتگو شروع کریں۔', loading: 'تجزیہ ہو رہا ہے...', thinking: 'سوچ رہا ہے...' },
    gu: { header: 'પ્રશ્નો પૂછો', subheader: 'ત્વરિત જવાબો મેળવો', suggested: 'સૂચવેલા પ્રશ્નો:', placeholder: 'પ્રશ્ન લખો...', empty: 'વાતચીત શરૂ કરો.', loading: 'વિશ્લેષણ થઈ રહ્યું છે...', thinking: 'વિચારી રહ્યું છે...' },
    kn: { header: 'ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ', subheader: 'ತ್ವರಿತ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ', suggested: 'ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು:', placeholder: 'ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ...', empty: 'ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ.', loading: 'ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...', thinking: 'ಯೋಚಿಸುತ್ತಿದೆ...' },
    ml: { header: 'ചോദ്യങ്ങൾ ചോദിക്കുക', subheader: 'മറുപടി നേടുക', suggested: 'നിർദ്ദേശിച്ച ചോദ്യങ്ങൾ:', placeholder: 'ചോദ്യം ടൈപ്പ് ചെയ്യുക...', empty: 'സംഭാഷണം ആരംഭിക്കുക.', loading: 'വിശകലനം ചെയ്യുന്നു...', thinking: 'ചിന്തിക്കുന്നു...' },
    pa: { header: 'ਸਵਾਲ ਪੁੱਛੋ', subheader: 'ਜਵਾਬ ਪ੍ਰਾਪਤ ਕਰੋ', suggested: 'ਸੁਝਾਏ ਗਏ ਸਵਾਲ:', placeholder: 'ਸਵਾਲ ਟਾਈਪ ਕਰੋ...', empty: 'ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ।', loading: 'ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...', thinking: 'ਸੋਚ ਰਿਹਾ ਹੈ...' },
    or: { header: 'ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ', subheader: 'ଉତ୍ତର ପାଆନ୍ତୁ', suggested: 'ପ୍ରସ୍ତାବିତ ପ୍ରଶ୍ନ:', placeholder: 'ପ୍ରଶ୍ନ ଟାଇପ୍ କରନ୍ତୁ...', empty: 'କଥାବାର୍ତ୍ତା ଆରମ୍ଭ କରନ୍ତୁ।', loading: 'ବିଶ୍ଳେଷଣ କରାଯାଉଛି...', thinking: 'ଚିନ୍ତା କରୁଛି...' }
  };

  const t = translations[language] || translations.en;

  // --- FIXED SCROLL LOGIC ---
  const scrollToBottom = () => {
    // Only scroll if we have messages or are loading to prevent jump on initial load
    if ((messages.length > 0 || isLoading) && chatContainerRef.current) {
        setTimeout(() => {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const getColorClasses = (color) => {
    const colors = {
      red: { bg: 'bg-[#EA4335]/10 border-[#EA4335]/30', icon: 'text-[#EA4335]', accent: 'border-l-[#EA4335]' },
      green: { bg: 'bg-[#34A853]/10 border-[#34A853]/30', icon: 'text-[#34A853]', accent: 'border-l-[#34A853]' },
      orange: { bg: 'bg-[#FBBC05]/10 border-[#FBBC05]/30', icon: 'text-[#FBBC05]', accent: 'border-l-[#FBBC05]' },
      purple: { bg: 'bg-[#A142F4]/10 border-[#A142F4]/30', icon: 'text-[#A142F4]', accent: 'border-l-[#A142F4]' },
      blue: { bg: 'bg-[#4285F4]/10 border-[#4285F4]/30', icon: 'text-[#4285F4]', accent: 'border-l-[#4285F4]' }
    };
    return colors[color] || colors.blue;
  };

  const handleTranscription = async (transcription) => await handleSubmit(transcription);
  const handleSuggestedQuestion = async (question) => await handleSubmit(question);

  const handleSubmit = async (question = inputValue) => {
    const questionToSubmit = question.trim();
    if (!questionToSubmit || isLoading) return;

    const userMessage = { id: Date.now(), type: 'user', content: questionToSubmit, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setMicError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), documentText: documentData.originalText, language: language }),
      });
      const result = await response.json();
      if (result.success) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, type: 'bot', content: result.answer, decoration: result.decoration, metadata: result.metadata, timestamp: new Date()
        }]);
      } else { throw new Error(result.error); }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: 'Error processing question.', timestamp: new Date(), isError: true }]);
    } finally { setIsLoading(false); }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };

  return (
    <div className="bg-[#171717] rounded-xl shadow-xl border border-[#333333] overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#333333] p-6 bg-[#171717]">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <MessageSquare className="h-7 w-7 text-[#4285F4] mr-3" />
          {t.header}
        </h3>
        <p className="text-gray-400 mt-2 text-base">{t.subheader}</p>
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="p-6 border-b border-[#333333] bg-[#1F1F1F]">
          <h4 className="font-bold text-white mb-4 text-base uppercase tracking-wide">{t.suggested}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentData.smartQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                disabled={isLoading}
                className="text-left p-5 bg-[#252525] border border-[#333333] rounded-xl hover:border-[#4285F4] hover:bg-[#2A2A2A] transition-all text-gray-200 text-base leading-relaxed font-medium"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef} // ATTACH REF TO THE SCROLLABLE CONTAINER
        className="flex-1 p-6 bg-[#171717] min-h-[400px] overflow-y-auto max-h-[600px] scroll-smooth"
      >
        <div className="space-y-8">
          {messages.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <Bot className="h-16 w-16 text-[#333333] mx-auto mb-6" />
              <p className="text-gray-500 text-xl">{t.empty}</p>
            </div>
          ) : (
            messages.map((message) => {
              const colorClasses = message.decoration ? getColorClasses(message.decoration.color) : getColorClasses('blue');
              return (
                <div key={message.id} className={`flex items-start space-x-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'bot' && (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${message.isError ? 'bg-red-900/20' : 'bg-[#252525] border border-[#333333]'}`}>
                      <Bot className={`h-6 w-6 ${message.isError ? 'text-red-400' : 'text-[#4285F4]'}`} />
                    </div>
                  )}
                  <div className={`max-w-3xl rounded-2xl px-6 py-5 shadow-sm ${message.type === 'user' ? 'bg-[#4285F4] text-white rounded-tr-none' : message.decoration ? `bg-[#202020] border border-[#333333] text-gray-200 border-l-4 ${colorClasses.accent} rounded-tl-none` : 'bg-[#252525] border border-[#333333] text-gray-200 rounded-tl-none'}`}>
                    {message.type === 'bot' && message.decoration && (
                      <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-[#333333]/50">
                        <span className={`text-sm font-bold uppercase px-3 py-1 rounded ${colorClasses.bg} ${colorClasses.icon}`}>
                          {message.metadata?.category}
                        </span>
                      </div>
                    )}
                    <div className="text-lg leading-8 text-gray-200">
                      <ReactMarkdown components={{
                          strong: ({node, ...props}) => <span className="font-bold text-white bg-white/10 px-1 rounded" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="pl-1" {...props} />
                        }}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-12 h-12 bg-[#333333] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {isLoading && (
             <div className="flex items-start space-x-4">
               <div className="w-12 h-12 bg-[#252525] rounded-full flex items-center justify-center border border-[#333333]"><Bot className="h-6 w-6 text-[#4285F4] animate-pulse" /></div>
               <div className="bg-[#252525] rounded-2xl rounded-tl-none px-6 py-5 text-gray-400 text-lg border border-[#333333] flex items-center">
                  <span className="ml-2">{t.thinking}</span>
               </div>
             </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[#333333] p-6 bg-[#171717]">
        {micError && (
            <div className="mb-4 p-4 bg-[#EA4335]/10 border border-[#EA4335]/30 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-[#EA4335] mt-0.5" />
                <p className="text-base text-[#EA4335]">{micError}</p>
            </div>
        )}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.placeholder}
              disabled={isLoading}
              className="w-full resize-none border border-[#333333] rounded-xl px-5 py-4 bg-[#252525] text-white text-lg placeholder-gray-500 focus:outline-none focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] transition-all shadow-inner"
              rows="1"
              style={{ minHeight: '64px' }}
            />
          </div>
          <div className="flex space-x-2">
            <MicrophoneButton onTranscription={handleTranscription} onError={setMicError} selectedLanguage={language} isChatLoading={isLoading} />
            <button 
              onClick={() => handleSubmit()} 
              disabled={!inputValue.trim() || isLoading} 
              className="bg-[#4285F4] text-white w-16 h-16 rounded-xl hover:bg-[#3367D6] transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}