import { useState } from 'react';
import { useRouter } from 'next/router'; 
import { AlertTriangle, ChevronDown, ChevronUp, Info, CheckCircle, Mail, Briefcase, Search } from 'lucide-react';
import PlainLanguageRewriter from './PlainLanguageRewriter'; 

export default function ImportantClauseList({ clauses, language, onClauseClick }) {
  const router = useRouter(); 
  const { docId } = router.query;
  const [expandedSections, setExpandedSections] = useState({ high: true, medium: true, low: false });
  const [negotiatorOpen, setNegotiatorOpen] = useState(false);
  const [selectedClause, setSelectedClause] = useState(null);

  // --- FULL TRANSLATION DICTIONARY (12 Languages) ---
  const translations = {
    en: {
      title: 'AI-Identified Important Clauses',
      subtitle: 'Review flagged clauses grouped by risk severity.',
      highRisk: 'High Risk Clauses',
      mediumRisk: 'Medium Risk Clauses',
      lowRisk: 'Low Risk Clauses',
      clauses: 'clauses',
      riskLevel: 'Risk Level',
      legalAdvice: 'Get Legal Advice',
      draftObjection: 'Draft Objection',
      clauseSuffix: 'Clause',
      clauseTypes: {
        'Payment': 'Payment', 'Termination': 'Termination', 'Liability': 'Liability',
        'Confidentiality': 'Confidentiality', 'Maintenance': 'Maintenance', 'Penalty': 'Penalty',
        'Renewal': 'Renewal', 'Warranty': 'Warranty', 'Eviction': 'Eviction',
        'Assignment': 'Assignment', 'Insurance': 'Insurance', 'Notice': 'Notice',
        'Use': 'Use', 'Collateral': 'Collateral', 'Interest': 'Interest',
        'Default': 'Default', 'Repayment': 'Repayment', 'general': 'General'
      }
    },
    hi: { // Hindi
      title: 'AI द्वारा पहचाने गए महत्वपूर्ण खंड',
      subtitle: 'जोखिम गंभीरता के आधार पर फ्लैग किए गए खंडों की समीक्षा करें।',
      highRisk: 'उच्च जोखिम वाले खंड',
      mediumRisk: 'मध्यम जोखिम वाले खंड',
      lowRisk: 'कम जोखिम वाले खंड',
      clauses: 'खंड',
      riskLevel: 'जोखिम स्तर',
      legalAdvice: 'कानूनी सलाह लें',
      draftObjection: 'आपत्ति ड्राफ्ट करें',
      clauseSuffix: 'खंड',
      clauseTypes: {
        'Payment': 'भुगतान', 'Termination': 'समाप्ति', 'Liability': 'दायित्व',
        'Confidentiality': 'गोपनीयता', 'Maintenance': 'रखरखाव', 'Penalty': 'दंड',
        'Renewal': 'नवीनीकरण', 'Warranty': 'वारंटी', 'Eviction': 'बेदखली',
        'Assignment': 'हस्तांतरण', 'Insurance': 'बीमा', 'Notice': 'नोटिस',
        'Use': 'उपयोग', 'Collateral': 'संपार्श्विक', 'Interest': 'ब्याज',
        'Default': 'डिफ़ॉल्ट', 'Repayment': 'चुकौती', 'general': 'सामान्य'
      }
    },
    bn: { // Bengali
      title: 'AI দ্বারা চিহ্নিত গুরুত্বপূর্ণ ধারা',
      subtitle: 'ঝুঁকির তীব্রতা অনুসারে চিহ্নিত ধারাগুলো পর্যালোচনা করুন।',
      highRisk: 'উচ্চ ঝুঁকির ধারা',
      mediumRisk: 'মাঝারি ঝুঁকির ধারা',
      lowRisk: 'কম ঝুঁকির ধারা',
      clauses: 'ধারা',
      riskLevel: 'ঝুঁকির মাত্রা',
      legalAdvice: 'আইনি পরামর্শ নিন',
      draftObjection: 'আপত্তি লিখুন',
      clauseSuffix: 'ধারা',
      clauseTypes: {
        'Payment': 'পেমেন্ট', 'Termination': 'সমাপ্তি', 'Liability': 'দায়',
        'Confidentiality': 'গোপনীয়তা', 'Maintenance': 'রক্ষণাবেক্ষণ', 'Penalty': 'জরিমানা',
        'Renewal': 'নবায়ন', 'Warranty': 'ওয়ারেন্টি', 'Eviction': 'উচ্ছেদ',
        'Assignment': 'হস্তান্তর', 'Insurance': 'বীমা', 'Notice': 'নোটিশ',
        'Use': 'ব্যবহার', 'Collateral': 'জামানত', 'Interest': 'সুদ',
        'Default': 'খেলাপ', 'Repayment': 'পরিশোধ', 'general': 'সাধারণ'
      }
    },
    te: { // Telugu
      title: 'AI గుర్తించిన ముఖ్యమైన నిబంధనలు',
      subtitle: 'రిస్క్ తీవ్రత ఆధారంగా ఫ్లాగ్ చేయబడిన నిబంధనలను సమీక్షించండి.',
      highRisk: 'అధిక రిస్క్ నిబంధనలు',
      mediumRisk: 'మధ్యస్థ రిస్క్ నిబంధనలు',
      lowRisk: 'తక్కువ రిస్క్ నిబంధనలు',
      clauses: 'నిబంధనలు',
      riskLevel: 'రిస్క్ స్థాయి',
      legalAdvice: 'న్యాయ సలహా పొందండి',
      draftObjection: 'అభ్యంతరం రాయండి',
      clauseSuffix: 'నిబంధన',
      clauseTypes: {
        'Payment': 'చెల్లింపు', 'Termination': 'రద్దు', 'Liability': 'బాధ్యత',
        'Confidentiality': 'గోప్యత', 'Maintenance': 'నిర్వహణ', 'Penalty': 'జరిమానా',
        'Renewal': 'పునరుద్ధరణ', 'Warranty': 'వారెంటీ', 'Eviction': 'ఖాళీ చేయించడం',
        'Assignment': 'బదిలీ', 'Insurance': 'భీమా', 'Notice': 'నోటీసు',
        'Use': 'వినియోగం', 'Collateral': 'తాకట్టు', 'Interest': 'వడ్డీ',
        'Default': 'డిఫాల్ట్', 'Repayment': 'తిరిగి చెల్లింపు', 'general': 'సాధారణ'
      }
    },
    mr: { // Marathi
      title: 'AI ने ओळखलेली महत्त्वाची कलमे',
      subtitle: 'जोखिम तीव्रतेनुसार फ्लॅग केलेल्या कलमांचे पुनरावलोकन करा.',
      highRisk: 'उच्च जोखीम कलमे',
      mediumRisk: 'मध्यम जोखीम कलमे',
      lowRisk: 'कमी जोखीम कलमे',
      clauses: 'कलमे',
      riskLevel: 'जोखीम स्तर',
      legalAdvice: 'कायदेशीर सल्ला घ्या',
      draftObjection: 'आक्षेप मसुदा करा',
      clauseSuffix: 'कलम',
      clauseTypes: {
        'Payment': 'देयक', 'Termination': 'समाप्ती', 'Liability': 'दायित्व',
        'Confidentiality': 'गोपनीयता', 'Maintenance': 'देखभाल', 'Penalty': 'दंड',
        'Renewal': 'नूतनीकरण', 'Warranty': 'हमी', 'Eviction': 'बेदखल',
        'Assignment': 'हस्तांतरण', 'Insurance': 'विमा', 'Notice': 'सूचना',
        'Use': 'वापर', 'Collateral': 'तारण', 'Interest': 'व्याज',
        'Default': 'कसूर', 'Repayment': 'परतफेड', 'general': 'सामान्य'
      }
    },
    ta: { // Tamil
      title: 'AI கண்டறிந்த முக்கிய பிரிவுகள்',
      subtitle: 'ஆபத்து தீவிரத்தின் அடிப்படையில் குறிக்கப்பட்ட பிரிவுகளை மதிப்பாய்வு செய்யவும்.',
      highRisk: 'அதிக ஆபத்துள்ள பிரிவுகள்',
      mediumRisk: 'நடுத்தர ஆபத்துள்ள பிரிவுகள்',
      lowRisk: 'குறைந்த ஆபத்துள்ள பிரிவுகள்',
      clauses: 'பிரிவுகள்',
      riskLevel: 'ஆபத்து நிலை',
      legalAdvice: 'சட்ட ஆலோசனை பெறுங்கள்',
      draftObjection: 'எதிர்ப்பு வரைவு',
      clauseSuffix: 'பிரிவு',
      clauseTypes: {
        'Payment': 'கட்டணம்', 'Termination': 'முடிவுறுத்தல்', 'Liability': 'பொறுப்பு',
        'Confidentiality': 'ரகசியத்தன்மை', 'Maintenance': 'பராமரிப்பு', 'Penalty': 'அபராதம்',
        'Renewal': 'புதுப்பித்தல்', 'Warranty': 'உத்தரவாதம்', 'Eviction': 'வெளியேற்றம்',
        'Assignment': 'உரிமை மாற்றம்', 'Insurance': 'காப்பீடு', 'Notice': 'அறிவிப்பு',
        'Use': 'பயன்பாடு', 'Collateral': 'பிணையம்', 'Interest': 'வட்டி',
        'Default': 'தவறுதல்', 'Repayment': 'திருப்பிச் செலுத்துதல்', 'general': 'பொது'
      }
    },
    ur: { // Urdu
      title: 'AI کی شناخت کردہ اہم شقیں',
      subtitle: 'خطرے کی شدت کی بنیاد پر نشان زد شقوں کا جائزہ لیں۔',
      highRisk: 'زیادہ خطرے والی شقیں',
      mediumRisk: 'درمیانے خطرے والی شقیں',
      lowRisk: 'کم خطرے والی شقیں',
      clauses: 'شقیں',
      riskLevel: 'خطرے کی سطح',
      legalAdvice: 'قانونی مشورہ لیں',
      draftObjection: 'اعتراض کا مسودہ',
      clauseSuffix: 'شق',
      clauseTypes: {
        'Payment': 'ادائیگی', 'Termination': 'خاتمہ', 'Liability': 'ذمہ داری',
        'Confidentiality': 'رازداری', 'Maintenance': 'دیکھ بھال', 'Penalty': 'جرمانہ',
        'Renewal': 'تجدید', 'Warranty': 'وارنٹی', 'Eviction': 'بے دخلی',
        'Assignment': 'منتقلی', 'Insurance': 'انشورنس', 'Notice': 'نوٹس',
        'Use': 'استعمال', 'Collateral': 'ضمانت', 'Interest': 'سود',
        'Default': 'ڈیفالٹ', 'Repayment': 'واپسی', 'general': 'عام'
      }
    },
    gu: { // Gujarati
      title: 'AI દ્વારા ઓળખાયેલ મહત્વપૂર્ણ કલમો',
      subtitle: 'જોખમની તીવ્રતાના આધારે ચિહ્નિત કલમોની સમીક્ષા કરો.',
      highRisk: 'ઉચ્ચ જોખમ કલમો',
      mediumRisk: 'મધ્યમ જોખમ કલમો',
      lowRisk: 'ઓછા જોખમ કલમો',
      clauses: 'કલમો',
      riskLevel: 'જોખમ સ્તર',
      legalAdvice: 'કાનૂની સલાહ લો',
      draftObjection: 'વાંધો લખો',
      clauseSuffix: 'કલમ',
      clauseTypes: {
        'Payment': 'ચુકવણી', 'Termination': 'સમાપ્તિ', 'Liability': 'જવાબદારી',
        'Confidentiality': 'ગોપનીયતા', 'Maintenance': 'જાળવણી', 'Penalty': 'દંડ',
        'Renewal': 'નવીકરણ', 'Warranty': 'વોરંટી', 'Eviction': 'ખાલી કરાવવું',
        'Assignment': 'હસ્તાંતરણ', 'Insurance': 'વીમો', 'Notice': 'નોટિસ',
        'Use': 'ઉપયોગ', 'Collateral': 'જાામીનગીરી', 'Interest': 'વ્યાજ',
        'Default': 'ડિફોલ્ટ', 'Repayment': 'પુનઃચુકવણી', 'general': 'સામાન્ય'
      }
    },
    kn: { // Kannada
      title: 'AI ಗುರುತಿಸಿದ ಪ್ರಮುಖ ಷರತ್ತುಗಳು',
      subtitle: 'ಅಪಾಯದ ತೀವ್ರತೆಯ ಆಧಾರದ ಮೇಲೆ ಷರತ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      highRisk: 'ಅಧಿಕ ಅಪಾಯದ ಷರತ್ತುಗಳು',
      mediumRisk: 'ಮಧ್ಯಮ ಅಪಾಯದ ಷರತ್ತುಗಳು',
      lowRisk: 'ಕಡಿಮೆ ಅಪಾಯದ ಷರತ್ತುಗಳು',
      clauses: 'ಷರತ್ತುಗಳು',
      riskLevel: 'ಅಪಾಯದ ಮಟ್ಟ',
      legalAdvice: 'ಕಾನೂನು ಸಲಹೆ ಪಡೆಯಿರಿ',
      draftObjection: 'ಆಕ್ಷೇಪಣೆ ಬರೆಯಿರಿ',
      clauseSuffix: 'ಷರತ್ತು',
      clauseTypes: {
        'Payment': 'ಪಾವತಿ', 'Termination': 'ಮುಕ್ತಾಯ', 'Liability': 'ಹೊಣೆಗಾರಿಕೆ',
        'Confidentiality': 'ಗೌಪ್ಯತೆ', 'Maintenance': 'ನಿರ್ವಹಣೆ', 'Penalty': 'ದಂಡ',
        'Renewal': 'ನವೀಕರಣ', 'Warranty': 'ಖಾತರಿ', 'Eviction': 'ತೆರವುಗೊಳಿಸುವಿಕೆ',
        'Assignment': 'ವರ್ಗಾವಣೆ', 'Insurance': 'ವಿಮೆ', 'Notice': 'ಸೂಚನೆ',
        'Use': 'ಬಳಕೆ', 'Collateral': 'ಭದ್ರತೆ', 'Interest': 'ಬಡ್ಡಿ',
        'Default': 'ಸುಸ್ತಿದಾರ', 'Repayment': 'ಮರುಪಾವತಿ', 'general': 'ಸಾಮಾನ್ಯ'
      }
    },
    ml: { // Malayalam
      title: 'AI തിരിച്ചറിഞ്ഞ പ്രധാന വ്യവസ്ഥകൾ',
      subtitle: 'അപകടസാധ്യതയനുസരിച്ച് തരംതിരിച്ച വ്യവസ്ഥകൾ പരിശോധിക്കുക.',
      highRisk: 'ഉയർന്ന അപകടസാധ്യതയുള്ളവ',
      mediumRisk: 'ഇടത്തരം അപകടസാധ്യതയുള്ളവ',
      lowRisk: 'കുറഞ്ഞ അപകടസാധ്യതയുള്ളവ',
      clauses: 'വ്യവസ്ഥകൾ',
      riskLevel: 'അപകട നില',
      legalAdvice: 'നിയമോപദേശം നേടുക',
      draftObjection: 'എതിർപ്പ് തയ്യാറാക്കുക',
      clauseSuffix: 'വകുപ്പ്',
      clauseTypes: {
        'Payment': 'പേയ്മെന്റ്', 'Termination': 'അവസാനിപ്പിക്കൽ', 'Liability': 'ബാധ്യത',
        'Confidentiality': 'രഹസ്യസ്വഭാവം', 'Maintenance': 'പരിപാലനം', 'Penalty': 'പിഴ',
        'Renewal': 'പുതുക്കൽ', 'Warranty': 'വാറന്റി', 'Eviction': 'ഒഴിപ്പിക്കൽ',
        'Assignment': 'കൈമാറ്റം', 'Insurance': 'ഇൻഷുറൻസ്', 'Notice': 'നോട്ടീസ്',
        'Use': 'ഉപയോഗം', 'Collateral': 'ഈട്', 'Interest': 'പലിശ',
        'Default': 'വീഴ്ച', 'Repayment': 'തിരിച്ചടവ്', 'general': 'പൊതുവായ'
      }
    },
    pa: { // Punjabi
      title: 'AI ਦੁਆਰਾ ਪਛਾਣੀਆਂ ਗਈਆਂ ਮਹੱਤਵਪੂਰਨ ਧਾਰਾਵਾਂ',
      subtitle: 'ਜੋਖਮ ਦੀ ਗੰਭੀਰਤਾ ਦੇ ਅਧਾਰ ਤੇ ਧਾਰਾਵਾਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ।',
      highRisk: 'ਉੱਚ ਜੋਖਮ ਵਾਲੀਆਂ ਧਾਰਾਵਾਂ',
      mediumRisk: 'ਦਰਮਿਆਨੇ ਜੋਖਮ ਵਾਲੀਆਂ ਧਾਰਾਵਾਂ',
      lowRisk: 'ਘੱਟ ਜੋਖਮ ਵਾਲੀਆਂ ਧਾਰਾਵਾਂ',
      clauses: 'ਧਾਰਾਵਾਂ',
      riskLevel: 'ਜੋਖਮ ਪੱਧਰ',
      legalAdvice: 'ਕਾਨੂੰਨੀ ਸਲਾਹ ਲਓ',
      draftObjection: 'ਇਤਰਾਜ਼ ਲਿਖੋ',
      clauseSuffix: 'ਧਾਰਾ',
      clauseTypes: {
        'Payment': 'ਭੁਗਤਾਨ', 'Termination': 'ਸਮਾਪਤੀ', 'Liability': 'ਦੇਣਦਾਰੀ',
        'Confidentiality': 'ਗੁਪਤਤਾ', 'Maintenance': 'ਸੰਭਾਲ', 'Penalty': 'ਜੁਰਮਾਨਾ',
        'Renewal': 'ਨਵਿਆਉਣ', 'Warranty': 'ਵਾਰੰਟੀ', 'Eviction': 'ਬੇਦਖਲੀ',
        'Assignment': 'ਤਬਾਦਲਾ', 'Insurance': 'ਬੀਮਾ', 'Notice': 'ਨੋਟਿਸ',
        'Use': 'ਵਰਤੋਂ', 'Collateral': 'ਜ਼ਮਾਨਤ', 'Interest': 'ਵਿਆਜ',
        'Default': 'ਡਿਫਾਲਟ', 'Repayment': 'ਮੋੜਨਾ', 'general': 'ਆਮ'
      }
    },
    or: { // Odia
      title: 'AI ଦ୍ୱାରା ଚିହ୍ନଟ ହୋଇଥିବା ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଧାରା',
      subtitle: 'ବିପଦର ଗମ୍ଭୀରତା ଅନୁଯାୟୀ ଧାରାଗୁଡ଼ିକର ସମୀକ୍ଷା କରନ୍ତୁ।',
      highRisk: 'ଉଚ୍ଚ ବିପଦ ଧାରା',
      mediumRisk: 'ମଧ୍ୟମ ବିପଦ ଧାରା',
      lowRisk: 'କମ୍ ବିପଦ ଧାରା',
      clauses: 'ଧାରା',
      riskLevel: 'ବିପଦ ସ୍ତର',
      legalAdvice: 'ଆଇନଗତ ପରାମର୍ଶ ନିଅନ୍ତୁ',
      draftObjection: 'ଆପତ୍ତି ଲେଖନ୍ତୁ',
      clauseSuffix: 'ଧାରା',
      clauseTypes: {
        'Payment': 'ଦେୟ', 'Termination': 'ସମାପ୍ତି', 'Liability': 'ଦାୟିତ୍ୱ',
        'Confidentiality': 'ଗୋପନୀୟତା', 'Maintenance': 'ରକ୍ଷଣାବେକ୍ଷଣ', 'Penalty': 'ଜରିମାନା',
        'Renewal': 'ନବୀକରଣ', 'Warranty': 'ୱାରେଣ୍ଟି', 'Eviction': 'ଉଚ୍ଛେଦ',
        'Assignment': 'ହସ୍ତାନ୍ତର', 'Insurance': 'ବୀମା', 'Notice': 'ନୋଟିସ୍',
        'Use': 'ବ୍ୟବହାର', 'Collateral': 'ବନ୍ଧକ', 'Interest': 'ସୁଧ',
        'Default': 'ଖିଲାପ', 'Repayment': 'ପରିଶୋଧ', 'general': 'ସାଧାରଣ'
      }
    }
  };

  const t = translations[language] || translations.en;

  // Helper to translate clause type
  const getTranslatedType = (type) => {
    // Try exact match, or capitalize and match (e.g. 'payment' -> 'Payment')
    const key = type.charAt(0).toUpperCase() + type.slice(1);
    const map = t.clauseTypes || translations.en.clauseTypes;
    return map[key] || map[type] || type; 
  };

  const categorizedClauses = clauses.reduce((acc, clause) => {
    const category = clause.riskCategory || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(clause);
    return acc;
  }, {});

  const handleLegalAdviceClick = () => {
    if (docId) router.push(`/subscription?docId=${docId}`);
    else router.push('/subscription');
  };

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const openNegotiator = (clause) => {
    setSelectedClause(clause);
    setNegotiatorOpen(true);
  };

  const SectionHeader = ({ icon: Icon, title, count, section, colorClass }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-5 bg-[#171717] border border-[#333333] rounded-lg hover:bg-[#202020] transition-colors mb-4 group"
    >
      <div className="flex items-center space-x-4">
        <Icon className={`h-6 w-6 ${colorClass}`} />
        <h4 className="text-xl font-bold text-white group-hover:text-gray-200">{title}</h4>
        <span className="text-sm text-gray-400 bg-[#252525] px-3 py-1 rounded border border-[#333333]">{count} {t.clauses}</span>
      </div>
      {expandedSections[section] ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
    </button>
  );

  const renderClauseCard = (clause, index) => {
    const config = {
      high: { border: 'border-[#EA4335]', text: 'text-[#EA4335]', bgBadge: 'bg-[#EA4335]/20', bgTint: 'bg-[#EA4335]/10 hover:bg-[#EA4335]/20' },
      medium: { border: 'border-[#FBBC05]', text: 'text-[#FBBC05]', bgBadge: 'bg-[#FBBC05]/20', bgTint: 'bg-[#FBBC05]/10 hover:bg-[#FBBC05]/20' },
      low: { border: 'border-[#34A853]', text: 'text-[#34A853]', bgBadge: 'bg-[#34A853]/20', bgTint: 'bg-[#34A853]/10 hover:bg-[#34A853]/20' },
      general: { border: 'border-gray-600', text: 'text-gray-400', bgBadge: 'bg-gray-800', bgTint: 'bg-[#202020] hover:bg-[#2A2A2A]' }
    };
    const style = config[clause.riskCategory] || config.general;

    return (
      <div 
        key={index} 
        onClick={() => onClauseClick && onClauseClick(clause.text)}
        className={`rounded-xl p-6 mb-5 border ${style.border} ${style.bgTint} shadow-md transition-all duration-200 cursor-pointer group relative`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
             {/* TRANSLATED TITLE: "Assignment Clause" -> "हस्तांतरण खंड" */}
             <span className="font-bold text-white text-2xl block capitalize mb-2">
                {getTranslatedType(clause.type)} {t.clauseSuffix}
             </span>
             <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded ${style.bgBadge} ${style.text}`}>
                {t.riskLevel}: {clause.riskScore}/5
             </span>
          </div>
          
          <div className="flex space-x-2">
            {clause.riskCategory === 'high' && (
                <button 
                onClick={(e) => { e.stopPropagation(); handleLegalAdviceClick(); }}
                className="flex items-center space-x-2 bg-[#EA4335] text-white px-4 py-2 rounded-lg hover:bg-[#D93025] transition-colors shadow-md text-sm font-bold"
                >
                <Briefcase className="h-4 w-4" />
                <span>{t.legalAdvice}</span>
                </button>
            )}
            {(clause.riskCategory === 'high' || clause.riskCategory === 'medium') && (
                <button 
                onClick={(e) => { e.stopPropagation(); openNegotiator(clause); }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-bold"
                >
                <Mail className="h-4 w-4" />
                <span>{t.draftObjection}</span>
                </button>
            )}
          </div>
        </div>
        
        <div className="bg-[#171717]/60 p-5 rounded-lg border border-[#333333] mb-5 backdrop-blur-sm group-hover:border-gray-500 transition-colors">
           <p className="text-lg text-gray-300 italic leading-relaxed">"{clause.text}"</p>
        </div>

        <div className="border-t border-[#333333]/50 pt-5" onClick={(e) => e.stopPropagation()}>
          <PlainLanguageRewriter clause={clause} language={language} />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#171717] rounded-xl shadow-sm border border-[#333333] p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center mb-2">
          <AlertTriangle className="h-7 w-7 text-[#EA4335] mr-3" />
          {t.title}
        </h2>
        <p className="text-gray-400 text-base">{t.subtitle}</p>
      </div>

      {categorizedClauses.high?.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={AlertTriangle} title={t.highRisk} count={categorizedClauses.high.length} section="high" colorClass="text-[#EA4335]" />
          {expandedSections.high && categorizedClauses.high.map(renderClauseCard)}
        </div>
      )}
      
      {categorizedClauses.medium?.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={Info} title={t.mediumRisk} count={categorizedClauses.medium.length} section="medium" colorClass="text-[#FBBC05]" />
          {expandedSections.medium && categorizedClauses.medium.map(renderClauseCard)}
        </div>
      )}

      {categorizedClauses.low?.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={CheckCircle} title={t.lowRisk} count={categorizedClauses.low.length} section="low" colorClass="text-[#34A853]" />
          {expandedSections.low && categorizedClauses.low.map(renderClauseCard)}
        </div>
      )}

      
    </div>
  );
}