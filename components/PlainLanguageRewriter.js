// components/PlainLanguageRewriter.js

import { useState } from 'react';
import { Sparkles, ArrowRight, Loader } from 'lucide-react';

export default function PlainLanguageRewriter({ clause, language }) {
  const [simplified, setSimplified] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  // Translation dictionary (EXPANDED TO ALL SUPPORTED LANGUAGES)
  const translations = {
    en: {
      title: 'Simplification Tool',
      button: 'Simplify This Clause',
      loadingText: 'Simplifying...',
      original: 'Original',
      simplified: 'Simplified',
      levelLegal: 'Reading Level: Legal',
      levelPlain: 'Reading Level: Plain English',
      proTip: 'Pro Tip: The simplified version is for understanding only. The original legal text is what\'s legally binding.'
    },
    hi: {
      title: 'सरलीकरण उपकरण',
      button: 'इस धारा को सरल करें',
      loadingText: 'सरल किया जा रहा है...',
      original: 'मूल',
      simplified: 'सरलीकृत',
      levelLegal: 'पठन स्तर: कानूनी',
      levelPlain: 'पठन स्तर: सरल भाषा',
      proTip: 'प्रो टिप: सरलीकृत संस्करण केवल समझने के लिए है। मूल कानूनी पाठ कानूनी रूप से बाध्यकारी है।'
    },
    es: {
      title: 'Herramienta de Simplificación',
      button: 'Simplificar Cláusula',
      loadingText: 'Simplificando...',
      original: 'Original',
      simplified: 'Simplificado',
      levelLegal: 'Nivel de Lectura: Legal',
      levelPlain: 'Nivel de Lectura: Lenguaje Sencillo',
      proTip: 'Consejo Pro: La versión simplificada es solo para comprensión. El texto legal original es el legalmente vinculante.'
    },
    bn: {
      title: 'সরলীকরণ সরঞ্জাম',
      button: 'এই ধারা সরল করুন',
      loadingText: 'সরলীকরণ চলছে...',
      original: 'আসল',
      simplified: 'সরলীকৃত',
      levelLegal: 'পঠন স্তর: আইনি',
      levelPlain: 'পঠন স্তর: সাধারণ ভাষা',
      proTip: 'পরামর্শ: সরলীকৃত সংস্করণ শুধুমাত্র বোঝার জন্য। আসল আইনি পাঠ্যই আইনত বাধ্যতামূলক।'
    },
    te: {
      title: 'సరళీకరణ సాధనం',
      button: 'ఈ నిబంధనను సరళీకరించు',
      loadingText: 'సరళీకరిస్తోంది...',
      original: 'అసలు',
      simplified: 'సరళీకరించబడింది',
      levelLegal: 'పఠన స్థాయి: చట్టపరమైన',
      levelPlain: 'పఠన స్థాయి: సరళమైన భాష',
      proTip: 'ప్రో చిట్కా: సరళీకృత వెర్షన్ అర్థం చేసుకోవడానికి మాత్రమే. అసలు చట్టపరమైన పాఠం చట్టబద్ధంగా కట్టుబడి ఉంటుంది.'
    },
    mr: {
      title: 'सरलीकरण साधन',
      button: 'हे कलम सरल करा',
      loadingText: 'सरल करीत आहे...',
      original: 'मूळ',
      simplified: 'सरलीकृत',
      levelLegal: 'वाचन स्तर: कायदेशीर',
      levelPlain: 'वाचन स्तर: साधी भाषा',
      proTip: 'प्रो टीप: सरलीकृत आवृत्ती केवळ समजून घेण्यासाठी आहे. मूळ कायदेशीर मजकूर कायदेशीररित्या बंधनकारक आहे.'
    },
    ta: {
      title: 'எளிமைப்படுத்தல் கருவி',
      button: 'இந்த பிரிவை எளிதாக்கு',
      loadingText: 'எளிமைப்படுத்துகிறது...',
      original: 'அசல்',
      simplified: 'எளிதாக்கப்பட்டது',
      levelLegal: 'வாசிப்பு நிலை: சட்டப்பூர்வமானது',
      levelPlain: 'வாசிப்பு நிலை: எளிய மொழி',
      proTip: 'புரோ உதவிக்குறிப்பு: எளிதாக்கப்பட்ட பதிப்பு புரிந்துகொள்வதற்கு மட்டுமே. அசல் சட்டப்பூர்வ உரை சட்டப்படி பிணைக்கும்.'
    },
    ur: {
      title: 'آسان بنانے کا آلہ',
      button: 'اس شق کو آسان کریں',
      loadingText: 'آسان بنایا جا رہا ہے...',
      original: 'اصل',
      simplified: 'آسان شدہ',
      levelLegal: 'پڑھنے کی سطح: قانونی',
      levelPlain: 'پڑھنے کی سطح: سادہ زبان',
      proTip: 'پرو ٹپ: آسان شدہ ورژن صرف سمجھنے کے لیے ہے۔ اصل قانونی متن قانونی طور پر پابند ہے۔'
    },
    gu: {
      title: 'સરળ બનાવવાનું સાધન',
      button: 'આ કલમ સરળ કરો',
      loadingText: 'સરળ કરી રહ્યું છે...',
      original: 'મૂળ',
      simplified: 'સરળ કરેલ',
      levelLegal: 'વાંચન સ્તર: કાનૂની',
      levelPlain: 'વાંચન સ્તર: સાદી ભાષા',
      proTip: 'પ્રો ટિપ: સરળ કરેલ સંસ્કરણ ફક્ત સમજણ માટે છે. મૂળ કાનૂની ટેક્સ્ટ કાયદેસર રીતે બંધનકર્તા છે.'
    },
    kn: {
      title: 'ಸರಳೀಕರಣ ಸಾಧನ',
      button: 'ಈ ಷರತ್ತನ್ನು ಸರಳಗೊಳಿಸಿ',
      loadingText: 'ಸರಳೀಕರಿಸಲಾಗುತ್ತಿದೆ...',
      original: 'ಮೂಲ',
      simplified: 'ಸರಳೀಕೃತ',
      levelLegal: 'ಓದುವ ಮಟ್ಟ: ಕಾನೂನು',
      levelPlain: 'ಓದುವ ಮಟ್ಟ: ಸರಳ ಭಾಷೆ',
      proTip: 'ಪ್ರೊ ಸಲಹೆ: ಸರಳೀಕೃತ ಆವೃತ್ತಿಯು ತಿಳುವಳಿಕೆಗಾಗಿ ಮಾತ್ರ. ಮೂಲ ಕಾನೂನು ಪಠ್ಯವು ಕಾನೂನುಬದ್ಧವಾಗಿ ಬಂಧಿಸುತ್ತದೆ.'
    },
    ml: {
      title: 'ലളിതമാക്കൽ ഉപകരണം',
      button: 'ഈ വ്യവസ്ഥ ലളിതമാക്കുക',
      loadingText: 'ലളിതമാക്കുന്നു...',
      original: 'യഥാർത്ഥ',
      simplified: 'ലളിതമാക്കിയത്',
      levelLegal: 'വായനാ നിലവാരം: നിയമപരം',
      levelPlain: 'വായനാ നിലവാരം: ലളിതമായ ഭാഷ',
      proTip: 'പ്രോ ടിപ്പ്: ലളിതമാക്കിയ പതിപ്പ് മനസ്സിലാക്കാൻ മാത്രമുള്ളതാണ്. യഥാർത്ഥ നിയമപരമായ പാഠമാണ് നിയമപരമായി ബാധ്യതയുള്ളത്.'
    },
    pa: {
      title: 'ਸਰਲੀਕਰਨ ਟੂਲ',
      button: 'ਇਸ ਧਾਰਾ ਨੂੰ ਸਰਲ ਕਰੋ',
      loadingText: 'ਸਰਲ ਕਰ ਰਿਹਾ ਹੈ...',
      original: 'ਮੂਲ',
      simplified: 'ਸਰਲ ਕੀਤਾ ਗਿਆ',
      levelLegal: 'ਪੜ੍ਹਨ ਦਾ ਪੱਧਰ: ਕਾਨੂੰਨੀ',
      levelPlain: 'ਪੜ੍ਹਨ ਦਾ ਪੱਧਰ: ਸਾਦੀ ਭਾਸ਼ਾ',
      proTip: 'ਪ੍ਰੋ ਟਿਪ: ਸਰਲ ਕੀਤਾ ਗਿਆ ਸੰਸਕਰਣ ਸਿਰਫ਼ ਸਮਝਣ ਲਈ ਹੈ। ਮੂਲ ਕਾਨੂੰਨੀ ਪਾਠ ਕਾਨੂੰਨੀ ਤੌਰ \'ਤੇ ਬੰਧਨਕਾਰੀ ਹੈ।'
    },
    or: {
      title: 'ସରଳୀକରଣ ଉପକରଣ',
      button: 'ଏହି ଧାରାକୁ ସରଳ କରନ୍ତୁ',
      loadingText: 'ସରଳ କରାଯାଉଛି...',
      original: 'ମୂଳ',
      simplified: 'ସରଳୀକୃତ',
      levelLegal: 'ପଠନ ସ୍ତର: ଆଇନଗତ',
      levelPlain: 'ପଠନ ସ୍ତର: ସରଳ ଭାଷା',
      proTip: 'ପ୍ରୋ ଟିପ୍: ସରଳୀକୃତ ସଂସ୍କରଣ କେବଳ ବୁଝିବା ପାଇଁ। ମୂଳ ଆଇନଗତ ପାଠ୍ୟ ବୈଧାନିକ ଭାବରେ ବାଧ୍ୟତାମୂଳକ।'
    },
  };

  const t = translations[language] || translations.en;

  const simplifyClause = async () => {
    setLoading(true);
    // CRITICAL: Ensure we use the correct API endpoint /api/simplify
    try {
      const res = await fetch('/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clause.text, type: clause.type }) // Pass clause text and type
      });
      const result = await res.json();
      
      if (result.simplified) {
        setSimplified(result.simplified);
        setShowComparison(true);
      } else {
        throw new Error(result.error || 'Simplification failed on the server.');
      }
    } catch (err) {
      console.error('Simplification Error:', err);
      setSimplified('Failed to simplify the clause. Please check the API backend.');
      setShowComparison(true);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-lg p-4 bg-gray-900/50 border border-gray-700">
      <div className="flex items-center justify-between">
        {/* FIXED: Added title translation */}
        <h3 className="text-white font-medium text-sm">{t.title}</h3>
        <button
          onClick={simplifyClause}
          disabled={loading}
          className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm transition-all"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {/* FIXED: Added button translation */}
          <span>{loading ? t.loadingText : t.button}</span>
        </button>
      </div>

      {/* Comparison/Preview Section */}
      {showComparison && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {/* FIXED: Added original and level translation */}
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{t.original}</span>
              <span className="text-xs text-gray-500">{t.levelLegal}</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-600 max-h-40 overflow-y-auto">
              <p className="text-gray-300 text-xs">{clause.text}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {/* FIXED: Added simplified and level translation */}
              <span className="text-xs bg-green-700 text-green-200 px-2 py-1 rounded">{t.simplified}</span>
              <span className="text-xs text-green-400">{t.levelPlain}</span>
            </div>
            <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30 max-h-40 overflow-y-auto">
              <p className="text-green-100 text-xs leading-relaxed">{simplified}</p>
            </div>
          </div>
        </div>
      )}

      {showComparison && (
        <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          {/* FIXED: Added pro tip translation */}
          <p className="text-blue-200 text-xs">
            💡 <strong>{t.proTip.split(':')[0]}:</strong> {t.proTip.split(':')[1]}
          </p>
        </div>
      )}
    </div>
  );
}