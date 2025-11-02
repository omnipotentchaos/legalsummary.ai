// components/ImportantClauseList.js

import { useState } from 'react';
import { useRouter } from 'next/router'; 
import { FileText, AlertTriangle, ChevronDown, ChevronUp, Zap, Briefcase } from 'lucide-react';
import PlainLanguageRewriter from './PlainLanguageRewriter'; 

export default function ImportantClauseList({ clauses, language }) {
  const router = useRouter(); 
  const { docId } = router.query;
  
  const translations = {
    en: {
      title: 'AI-Identified Important Clauses',
      subtitle: 'Review the clauses the AI flagged as most important or risky, grouped by severity. Use the \'Simplify This\' button to get a plain language explanation.',
      highRisk: 'High Risk Clauses',
      mediumRisk: 'Medium Risk Clauses',
      lowRisk: 'Low Risk Clauses',
      generalClauses: 'General Clauses',
      getLegalAdvice: 'Get Legal Advice',
      noClauses: 'No clauses were analyzed in detail.',
      clauseLabel: 'Clause',
      riskLabel: 'Risk',
      clauseTypes: {
        payment: 'Payment',
        termination: 'Termination',
        liability: 'Liability',
        confidentiality: 'Confidentiality',
        dispute: 'Dispute Resolution',
        indemnity: 'Indemnity',
        warranty: 'Warranty',
        renewal: 'Renewal',
        cancellation: 'Cancellation',
        penalty: 'Penalty',
        notice: 'Notice',
        default: 'Clause'
      }
    },
    hi: {
      title: 'एआई-पहचानी गई महत्वपूर्ण धाराएं',
      subtitle: 'एआई द्वारा चिह्नित सबसे महत्वपूर्ण या जोखिम भरी धाराओं की समीक्षा करें, उन्हें गंभीरता के अनुसार समूहीकृत किया गया है। \'सरल करें\' बटन का उपयोग करके सरल भाषा में स्पष्टीकरण प्राप्त करें।',
      highRisk: 'उच्च जोखिम वाली धाराएं',
      mediumRisk: 'मध्यम जोखिम वाली धाराएं',
      lowRisk: 'कम जोखिम वाली धाराएं',
      generalClauses: 'सामान्य धाराएं',
      getLegalAdvice: 'कानूनी सलाह लें',
      noClauses: 'किसी भी धारा का विस्तार से विश्लेषण नहीं किया गया।',
      clauseLabel: 'धारा',
      riskLabel: 'जोखिम',
      clauseTypes: {
        payment: 'भुगतान',
        termination: 'समाप्ति',
        liability: 'दायित्व',
        confidentiality: 'गोपनीयता',
        dispute: 'विवाद समाधान',
        indemnity: 'क्षतिपूर्ति',
        warranty: 'वारंटी',
        renewal: 'नवीनीकरण',
        cancellation: 'रद्दीकरण',
        penalty: 'दंड',
        notice: 'नोटिस',
        default: 'धारा'
      }
    },
    bn: {
      title: 'এআই চিহ্নিত গুরুত্বপূর্ণ ধারাগুলি',
      subtitle: 'গুরুত্ব অনুসারে এআই দ্বারা চিহ্নিত সবচেয়ে গুরুত্বপূর্ণ বা ঝুঁকিপূর্ণ ধারাগুলি পর্যালোচনা করুন। একটি সরল ভাষা ব্যাখ্যা পেতে \'সরল করুন\' বোতামটি ব্যবহার করুন।',
      highRisk: 'উচ্চ ঝুঁকির ধারা',
      mediumRisk: 'মাঝারি ঝুঁকির ধারা',
      lowRisk: 'কম ঝুঁকির ধারা',
      generalClauses: 'সাধারণ ধারা',
      getLegalAdvice: 'আইনি পরামর্শ পান',
      noClauses: 'কোনো ধারা বিস্তারিতভাবে বিশ্লেষণ করা হয়নি।',
      clauseLabel: 'ধারা',
      riskLabel: 'ঝুঁকি',
      clauseTypes: {
        payment: 'পেমেন্ট',
        termination: 'সমাপ্তি',
        liability: 'দায়',
        confidentiality: 'গোপনীয়তা',
        dispute: 'বিরোধ নিষ্পত্তি',
        indemnity: 'ক্ষতিপূরণ',
        warranty: 'ওয়ারেন্টি',
        renewal: 'পুনর্নবীকরণ',
        cancellation: 'বাতিলকরণ',
        penalty: 'জরিমানা',
        notice: 'নোটিশ',
        default: 'ধারা'
      }
    },
    te: {
      title: 'AI గుర్తించిన ముख్యమైన నిబంధనలు',
      subtitle: 'AI ముख్యమైన లేదా ప్రమాదకరమైనవిగా గుర్తించిన నిబంధనలను, తీవ్రత ప్రకారం సమూహంగా సమీక్షించండి. సరళమైన భాషా వివరణ పొందడానికి \'సరళీకరించు\' బటన్‌ను ఉపయోగించండి.',
      highRisk: 'అధిక ప్రమాద నిబంధనలు',
      mediumRisk: 'మధ్యస్థ ప్రమాద నిబంధనలు',
      lowRisk: 'తక్కువ ప్రమాద నిబంధనలు',
      generalClauses: 'సాధారణ నిబంధనలు',
      getLegalAdvice: 'చట్టపరమైన సలహా పొందండి',
      noClauses: 'వివరంగా విశ్లేషించబడిన నిబంధనలు లేవు.',
      clauseLabel: 'నిబంధన',
      riskLabel: 'ప్రమాదం',
      clauseTypes: {
        payment: 'చెల్లింపు',
        termination: 'ముగింపు',
        liability: 'బాధ్యత',
        confidentiality: 'గోప్యత',
        dispute: 'వివాద పరిష్కారం',
        indemnity: 'నష్టపరిహారం',
        warranty: 'వారంటీ',
        renewal: 'పునరుద్ధరణ',
        cancellation: 'రద్దు',
        penalty: 'జరిమానా',
        notice: 'నోటీసు',
        default: 'నిబంధన'
      }
    },
    mr: {
      title: 'AI-ओळखलेल्या महत्त्वाच्या कलमे',
      subtitle: 'AI ने सर्वात महत्त्वाची किंवा जोखमीची म्हणून चिन्हांकित केलेल्या कलमांचे, गांभीर्यनुसार गट केलेले पुनरावलोकन करा. साध्या भाषेतील स्पष्टीकरण मिळविण्यासाठी \'सरल करा\' बटण वापरा.',
      highRisk: 'उच्च जोखमीची कलमे',
      mediumRisk: 'मध्यम जोखमीची कलमे',
      lowRisk: 'कमी जोखमीची कलमे',
      generalClauses: 'सामान्य कलमे',
      getLegalAdvice: 'कायदेशीर सल्ला घ्या',
      noClauses: 'कोणत्याही कलमाचे तपशीलवार विश्लेषण केले नाही.',
      clauseLabel: 'कलम',
      riskLabel: 'धोका',
      clauseTypes: {
        payment: 'पेमेंट',
        termination: 'समाप्ती',
        liability: 'दायित्व',
        confidentiality: 'गोपनीयता',
        dispute: 'विवाद निराकरण',
        indemnity: 'नुकसान भरपाई',
        warranty: 'वॉरंटी',
        renewal: 'नूतनीकरण',
        cancellation: 'रद्दीकरण',
        penalty: 'दंड',
        notice: 'नोटीस',
        default: 'कलम'
      }
    },
    ta: {
      title: 'AI-அடையாளப்படுத்தப்பட்ட முக்கியப் பிரிவுகள்',
      subtitle: 'முக்கியமான அல்லது ஆபத்தான பிரிவுகளாக AI குறித்துள்ள பிரிவுகளை, தீவிரத்தின் அடிப்படையில் குழுவாக மதிப்பாய்வு செய்யவும். எளிய மொழி விளக்கத்தைப் பெற, \'எளிதாக்கு\' பொத்தானைப் பயன்படுத்தவும்.',
      highRisk: 'அதிக ஆபத்துள்ள பிரிவுகள்',
      mediumRisk: 'நடுத்தர ஆபத்துள்ள பிரிவுகள்',
      lowRisk: 'குறைந்த ஆபத்துள்ள பிரிவுகள்',
      generalClauses: 'பொதுவான பிரிவுகள்',
      getLegalAdvice: 'சட்ட ஆலோசனை பெறுங்கள்',
      noClauses: 'எந்தப் பிரிவுகளும் விரிவாக பகுப்பாய்வு செய்யப்படவில்லை.',
      clauseLabel: 'பிரிவு',
      riskLabel: 'ஆபத்து',
      clauseTypes: {
        payment: 'பணம் செலுத்துதல்',
        termination: 'முடிவு',
        liability: 'பொறுப்பு',
        confidentiality: 'இரகசியத்தன்மை',
        dispute: 'தகராறு தீர்வு',
        indemnity: 'இழப்பீடு',
        warranty: 'உத்தரவாதம்',
        renewal: 'புதுப்பித்தல்',
        cancellation: 'ரத்து',
        penalty: 'அபராதம்',
        notice: 'அறிவிப்பு',
        default: 'பிரிவு'
      }
    },
    ur: {
      title: 'AI کے ذریعے شناخت شدہ اہم شقیں',
      subtitle: 'AI نے جن شقوں کو سب سے اہم یا خطرناک قرار دیا ہے، انہیں خطرے کی سطح کے لحاظ سے گروپ بندی کرکے جائزہ لیں۔ سادی زبان میں وضاحت حاصل کرنے کے لیے \'آسان کریں\' بٹن استعمال کریں۔',
      highRisk: 'زیادہ خطرے والی شقیں',
      mediumRisk: 'متوسط خطرے والی شقیں',
      lowRisk: 'کم خطرے والی شقیں',
      generalClauses: 'عام شقیں',
      getLegalAdvice: 'قانونی مشورہ حاصل کریں',
      noClauses: 'کسی بھی شق کا تفصیل سے تجزیہ نہیں کیا گیا۔',
      clauseLabel: 'شق',
      riskLabel: 'خطرہ',
      clauseTypes: {
        payment: 'ادائیگی',
        termination: 'اختتام',
        liability: 'ذمہ داری',
        confidentiality: 'رازداری',
        dispute: 'تنازعات کا حل',
        indemnity: 'معاوضہ',
        warranty: 'وارنٹی',
        renewal: 'تجدید',
        cancellation: 'منسوخی',
        penalty: 'جرمانہ',
        notice: 'نوٹس',
        default: 'شق'
      }
    },
    gu: {
      title: 'AI-ઓળખાયેલ મહત્વની કલમો',
      subtitle: 'AI દ્વારા સૌથી મહત્વપૂર્ણ અથવા જોખમી તરીકે ફ્લેગ કરાયેલી કલમોની, ગંભીરતા દ્વારા જૂથબદ્ધ કરીને સમીક્ષા કરો. સાદી ભાષામાં સમજૂતી મેળવવા માટે \'સરળ કરો\' બટનનો ઉપયોગ કરો.',
      highRisk: 'ઉચ્ચ જોખમની કલમો',
      mediumRisk: 'મધ્યમ જોખમની કલમો',
      lowRisk: 'ઓછા જોખમની કલમો',
      generalClauses: 'સામાન્ય કલમો',
      getLegalAdvice: 'કાનૂની સલાહ મેળવો',
      noClauses: 'કોઈ કલમનું વિગતવાર વિશ્લેષણ કરવામાં આવ્યું નથી.',
      clauseLabel: 'કલમ',
      riskLabel: 'જોખમ',
      clauseTypes: {
        payment: 'ચુકવણી',
        termination: 'સમાપ્તિ',
        liability: 'જવાબદારી',
        confidentiality: 'ગોપનીયતા',
        dispute: 'વિવાદ નિરાકરણ',
        indemnity: 'નુકસાની ભરપાઈ',
        warranty: 'વોરંટી',
        renewal: 'નવીકરણ',
        cancellation: 'રદ્દીકરણ',
        penalty: 'દંડ',
        notice: 'નોટિસ',
        default: 'કલમ'
      }
    },
    kn: {
      title: 'AI ಗುರುತಿಸಿದ ಪ್ರಮುಖ ಷರತ್ತುಗಳು',
      subtitle: 'AI ಪ್ರಮುಖ ಅಥವಾ ಅಪಾಯಕಾರಿ ಎಂದು ಗುರುತಿಸಿದ ಷರತ್ತುಗಳನ್ನು, ತೀವ್ರತೆಯ ಆಧಾರದ ಮೇಲೆ ಗ್ರೂಪ್ ಮಾಡಿ ಪರಿಶೀಲಿಸಿ. ಸರಳ ಭಾಷೆಯ ವಿವರಣೆಯನ್ನು ಪಡೆಯಲು \'ಸರಳೀಕರಿಸಿ\' ಬಟನ್ ಬಳಸಿ.',
      highRisk: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಷರತ್ತುಗಳು',
      mediumRisk: 'ಮಧ್ಯಮ ಅಪಾಯದ ಷರತ್ತುಗಳು',
      lowRisk: 'ಕಡಿಮೆ ಅಪಾಯದ ಷರತ್ತುಗಳು',
      generalClauses: 'ಸಾಮಾನ್ಯ ಷರತ್ತುಗಳು',
      getLegalAdvice: 'ಕಾನೂನು ಸಲಹೆ ಪಡೆಯಿರಿ',
      noClauses: 'ಯಾವುದೇ ಷರತ್ತುಗಳನ್ನು ವಿವರವಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿಲ್ಲ.',
      clauseLabel: 'ಷರತ್ತು',
      riskLabel: 'ಅಪಾಯ',
      clauseTypes: {
        payment: 'ಪಾವತಿ',
        termination: 'ಮುಕ್ತಾಯ',
        liability: 'ಜವಾಬ್ದಾರಿ',
        confidentiality: 'ಗೌಪ್ಯತೆ',
        dispute: 'ವಿವಾದ ಪರಿಹಾರ',
        indemnity: 'ನಷ್ಟ ಪರಿಹಾರ',
        warranty: 'ವಾರಂಟಿ',
        renewal: 'ನವೀಕರಣ',
        cancellation: 'ರದ್ದತಿ',
        penalty: 'ದಂಡ',
        notice: 'ಸೂಚನೆ',
        default: 'ಷರತ್ತು'
      }
    },
    ml: {
      title: 'AI തിരിച്ചറിഞ്ഞ പ്രധാന വ്യവസ്ഥകൾ',
      subtitle: 'AI ഏറ്റവും പ്രധാനപ്പെട്ടതോ അപകടകരമായതോ എന്ന് ഫ്ലാഗ്ചെയ്ത വ്യവസ്ഥകൾ, തീവ്രത അനുസരിച്ച് ഗ്രൂപ്പുചെയ്ത അവലോകനം ചെയ്യുക. ലളിതമായ ഭാഷാ വിശദീകരണം ലഭിക്കാൻ \'ലളിതമാക്കുക\' ബട്ടൺ ഉപയോഗിക്കുക.',
      highRisk: 'ഉയർന്ന അപകടസാധ്യതയുള്ള വ്യവസ്ഥകൾ',
      mediumRisk: 'ഇടത്തരം അപകടസാധ്യതയുള്ള വ്യവസ്ഥകൾ',
      lowRisk: 'കുറഞ്ഞ അപകടസാധ്യതയുള്ള വ്യവസ്ഥകൾ',
      generalClauses: 'പൊതുവായ വ്യവസ്ഥകൾ',
      getLegalAdvice: 'നിയമപരമായ ഉപദേശം നേടുക',
      noClauses: 'ഒരു വ്യവസ്ഥയും വിശദമായി വിശകലനം ചെയ്തിട്ടില്ല.',
      clauseLabel: 'വ്യവസ്ഥ',
      riskLabel: 'റിസ്ക്',
      clauseTypes: {
        payment: 'പേയ്മെന്റ്',
        termination: 'അവസാനിപ്പിക്കൽ',
        liability: 'ബാധ്യത',
        confidentiality: 'രഹസ്യസ്വഭാവം',
        dispute: 'തർക്ക പരിഹാരം',
        indemnity: 'നഷ്ടപരിഹാരം',
        warranty: 'വാറന്റി',
        renewal: 'പുതുക്കൽ',
        cancellation: 'റദ്ദാക്കൽ',
        penalty: 'പിഴ',
        notice: 'അറിയിപ്പ്',
        default: 'വ്യവസ്ഥ'
      }
    },
    pa: {
      title: 'AI-ਪਛਾਣੀਆਂ ਮਹੱਤਵਪੂਰਨ ਧਾਰਾਵਾਂ',
      subtitle: 'AI ਦੁਆਰਾ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਜਾਂ ਖਤਰਨਾਕ ਵਜੋਂ ਫਲੈਗ ਕੀਤੀਆਂ ਧਾਰਾਵਾਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ, ਜਿਨ੍ਹਾਂ ਨੂੰ ਗੰਭੀਰਤਾ ਅਨੁਸਾਰ ਸਮੂਹਬੱਧ ਕੀਤਾ ਗਿਆ ਹੈ। ਸਾਦੀ ਭਾਸ਼ਾ ਦੀ ਵਿਆਖਿਆ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ \'ਸਰਲ ਕਰੋ\' ਬਟਨ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
      highRisk: 'ਉੱਚ ਖਤਰੇ ਵਾਲੀਆਂ ਧਾਰਾਵਾਂ',
      mediumRisk: 'ਮੱਧਮ ਖਤਰੇ ਵਾਲੀਆਂ ਧਾਰਾਵਾਂ',
      lowRisk: 'ਘੱਟ ਖਤਰੇ ਵਾਲੀਆਂ ਧਾਰਾਵਾਂ',
      generalClauses: 'ਆਮ ਧਾਰਾਵਾਂ',
      getLegalAdvice: 'ਕਾਨੂੰਨੀ ਸਲਾਹ ਲਵੋ',
      noClauses: 'ਕਿਸੇ ਵੀ ਧਾਰਾ ਦਾ ਵਿਸਥਾਰ ਵਿੱਚ ਵਿਸ਼ਲੇਸ਼ਣ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।',
      clauseLabel: 'ਧਾਰਾ',
      riskLabel: 'ਖਤਰਾ',
      clauseTypes: {
        payment: 'ਭੁਗਤਾਨ',
        termination: 'ਸਮਾਪਤੀ',
        liability: 'ਜ਼ਿੰਮੇਵਾਰੀ',
        confidentiality: 'ਗੁਪਤਤਾ',
        dispute: 'ਵਿਵਾਦ ਨਿਪਟਾਰਾ',
        indemnity: 'ਮੁਆਵਜ਼ਾ',
        warranty: 'ਵਾਰੰਟੀ',
        renewal: 'ਨਵੀਨੀਕਰਨ',
        cancellation: 'ਰੱਦ',
        penalty: 'ਜੁਰਮਾਨਾ',
        notice: 'ਨੋਟਿਸ',
        default: 'ਧਾਰਾ'
      }
    },
    or: {
      title: 'AI-ଚିହ୍ନିତ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଧାରାଗୁଡ଼ିକ',
      subtitle: 'ଗୁରୁତ୍ୱ ଅନୁସାରେ AI ଦ୍ୱାରା ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ବା ବିପଜ୍ଜନକ ଭାବେ ଚିହ୍ନିତ ଧାରାଗୁଡ଼ିକୁ ସମୀକ୍ଷା କରନ୍ତୁ। ସରଳ ଭାଷାରେ ବୁଝାଇବା ପାଇଁ \'ସରଳ କରନ୍ତୁ\' ବଟନ୍ ବ୍ୟବହାର କରନ୍ତୁ।',
      highRisk: 'ଉଚ୍ଚ ବିପଦ ଧାରା',
      mediumRisk: 'ମଧ୍ୟମ ବିପଦ ଧାରା',
      lowRisk: 'କମ୍ ବିପଦ ଧାରା',
      generalClauses: 'ସାଧାରଣ ଧାରା',
      getLegalAdvice: 'ଆଇନଗତ ପରାମର୍ଶ ନିଅନ୍ତୁ',
      noClauses: 'କୌଣସି ଧାରାକୁ ବିସ୍ତୃତ ଭାବରେ ବିଶ୍ଳେଷଣ କରାଯାଇ ନାହିଁ।',
      clauseLabel: 'ଧାରା',
      riskLabel: 'ବିପଦ',
      clauseTypes: {
        payment: 'ଦେୟ',
        termination: 'ସମାପ୍ତି',
        liability: 'ଦାୟିତ୍ୱ',
        confidentiality: 'ଗୋପନୀୟତା',
        dispute: 'ବିବାଦ ସମାଧାନ',
        indemnity: 'କ୍ଷତିପୂରଣ',
        warranty: 'ୱାରେଣ୍ଟି',
        renewal: 'ନବୀକରଣ',
        cancellation: 'ବାତିଲ',
        penalty: 'ଜରିମାନା',
        notice: 'ନୋଟିସ',
        default: 'ଧାରା'
      }
    },
  };
  
  const t = translations[language] || translations.en;
  
  const [expandedSections, setExpandedSections] = useState({
    high: true,
    medium: true,
    low: false,
    general: false
  });

  const handleLegalAdviceClick = () => {
    if (docId) {
      router.push(`/subscription?docId=${docId}`);
    } else {
      router.push('/subscription');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getTranslatedClauseType = (type) => {
    const lowerType = type.toLowerCase();
    return t.clauseTypes[lowerType] || t.clauseTypes.default;
  };

  const categorizedClauses = clauses.reduce((acc, clause) => {
    const category = clause.riskCategory || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(clause);
    return acc;
  }, {});

  const renderClauseCard = (clause, index) => {
    const riskClasses = {
      high: 'border-l-4 border-red-500 bg-red-900/10',
      medium: 'border-l-4 border-orange-500 bg-orange-900/10',
      low: 'border-l-4 border-green-500 bg-green-900/10',
      general: 'border-l-4 border-gray-500 bg-gray-700'
    };
    
    const riskBadge = {
      high: 'bg-red-600 text-red-100',
      medium: 'bg-orange-600 text-orange-100',
      low: 'bg-green-600 text-green-100',
      general: 'bg-gray-600 text-gray-100'
    };
    
    const originalClauseText = clause.text ? clause.text.replace(/\.\.\.$/, '') : 'No clause text available.';

    return (
      <div 
        key={index} 
        className={`border border-gray-700 rounded-lg p-4 transition-shadow hover:shadow-lg ${riskClasses[clause.riskCategory] || riskClasses.general}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
             <span className="font-semibold text-white capitalize text-lg mb-1">
               {getTranslatedClauseType(clause.type)} {t.clauseLabel}
             </span>
             <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskBadge[clause.riskCategory] || riskBadge.general}`}>
                  {t.riskLabel}: {clause.riskScore}/5 ({clause.riskCategory ? clause.riskCategory.toUpperCase() : 'GENERAL'})
                </span>
             </div>
          </div>
        </div>
        
        <div className="mt-2 p-3 bg-gray-900 rounded border border-gray-700">
           <p className="text-sm text-gray-300 italic">
              {originalClauseText}
           </p>
        </div>

        <div className="mt-4 border-t border-gray-700 pt-4 flex flex-col md:flex-row md:items-end md:space-x-4 space-y-3 md:space-y-0">
          <div className={`${clause.riskCategory === 'high' ? 'flex-1' : 'w-full'}`}>
             <PlainLanguageRewriter clause={{ text: originalClauseText, type: clause.type }} language={language} />
          </div>

          {clause.riskCategory === 'high' && (
            <button 
              onClick={handleLegalAdviceClick}
              className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm transition-all flex-shrink-0 w-full md:w-auto"
              title="Upgrade to access professional legal advice referral"
            >
              <Briefcase className="h-4 w-4" />
              <span>{t.getLegalAdvice}</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const SectionHeader = ({ icon: Icon, title, count, section, color }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors border border-gray-600 ${
        expandedSections[section] ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <h4 className="font-semibold text-white">{title}</h4>
        <span className="text-sm text-gray-400">({count} {t.clauseLabel.toLowerCase()}s)</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="h-5 w-5 text-gray-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center">
        <FileText className="h-6 w-6 text-blue-400 mr-2" />
        {t.title}
      </h2>
      <p className="text-gray-300">
        {t.subtitle}
      </p>

      {categorizedClauses.high?.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            icon={AlertTriangle}
            title={t.highRisk}
            count={categorizedClauses.high.length}
            section="high"
            color="text-red-400"
          />
          {expandedSections.high && (
            <div className="space-y-4">
              {categorizedClauses.high.map(renderClauseCard)}
            </div>
          )}
        </div>
      )}

      {categorizedClauses.medium?.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            icon={AlertTriangle}
            title={t.mediumRisk}
            count={categorizedClauses.medium.length}
            section="medium"
            color="text-orange-400"
          />
          {expandedSections.medium && (
            <div className="space-y-4">
              {categorizedClauses.medium.map(renderClauseCard)}
            </div>
          )}
        </div>
      )}
      
      {categorizedClauses.low?.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            icon={FileText}
            title={t.lowRisk}
            count={categorizedClauses.low.length}
            section="low"
            color="text-green-400"
          />
          {expandedSections.low && (
            <div className="space-y-4">
              {categorizedClauses.low.map(renderClauseCard)}
            </div>
          )}
        </div>
      )}
      
       {categorizedClauses.general?.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            icon={FileText}
            title={t.generalClauses}
            count={categorizedClauses.general.length}
            section="general"
            color="text-gray-400"
          />
          {expandedSections.general && (
            <div className="space-y-4">
              {categorizedClauses.general.map(renderClauseCard)}
            </div>
          )}
        </div>
      )}

      {clauses.length === 0 && (
        <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">{t.noClauses}</p>
        </div>
      )}
    </div>
  );
}