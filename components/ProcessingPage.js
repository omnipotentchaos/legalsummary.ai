import { FileText, CheckCircle, Sparkles, Activity, ScanLine, Lock, XCircle } from 'lucide-react';

export default function ProcessingPage({ fileName, progress = 0, language = 'en', onCancel }) {
  
  const translations = {
    en: { scanning: 'Scanning Document...This usually takes a minute to analyse', analyzing: 'AI is analyzing', powered: 'Powered by Google Cloud AI', cancel: 'Cancel Analysis', steps: ['Extracting text layers', 'Analyzing legal clauses', 'Detecting risks & penalties', 'Generating plain-language summary'] },
    hi: { scanning: 'दस्तावेज़ स्कैन किया जा रहा है...', analyzing: 'AI विश्लेषण कर रहा है',  powered: 'Google Cloud AI द्वारा संचालित', cancel: 'विश्लेषण रद्द करें', steps: ['टेक्स्ट परतें निकाली जा रही हैं', 'कानूनी खंडों का विश्लेषण', 'जोखिम और दंड का पता लगाना', 'सरल भाषा सारांश उत्पन्न करना'] },
    // ... (Keep existing translations, add 'cancel' key to all)
    mr: { scanning: 'दस्तऐवज स्कॅन करत आहे...', analyzing: 'AI विश्लेषण करत आहे',  powered: 'Google Cloud AI द्वारे समर्थित', cancel: 'विश्लेषण रद्द करा', steps: ['मजकूर स्तर काढत आहे', 'कायदेशीर कलमांचे विश्लेषण', 'जोखीम आणि दंड शोधणे', 'सोप्या भाषेत सारांश तयार करणे'] },
    bn: { scanning: 'স্ক্যান করা হচ্ছে...', analyzing: 'AI বিশ্লেষণ করছে', powered: 'Google AI দ্বারা চালিত', cancel: 'বাতিল করুন', steps: ['পাঠ্য বের করা হচ্ছে', 'আইনি ধারা বিশ্লেষণ', 'ঝুঁকি শনাক্তকরণ', 'সারসংক্ষেপ তৈরি'] },
    te: { scanning: 'స్కాన్ చేస్తోంది...', analyzing: 'AI విశ్లేషిస్తోంది',  powered: 'Google AI ద్వారా', cancel: 'రద్దు చేయండి', steps: ['టెక్స్ట్ వెలికితీత', 'చట్టపరమైన నిబంధనల విశ్లేషణ', 'ప్రమాదాల గుర్తింపు', 'సారాంశం తయారీ'] },
    // Fallback for others
    ta: { scanning: 'ஸ்கேன் செய்யப்படுகிறது...', analyzing: 'AI பகுப்பாய்வு செய்கிறது',  powered: 'Google AI', cancel: 'ரத்துசெய்', steps: ['உரை பிரித்தெடுத்தல்', 'சட்டப் பிரிவு பகுப்பாய்வு', 'ஆபத்து கண்டறிதல்', 'சுருக்கம் உருவாக்குதல்'] },
    gu: { scanning: 'સ્કેનિંગ...', analyzing: 'વિશ્લેષણ કરી રહ્યું છે', powered: 'Google AI', cancel: 'રદ કરો', steps: ['ટેક્સ્ટ એક્સટ્રેક્શન', 'કાનૂની કલમ વિશ્લેષણ', 'જોખમ શોધ', 'સારાંશ'] },
    kn: { scanning: 'ಸ್ಕ್ಯಾನಿಂಗ್...', analyzing: 'ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ',  powered: 'Google AI', cancel: 'ರದ್ದುಮಾಡಿ', steps: ['ಪಠ್ಯ ತೆಗೆಯುವಿಕೆ', 'ಕಾನೂನು ಷರತ್ತು ವಿಶ್ಲೇಷಣೆ', 'ಅಪಾಯ ಪತ್ತೆ', 'ಸಾರಾಂಶ'] },
    ml: { scanning: 'സ്കാൻ ചെയ്യുന്നു...', analyzing: 'വിശകലനം ചെയ്യുന്നു',  powered: 'Google AI', cancel: 'റദ്ദാക്കുക', steps: ['ടെക്സ്റ്റ് വേർതിരിക്കൽ', 'നിയമ വിശകലനം', 'അപകടം കണ്ടെത്തൽ', 'സംഗ്രഹം'] },
    pa: { scanning: 'ਸਕੈਨਿੰਗ...', analyzing: 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ',  powered: 'Google AI', cancel: 'ਰੱਦ ਕਰੋ', steps: ['ਟੈਕਸਟ ਕੱਢਣਾ', 'ਕਾਨੂੰਨੀ ਧਾਰਾਵਾਂ', 'ਜੋਖਮ ਪਛਾਣ', 'ਸਾਰ'] },
    or: { scanning: 'ସ୍କାନିଂ...', analyzing: 'ବିଶ୍ଳେଷଣ କରୁଛି', powered: 'Google AI', cancel: 'ବାତିଲ୍ କରନ୍ତୁ', steps: ['ପାଠ୍ୟ ବାହାର କରିବା', 'ଆଇନଗତ ବିଶ୍ଳେଷଣ', 'ବିପଦ ଚିହ୍ନଟ', 'ସାରାଂଶ'] },
    ur: { scanning: 'اسکین ہو رہا ہے...', analyzing: 'تجزیہ ہو رہا ہے',  powered: 'Google AI', cancel: 'منسوخ کریں', steps: ['متن نکالنا', 'قانونی تجزیہ', 'خطرہ کی شناخت', 'خلاصہ'] }
  };

  const t = translations[language] || translations.en;

  const processingSteps = [
    { text: t.steps[0], icon: FileText, threshold: 10 },
    { text: t.steps[1], icon: SearchIcon, threshold: 30 },
    { text: t.steps[2], icon: Activity, threshold: 60 },
    { text: t.steps[3], icon: Sparkles, threshold: 85 }
  ];

  function SearchIcon(props) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center">
        
        {/* ... (Keep existing animation code) ... */}
        <div className="relative mx-auto w-32 h-44 mb-10">
          <div className="absolute inset-0 bg-white rounded-lg shadow-2xl flex flex-col p-3 space-y-2 overflow-hidden">
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-5/6"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-4/5"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            <div className="mt-2 p-1 bg-red-100 rounded border border-red-200">
               <div className="h-1.5 bg-red-300 rounded w-11/12 mb-1"></div>
               <div className="h-1.5 bg-red-300 rounded w-2/3"></div>
            </div>
            <div className="h-2 bg-gray-200 rounded w-full mt-auto"></div>
          </div>
          <div className="absolute left-[-10%] w-[120%] h-1 bg-[#4285F4] shadow-[0_0_15px_rgba(66,133,244,0.8)] z-10 animate-scan"></div>
          <div className="absolute -inset-4 bg-[#4285F4]/20 blur-xl -z-10 rounded-full animate-pulse"></div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">{t.scanning}</h2>
        <p className="text-gray-400 mb-8">{t.analyzing} <span className="text-white font-medium">"{fileName}"</span></p>

        <div className="mb-10 max-w-sm mx-auto">
          <div className="h-1.5 w-full bg-[#333333] rounded-full overflow-hidden">
            <div className="h-full bg-[#4285F4] transition-all duration-500 ease-out shadow-[0_0_10px_#4285F4]" style={{ width: `${Math.max(progress, 5)}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
            <span>{t.start}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="bg-[#171717] border border-[#333333] rounded-xl p-6 text-left space-y-4 max-w-sm mx-auto shadow-lg">
          {processingSteps.map((step, index) => {
            const isCompleted = progress >= step.threshold;
            const isCurrent = progress < step.threshold && progress > (processingSteps[index - 1]?.threshold || 0);
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300 ${isCompleted ? 'bg-[#4285F4] border-[#4285F4] text-white' : isCurrent ? 'border-[#4285F4] text-[#4285F4] animate-pulse' : 'border-gray-600 text-gray-600'}`}>
                  {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : <step.icon className="h-3.5 w-3.5" />}
                </div>
                <span className={`text-sm transition-colors duration-300 ${isCompleted || isCurrent ? 'text-gray-200' : 'text-gray-600'}`}>{step.text}</span>
              </div>
            );
          })}
        </div>

        {/* CANCEL BUTTON ADDED HERE */}
        <div className="mt-8">
            <button 
                onClick={onCancel}
                className="flex items-center justify-center space-x-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-red-900/50 mx-auto"
            >
                <XCircle className="h-4 w-4" />
                <span>{t.cancel}</span>
            </button>
        </div>

        <div className="mt-4 flex items-center justify-center text-xs text-gray-600 space-x-2">
            <Lock className="h-3 w-3" />
            <span>{t.powered}</span>
        </div>
      </div>
      <style jsx>{` @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } } .animate-scan { animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; } `}</style>
    </div>
  );
}