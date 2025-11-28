import { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, Sparkles, CheckSquare, Lock, Check, UserCircle } from 'lucide-react';

export default function UploadPage({ onFileSelect, onProcessingStart, language = 'en' }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('Tenant');
  const fileInputRef = useRef(null);

  // --- FULL TRANSLATION DICTIONARY (12 Languages) ---
  const translations = {
    en: {
      title: 'Legal Document Demystifier',
      subtitle: 'Upload your legal documents and let AI simplify the complex language',
      dragDrop: 'Drag & Drop or Click to Upload',
      formats: 'PDF or DOCX (max 10MB)',
      consentTitle: 'Consent to Process Document',
      consentText: 'I consent to have this document processed by AI for analysis. I understand that:',
      consent1: 'The document will be temporarily stored and processed using Google Cloud AI',
      consent2: 'AI-generated analysis is for informational purposes only',
      consent3: 'I should consult qualified legal counsel for binding advice',
      analyzeBtn: 'Analyze Document',
      acceptBtn: 'Accept Terms to Analyze',
      personaLabel: 'Analyze from perspective of:',
      footer: 'Powered by Google Cloud AI • Secure document processing',
      features: {
        aiTitle: 'AI-Powered Analysis',
        aiDesc: 'Advanced AI breaks down complex legal language into simple explanations',
        riskTitle: 'Risk Assessment',
        riskDesc: 'Identify potential risks and important clauses in your documents',
        secureTitle: 'Secure & Private',
        secureDesc: 'Your documents are processed securely and never stored permanently'
      },
      personas: {
        Tenant: 'Tenant (Residential/Commercial)',
        Landlord: 'Landlord / Property Owner',
        Employee: 'Employee / Contractor',
        Employer: 'Employer / Company',
        Borrower: 'Borrower (Loan/Mortgage)',
        General: 'General User'
      }
    },
    hi: {
      title: 'कानूनी दस्तावेज़ विश्लेषक',
      subtitle: 'अपने कानूनी दस्तावेज़ अपलोड करें और AI को जटिल भाषा सरल करने दें',
      dragDrop: 'अपलोड करने के लिए खींचें और छोड़ें या क्लिक करें',
      formats: 'PDF या DOCX (अधिकतम 10MB)',
      consentTitle: 'दस्तावेज़ संसाधित करने की सहमति',
      consentText: 'मैं इस दस्तावेज़ को विश्लेषण के लिए AI द्वारा संसाधित करने की सहमति देता हूँ। मैं समझता हूँ कि:',
      consent1: 'दस्तावेज़ को अस्थायी रूप से Google Cloud AI का उपयोग करके संसाधित किया जाएगा',
      consent2: 'AI-जनित विश्लेषण केवल सूचनात्मक उद्देश्यों के लिए है',
      consent3: 'बाध्यकारी सलाह के लिए मुझे योग्य कानूनी वकील से परामर्श करना चाहिए',
      analyzeBtn: 'दस्तावेज़ का विश्लेषण करें',
      acceptBtn: 'शर्तें स्वीकार करें',
      personaLabel: 'किसके दृष्टिकोण से:',
      footer: 'Google Cloud AI द्वारा संचालित • सुरक्षित प्रसंस्करण',
      features: {
        aiTitle: 'AI-संचालित विश्लेषण',
        aiDesc: 'उन्नत AI जटिल कानूनी भाषा को सरल स्पष्टीकरणों में तोड़ देता है',
        riskTitle: 'जोखिम मूल्यांकन',
        riskDesc: 'अपने दस्तावेज़ों में संभावित जोखिमों और महत्वपूर्ण खंडों की पहचान करें',
        secureTitle: 'सुरक्षित और निजी',
        secureDesc: 'आपके दस्तावेज़ सुरक्षित रूप से संसाधित होते हैं और कभी भी स्थायी रूप से संग्रहीत नहीं होते'
      },
      personas: {
        Tenant: 'किरायेदार (आवासीय/वाणिज्यिक)',
        Landlord: 'मकान मालिक / संपत्ति स्वामी',
        Employee: 'कर्मचारी / ठेकेदार',
        Employer: 'नियोक्ता / कंपनी',
        Borrower: 'उधारकर्ता (ऋण/बंधक)',
        General: 'सामान्य उपयोगकर्ता'
      }
    },
    bn: {
      title: 'আইনি নথি ব্যাখ্যাকারী',
      subtitle: 'আপনার আইনি নথি আপলোড করুন এবং AI কে জটিল ভাষা সহজ করতে দিন',
      dragDrop: 'আপলোড করতে ড্র্যাগ এবং ড্রপ বা ক্লিক করুন',
      formats: 'PDF বা DOCX (সর্বোচ্চ 10MB)',
      consentTitle: 'নথি প্রক্রিয়াকরণের সম্মতি',
      consentText: 'আমি বিশ্লেষণের জন্য AI দ্বারা এই নথি প্রক্রিয়াকরণের সম্মতি দিচ্ছি।',
      consent1: 'নথিটি Google Cloud AI ব্যবহার করে অস্থায়ীভাবে সংরক্ষণ এবং প্রক্রিয়া করা হবে',
      consent2: 'AI-উত্পন্ন বিশ্লেষণ শুধুমাত্র তথ্যের জন্য',
      consent3: 'বাধ্যতামূলক পরামর্শের জন্য আমার যোগ্য আইনজীবীর সাথে পরামর্শ করা উচিত',
      analyzeBtn: 'নথি বিশ্লেষণ করুন',
      acceptBtn: 'শর্তাবলী গ্রহণ করুন',
      personaLabel: 'পরিপ্রেক্ষিত নির্বাচন করুন:',
      footer: 'Google Cloud AI দ্বারা চালিত • নিরাপদ প্রক্রিয়াকরণ',
      features: {
        aiTitle: 'AI-চালিত বিশ্লেষণ',
        aiDesc: 'উন্নত AI জটিল আইনি ভাষাকে সহজ ব্যাখ্যায় ভেঙে দেয়',
        riskTitle: 'ঝুঁকি মূল্যায়ন',
        riskDesc: 'আপনার নথিতে সম্ভাব্য ঝুঁকি এবং গুরুত্বপূর্ণ ধারাগুলি চিহ্নিত করুন',
        secureTitle: 'নিরাপদ এবং গোপনীয়',
        secureDesc: 'আপনার নথিগুলি নিরাপদে প্রক্রিয়া করা হয় এবং কখনও স্থায়ীভাবে সংরক্ষণ করা হয় না'
      },
      personas: {
        Tenant: 'ভাড়াটে (আবাসিক/বাণিজ্যিক)',
        Landlord: 'বাড়ির মালিক / সম্পত্তির মালিক',
        Employee: 'কর্মচারী / ঠিকাদার',
        Employer: 'নিয়োগকর্তা / কোম্পানি',
        Borrower: 'ঋণগ্রহীতা (ঋণ/বন্ধক)',
        General: 'সাধারণ ব্যবহারকারী'
      }
    },
    te: {
      title: 'చట్టపరమైన పత్ర విశ్లేషకం',
      subtitle: 'మీ పత్రాలను అప్‌లోడ్ చేయండి, AI సంక్లిష్ట భాషను సులభతరం చేస్తుంది',
      dragDrop: 'అప్‌లోడ్ చేయడానికి లాగండి లేదా క్లిక్ చేయండి',
      formats: 'PDF లేదా DOCX (గరిష్టంగా 10MB)',
      consentTitle: 'పత్రం ప్రాసెస్ చేయడానికి సమ్మతి',
      consentText: 'విశ్లేషణ కోసం ఈ పత్రాన్ని AI ప్రాసెస్ చేయడానికి నేను అంగీకరిస్తున్నాను:',
      consent1: 'పత్రం Google Cloud AI ఉపయోగించి తాత్కాలికంగా ప్రాసెస్ చేయబడుతుంది',
      consent2: 'AI విశ్లేషణ కేవలం సమాచారం కోసం మాత్రమే',
      consent3: 'చట్టపరమైన సలహా కోసం నేను న్యాయవాదిని సంప్రదించాలి',
      analyzeBtn: 'పత్రాన్ని విశ్లేషించండి',
      acceptBtn: 'షరతులను అంగీకరించండి',
      personaLabel: 'దృక్కోణాన్ని ఎంచుకోండి:',
      footer: 'Google Cloud AI ద్వారా ఆధారితం',
      features: {
        aiTitle: 'AI విశ్లేషణ',
        aiDesc: 'AI సంక్లిష్ట చట్టపరమైన భాషను సరళమైన వివరణలుగా మారుస్తుంది',
        riskTitle: 'రిస్క్ అంచనా',
        riskDesc: 'మీ పత్రాలలో సంభావ్య ప్రమాదాలు మరియు ముఖ్యమైన నిబంధనలను గుర్తించండి',
        secureTitle: 'సురక్షితమైనది',
        secureDesc: 'మీ పత్రాలు సురక్షితంగా ప్రాసెస్ చేయబడతాయి'
      },
      personas: {
        Tenant: 'అద్దెదారు (నివాస/వాణిజ్య)',
        Landlord: 'యజమాని / ఆస్తి యజమాని',
        Employee: 'ఉద్యోగి / కాంట్రాక్టర్',
        Employer: 'యజమాని / కంపెనీ',
        Borrower: 'రుణగ్రహీత (లోన్)',
        General: 'సాధారణ వినియోగదారు'
      }
    },
    mr: {
      title: 'कायदेशीर दस्तऐवज विश्लेषक',
      subtitle: 'तुमची कागदपत्रे अपलोड करा आणि AI ला क्लिष्ट भाषा सोपी करू द्या',
      dragDrop: 'अपलोड करण्यासाठी क्लिक करा',
      formats: 'PDF किंवा DOCX (जास्तीत जास्त 10MB)',
      consentTitle: 'संमती',
      consentText: 'मी या दस्तऐवजावर AI द्वारे प्रक्रिया करण्यास संमती देतो:',
      consent1: 'Google Cloud AI वापरून दस्तऐवज तात्पुरते साठवले जाईल',
      consent2: 'AI विश्लेषण केवळ माहितीसाठी आहे',
      consent3: 'कायदेशीर सल्ल्यासाठी मी वकिलाचा सल्ला घ्यावा',
      analyzeBtn: 'विश्लेषण करा',
      acceptBtn: 'अटी स्वीकार करा',
      personaLabel: 'कोणाच्या दृष्टीकोनातून:',
      footer: 'Google Cloud AI द्वारे समर्थित',
      features: {
        aiTitle: 'AI-आधारित विश्लेषण',
        aiDesc: 'AI कायदेशीर भाषा सोप्या भाषेत समजून सांगते',
        riskTitle: 'जोखीम मूल्यांकन',
        riskDesc: 'संभाव्य जोखीम ओळखा',
        secureTitle: 'सुरक्षित',
        secureDesc: 'तुमची कागदपत्रे सुरक्षित आहेत'
      },
      personas: {
        Tenant: 'भाडेकरू (निवासी/व्यावसायिक)',
        Landlord: 'घरमालक / मालमत्ता मालक',
        Employee: 'कर्मचारी / कंत्राटदार',
        Employer: 'मालक / कंपनी',
        Borrower: 'कर्जदार',
        General: 'सामान्य वापरकर्ता'
      }
    },
    ta: {
      title: 'சட்ட ஆவண விளக்கப்பொறி',
      subtitle: 'ஆவணங்களை பதிவேற்றவும், AI சிக்கலான மொழியை எளிதாக்கும்',
      dragDrop: 'பதிவேற்ற கிளிக் செய்யவும்',
      formats: 'PDF அல்லது DOCX (அதிகபட்சம் 10MB)',
      consentTitle: 'ஒப்புதல்',
      consentText: 'AI மூலம் இந்த ஆவணத்தை செயல்படுத்த நான் ஒப்புக்கொள்கிறேன்:',
      consent1: 'Google Cloud AIஐப் பயன்படுத்தி ஆவணம் சேமிக்கப்படும்',
      consent2: 'AI பகுப்பாய்வு தகவலுக்காக மட்டுமே',
      consent3: 'சட்ட ஆலோசனைக்கு வழக்கறிஞரை அணுக வேண்டும்',
      analyzeBtn: 'பகுப்பாய்வு செய்',
      acceptBtn: 'ஏற்கவும்',
      personaLabel: 'பார்வையைத் தேர்ந்தெடுக்கவும்:',
      footer: 'Google Cloud AI மூலம் இயக்கப்படுகிறது',
      features: {
        aiTitle: 'AI பகுப்பாய்வு',
        aiDesc: 'AI சிக்கலான சட்ட மொழியை எளிதாக்குகிறது',
        riskTitle: 'ஆபத்து மதிப்பீடு',
        riskDesc: 'சாத்தியமான ஆபத்துகளைக் கண்டறியவும்',
        secureTitle: 'பாதுகாப்பான',
        secureDesc: 'உங்கள் ஆவணங்கள் பாதுகாப்பானவை'
      },
      personas: {
        Tenant: 'குத்தகைதாரர் (குடியிருப்பு/வணிக)',
        Landlord: 'வீட்டு உரிமையாளர்',
        Employee: 'ஊழியர் / ஒப்பந்தக்காரர்',
        Employer: 'முதலாளி / நிறுவனம்',
        Borrower: 'கடன் வாங்குபவர்',
        General: 'பொது பயனர்'
      }
    },
    gu: {
      title: 'કાનૂની દસ્તાવેજ વિશ્લેષક',
      subtitle: 'તમારા દસ્તાવેજો અપલોડ કરો અને AI જટિલ ભાષા સરળ બનાવશે',
      dragDrop: 'અપલોડ કરવા માટે ક્લિક કરો',
      formats: 'PDF અથવા DOCX (મહત્તમ 10MB)',
      consentTitle: 'સંમતિ',
      consentText: 'હું AI દ્વારા આ દસ્તાવેજ પર પ્રક્રિયા કરવા માટે સંમતિ આપું છું:',
      consent1: 'Google Cloud AI નો ઉપયોગ કરીને પ્રક્રિયા કરવામાં આવશે',
      consent2: 'AI વિશ્લેષણ માત્ર માહિતી માટે છે',
      consent3: 'કાનૂની સલાહ માટે વકીલનો સંપર્ક કરવો',
      analyzeBtn: 'વિશ્લેષણ કરો',
      acceptBtn: 'સ્વીકારો',
      personaLabel: 'પરિપ્રેક્ષ્ય પસંદ કરો:',
      footer: 'Google Cloud AI દ્વારા સંચાલિત',
      features: {
        aiTitle: 'AI વિશ્લેષણ',
        aiDesc: 'AI જટિલ કાનૂની ભાષાને સરળ બનાવે છે',
        riskTitle: 'જોખમ મૂલ્યાંકન',
        riskDesc: 'જોખમો ઓળખો',
        secureTitle: 'સુરક્ષિત',
        secureDesc: 'તમારા દસ્તાવેજો સુરક્ષિત છે'
      },
      personas: {
        Tenant: 'ભાડૂત (રહેણાંક/વ્યાપારી)',
        Landlord: 'મકાનમાલિક',
        Employee: 'કર્મચારી',
        Employer: 'એમ્પ્લોયર / કંપની',
        Borrower: 'દેવાદાર (લોન)',
        General: 'સામાન્ય વપરાશકર્તા'
      }
    },
    kn: {
      title: 'ಕಾನೂನು ದಾಖಲೆ ವಿಶ್ಲೇಷಕ',
      subtitle: 'ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, AI ಭಾಷೆಯನ್ನು ಸರಳಗೊಳಿಸುತ್ತದೆ',
      dragDrop: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
      formats: 'PDF ಅಥವಾ DOCX (ಗರಿಷ್ಠ 10MB)',
      consentTitle: 'ಒಪ್ಪಿಗೆ',
      consentText: 'AI ಮೂಲಕ ಈ ದಾಖಲೆಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ನಾನು ಒಪ್ಪುತ್ತೇನೆ:',
      consent1: 'Google Cloud AI ಬಳಸಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತದೆ',
      consent2: 'AI ವಿಶ್ಲೇಷಣೆ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ',
      consent3: 'ಕಾನೂನು ಸಲಹೆಗಾಗಿ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಬೇಕು',
      analyzeBtn: 'ವಿಶ್ಲೇಷಿಸಿ',
      acceptBtn: 'ಒಪ್ಪಿಕೊಳ್ಳಿ',
      personaLabel: 'ದೃಷ್ಟಿಕೋನವನ್ನು ಆರಿಸಿ:',
      footer: 'Google Cloud AI ನಿಂದ ಚಾಲಿತ',
      features: {
        aiTitle: 'AI ವಿಶ್ಲೇಷಣೆ',
        aiDesc: 'AI ಸಂಕೀರ್ಣ ಕಾನೂನು ಭಾಷೆಯನ್ನು ಸರಳಗೊಳಿಸುತ್ತದೆ',
        riskTitle: 'ಅಪಾಯದ ಮೌಲ್ಯಮಾಪನ',
        riskDesc: 'ಸಂಭಾವ್ಯ ಅಪಾಯಗಳನ್ನು ಗುರುತಿಸಿ',
        secureTitle: 'ಸುರಕ್ಷಿತ',
        secureDesc: 'ನಿಮ್ಮ ದಾಖಲೆಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ'
      },
      personas: {
        Tenant: 'ಬಾಡಿಗೆದಾರ',
        Landlord: 'ಮಾಲೀಕ',
        Employee: 'ಉದ್ಯೋಗಿ',
        Employer: 'ಉದ್ಯೋಗದಾತ',
        Borrower: 'ಸಾಲಗಾರ',
        General: 'ಸಾಮಾನ್ಯ ಬಳಕೆದಾರ'
      }
    },
    ml: {
      title: 'നിയമരേഖാ വിശകലനം',
      subtitle: 'രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക, AI ഭാഷ ലളിതമാക്കും',
      dragDrop: 'അപ്‌ലോഡ് ചെയ്യാൻ ക്ലിಕ್ ചെയ്യുക',
      formats: 'PDF അല്ലെങ്കിൽ DOCX (പരമാവധി 10MB)',
      consentTitle: 'സമ്മതം',
      consentText: 'ഈ രേഖ AI ഉപയോഗിച്ച് വിശകലനം ചെയ്യാൻ ഞാൻ സമ്മതിക്കുന്നു:',
      consent1: 'Google Cloud AI ഉപയോഗിച്ച് പ്രോസസ്സ് ചെയ്യും',
      consent2: 'വിശകലനം അറിവിന് വേണ്ടി മാത്രം',
      consent3: 'നിയമോപദേശത്തിന് അഭിഭാഷകനെ സമീപിക്കണം',
      analyzeBtn: 'വിശകലനം ചെയ്യുക',
      acceptBtn: 'അംഗീകരിക്കുക',
      personaLabel: 'കാഴ്ചപ്പാട് തിരഞ്ഞെടുക്കുക:',
      footer: 'Google Cloud AI നൽകുന്നത്',
      features: {
        aiTitle: 'AI വിശകലനം',
        aiDesc: 'AI നിയമഭാഷ ലളിതമാക്കുന്നു',
        riskTitle: 'അപകടസാധ്യത',
        riskDesc: 'അപകടങ്ങൾ കണ്ടെത്തുക',
        secureTitle: 'സുരക്ഷിതം',
        secureDesc: 'രേഖകൾ സുരക്ഷിതമാണ്'
      },
      personas: {
        Tenant: 'വാടകക്കാരൻ',
        Landlord: 'വീട്ടുടമ',
        Employee: 'ജീവനക്കാരൻ',
        Employer: 'തൊഴിലുടമ',
        Borrower: 'കടക്കാരൻ',
        General: 'പൊതു ഉപയോക്താവ്'
      }
    },
    pa: {
      title: 'ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼ ਵਿਆਖਿਆਕਾਰ',
      subtitle: 'ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਕਰੋ, AI ਭਾਸ਼ਾ ਨੂੰ ਸਰਲ ਬਣਾਵੇਗਾ',
      dragDrop: 'ਅਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
      formats: 'PDF ਜਾਂ DOCX (ਵੱਧ ਤੋਂ ਵੱਧ 10MB)',
      consentTitle: 'ਸਹਿਮਤੀ',
      consentText: 'ਮੈਂ AI ਦੁਆਰਾ ਇਸ ਦਸਤਾਵੇਜ਼ ਦੀ ਪ੍ਰਕਿਰਿਆ ਕਰਨ ਲਈ ਸਹਿਮਤ ਹਾਂ:',
      consent1: 'Google Cloud AI ਵਰਤ ਕੇ ਪ੍ਰੋਸੈਸ ਕੀਤਾ ਜਾਵੇਗਾ',
      consent2: 'ਇਹ ਵਿਸ਼ਲੇਸ਼ਣ ਸਿਰਫ ਜਾਣਕਾਰੀ ਲਈ ਹੈ',
      consent3: 'ਵਕੀਲ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
      analyzeBtn: 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',
      acceptBtn: 'ਮਨਜ਼ੂਰ ਕਰੋ',
      personaLabel: 'ਦ੍ਰਿਸ਼ਟੀਕੋਣ ਚੁਣੋ:',
      footer: 'Google Cloud AI ਦੁਆਰਾ ਸੰਚਾਲਿਤ',
      features: {
        aiTitle: 'AI ਵਿਸ਼ਲੇਸ਼ਣ',
        aiDesc: 'AI ਕਾਨੂੰਨੀ ਭਾਸ਼ਾ ਨੂੰ ਸਰਲ ਬਣਾਉਂਦਾ ਹੈ',
        riskTitle: 'ਜੋਖਮ ਮੁਲਾਂਕਣ',
        riskDesc: 'ਖਤਰਿਆਂ ਦੀ ਪਛਾਣ ਕਰੋ',
        secureTitle: 'ਸੁਰੱਖਿਅਤ',
        secureDesc: 'ਦਸਤਾਵੇਜ਼ ਸੁਰੱਖਿਅਤ ਹਨ'
      },
      personas: {
        Tenant: 'ਕਿਰਾਏਦਾਰ',
        Landlord: 'ਮਕਾਨ ਮਾਲਕ',
        Employee: 'ਕਰਮਚਾਰੀ',
        Employer: 'ਮਾਲਕ',
        Borrower: 'ਕਰਜ਼ਦਾਰ',
        General: 'ਆਮ ਵਰਤੋਂਕਾਰ'
      }
    },
    ur: {
      title: 'قانونی دستاویز کی وضاحت',
      subtitle: 'دستاویزات اپ لوڈ کریں، AI زبان کو آسان بنائے گا',
      dragDrop: 'اپ لوڈ کرنے کے لیے کلک کریں',
      formats: 'PDF یا DOCX (زیادہ سے زیادہ 10MB)',
      consentTitle: 'رضامندی',
      consentText: 'میں AI کے ذریعے اس دستاویز پر کارروائی کرنے کی رضامندی دیتا ہوں:',
      consent1: 'Google Cloud AI کے ذریعے پروسیس کیا جائے گا',
      consent2: 'تجزیہ صرف معلومات کے لیے ہے',
      consent3: 'وکیل سے رجوع کرنا چاہیے',
      analyzeBtn: 'تجزیہ کریں',
      acceptBtn: 'قبول کریں',
      personaLabel: 'نقطہ نظر:',
      footer: 'Google Cloud AI کے ذریعے تقویت یافتہ',
      features: {
        aiTitle: 'AI تجزیہ',
        aiDesc: 'AI قانونی زبان کو آسان بناتا ہے',
        riskTitle: 'خطرے کا تخمینہ',
        riskDesc: 'خطرات کی نشاندہی کریں',
        secureTitle: 'محفوظ',
        secureDesc: 'آپ کی دستاویزات محفوظ ہیں'
      },
      personas: {
        Tenant: 'کرایہ دار',
        Landlord: 'مالک مکان',
        Employee: 'ملازم',
        Employer: 'آجر',
        Borrower: 'قرض لینے والا',
        General: 'عام صارف'
      }
    },
    or: {
      title: 'ଆଇନଗତ ଦସ୍ତାବିଜ ବିଶ୍ଳେଷକ',
      subtitle: 'ଦସ୍ତାବିଜ ଅପଲୋଡ୍ କରନ୍ତୁ, AI ଭାଷାକୁ ସରଳ କରିବ',
      dragDrop: 'ଅପଲୋଡ୍ କରିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ',
      formats: 'PDF କିମ୍ବା DOCX (ସର୍ବାଧିକ 10MB)',
      consentTitle: 'ସମ୍ମତି',
      consentText: 'ମୁଁ AI ଦ୍ୱାରା ଏହି ଦସ୍ତାବିଜ ପ୍ରକ୍ରିୟାକରଣ ପାଇଁ ସମ୍ମତି ଦେଉଛି:',
      consent1: 'Google Cloud AI ବ୍ୟବହାର କରି ପ୍ରକ୍ରିୟାକରଣ କରାଯିବ',
      consent2: 'ଏହି ବିଶ୍ଳେଷଣ କେବଳ ସୂଚନା ପାଇଁ',
      consent3: 'ଓକିଲଙ୍କ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ',
      analyzeBtn: 'ବିଶ୍ଳେଷଣ କରନ୍ତୁ',
      acceptBtn: 'ଗ୍ରହଣ କରନ୍ତୁ',
      personaLabel: 'ଦୃଷ୍ଟିକୋଣ:',
      footer: 'Google Cloud AI ଦ୍ୱାରା ପରିଚାଳିତ',
      features: {
        aiTitle: 'AI ବିଶ୍ଳେଷଣ',
        aiDesc: 'AI ଆଇନଗତ ଭାଷାକୁ ସରଳ କରେ',
        riskTitle: 'ବିପଦ ମୂଲ୍ୟାଙ୍କନ',
        riskDesc: 'ବିପଦ ଚିହ୍ନଟ କରନ୍ତୁ',
        secureTitle: 'ସୁରକ୍ଷିତ',
        secureDesc: 'ଦସ୍ତାବିଜ ସୁରକ୍ଷିତ ଅଛି'
      },
      personas: {
        Tenant: 'ଭଡ଼ାଟିଆ',
        Landlord: 'ଘର ମାଲିକ',
        Employee: 'କର୍ମଚାରୀ',
        Employer: 'ନିଯୁକ୍ତିଦାତା',
        Borrower: 'ଋଣଗ୍ରହିତା',
        General: 'ସାଧାରଣ ବ୍ୟବହାରକାରୀ'
      }
    }
  };

  const t = translations[language] || translations.en;

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) validateAndSetFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e) => { if (e.target.files[0]) validateAndSetFile(e.target.files[0]); };

  const validateAndSetFile = (file) => {
    setError('');
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) { setError('Please select a PDF or DOCX file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB.'); return; }
    setSelectedFile(file);
  };

  const removeFile = (e) => { 
    e.stopPropagation(); 
    setSelectedFile(null); 
    setError(''); 
    setConsentGiven(false); 
    if (fileInputRef.current) { fileInputRef.current.value = ''; } 
  };

  const handleUpload = (e) => {
    e.stopPropagation();
    if (!selectedFile) { setError('Please select a file to upload.'); return; }
    if (!consentGiven) { setError('Please agree to the terms to proceed.'); return; }
    if (onProcessingStart) onProcessingStart(selectedFile, { persona: selectedPersona });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const featuresList = [
    { icon: Sparkles, title: t.features.aiTitle, description: t.features.aiDesc },
    { icon: CheckSquare, title: t.features.riskTitle, description: t.features.riskDesc },
    { icon: Lock, title: t.features.secureTitle, description: t.features.secureDesc }
  ];
  
  const uploadContent = (
    <div className="text-center p-8 pointer-events-none">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto bg-[#4285F4] rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
          <Upload className="h-8 w-8 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 transition-colors group-hover:text-[#4285F4]">
        {t.dragDrop}
      </h3>

      <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
        {t.formats}
      </p>
    </div>
  );

  const filePreview = (
    <div className="p-6 relative z-20">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-[#4285F4] flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-white truncate text-lg">{selectedFile?.name}</h4>
                    <p className="text-sm text-gray-400">{formatFileSize(selectedFile?.size)}</p>
                </div>
            </div>
            <button onClick={removeFile} className="p-2 hover:bg-[#333333] rounded-lg text-gray-400 transition-colors" title="Remove file">
                <X className="h-5 w-5" />
            </button>
        </div>

        <div className="mb-6">
          <label className="block text-gray-400 text-xs uppercase font-bold mb-2 flex items-center">
            <UserCircle className="h-4 w-4 mr-1" />
            {t.personaLabel}
          </label>
          <select 
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="w-full bg-[#171717] border border-[#333333] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#4285F4] appearance-none cursor-pointer hover:border-gray-500 transition-colors"
          >
            {Object.keys(t.personas).map(key => (
                <option key={key} value={key}>{t.personas[key]}</option>
            ))}
          </select>
        </div>

        <div className="mb-6 p-4 rounded-xl border border-[#4285F4]/30 bg-[#4285F4]/10 text-left">
            <div className="flex items-start space-x-3">
                <div className="pt-0.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); setConsentGiven(!consentGiven); setError(''); }}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${consentGiven ? 'bg-[#4285F4] border-[#4285F4]' : 'bg-transparent border-gray-400 hover:border-gray-300'}`}
                    >
                        {consentGiven && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                </div>
                <div>
                    <h4 className="text-white font-semibold text-sm mb-1">{t.consentTitle}</h4>
                    <p className="text-gray-300 text-sm mb-2 leading-relaxed">{t.consentText}</p>
                    <ul className="list-disc list-outside ml-4 text-gray-400 text-xs space-y-1 leading-relaxed">
                        <li>{t.consent1}</li>
                        <li>{t.consent2}</li>
                        <li>{t.consent3}</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <button
            onClick={handleUpload}
            disabled={!consentGiven}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-200 
                ${consentGiven 
                    ? 'bg-[#4285F4] text-white hover:bg-[#3367D6] hover:shadow-lg transform hover:-translate-y-0.5' 
                    : 'bg-[#252525] text-gray-500 cursor-not-allowed border border-[#333333]'
                } shadow-md`}
        >
            {consentGiven ? t.analyzeBtn : t.acceptBtn}
        </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 pt-8">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">{t.title}</h1>
            <p className="text-lg text-gray-400">{t.subtitle}</p>
        </div>

        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                group relative rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed
                ${isDragOver 
                    ? 'border-[#4285F4] bg-[#202020] scale-[1.01]' 
                    : 'bg-[#171717] border-[#333333] hover:border-[#4285F4] hover:bg-[#202020] hover:shadow-2xl'
                }
            `}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 ${selectedFile ? 'hidden' : 'block'}`}
            />
            <div className={`py-12 ${selectedFile ? 'hidden' : 'block'}`}>
                {uploadContent}
            </div>
            {selectedFile && filePreview}
        </div>

        {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center space-x-3 animate-pulse">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-200">{error}</p>
            </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
            {featuresList.map((feature, index) => (
                <div key={index} className="bg-[#171717] rounded-xl p-6 border border-[#333333] transition-all duration-300 hover:-translate-y-2 hover:border-gray-600 hover:shadow-xl hover:bg-[#202020]">
                    <div className="w-10 h-10 bg-[#4285F4] rounded-lg flex items-center justify-center mb-4 shadow-sm">
                        <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
            ))}
        </div>

        <div className="text-center pt-8 text-sm text-gray-600">
            <p>{t.footer}</p>
        </div>
    </div>
  );
}