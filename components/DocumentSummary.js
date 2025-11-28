import { FileText, Users, DollarSign, Calendar, AlertTriangle, ShieldCheck, Copy, Download, Info } from 'lucide-react'; 
import ReactMarkdown from 'react-markdown';

export default function DocumentSummary({ documentData, language = 'en' }) {
  const summary = documentData.summary || '';

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary).then(() => {
      alert('Summary copied to clipboard!');
    }).catch(err => console.error('Could not copy text: ', err));
  };

  const handleDownloadSummary = () => {
    const filename = `${documentData.fileName.replace(/\..+$/, '')}_summary.txt`;
    const text = `Document Summary: ${documentData.fileName}\n\n${summary}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- 1. UI STATIC TEXT TRANSLATIONS ---
  const uiTranslations = {
    en: { title: 'Document Analysis Summary', subtitle: 'A clear breakdown of your document\'s most important terms.', keyDetails: 'Key Details & Overview' },
    hi: { title: 'दस्तावेज़ विश्लेषण सारांश', subtitle: 'आपके दस्तावेज़ की सबसे महत्वपूर्ण शर्तों का स्पष्ट विवरण।', keyDetails: 'प्रमुख विवरण और अवलोकन' },
    mr: { title: 'दस्तऐवज विश्लेषण सारांश', subtitle: 'तुमच्या दस्तऐवजातील सर्वात महत्त्वाच्या अटींचे स्पष्ट विश्लेषण.', keyDetails: 'मुख्य तपशील आणि विहंगावलोकन' },
    bn: { title: 'নথি বিশ্লেষণ সারাংশ', subtitle: 'গুরুত্বপূর্ণ শর্তাবলীর স্পষ্ট বিভাজন।', keyDetails: 'মূল বিবরণ' },
    te: { title: 'పత్ర విశ్లేషణ సారాంశం', subtitle: 'ముఖ్యమైన నిబంధనల విభజన.', keyDetails: 'ముఖ్య వివరాలు' },
    ta: { title: 'ஆவணப் பகுப்பாய்வு சுருக்கம்', subtitle: 'முக்கியமான விதிமுறைகளின் தெளிவான முறிவு.', keyDetails: 'முக்கிய விவரங்கள்' },
    ur: { title: 'دستاویزی تجزیہ کا خلاصہ', subtitle: 'اہم ترین شرائط کی واضح تفصیل۔', keyDetails: 'کلیدی تفصیلات' },
    gu: { title: 'દસ્તાવેજ વિશ્લેષણ સારાંશ', subtitle: 'મહત્વપૂર્ણ શરતોનું સ્પષ્ટ વિભાજન.', keyDetails: 'મુખ્ય વિગતો' },
    kn: { title: 'ದಾಖಲೆ ವಿಶ್ಲೇಷಣೆ ಸಾರಾಂಶ', subtitle: 'ಪ್ರಮುಖ ನಿಯಮಗಳ ಸ್ಪಷ್ಟ ವಿಂಗಡಣೆ.', keyDetails: 'ಪ್ರಮುಖ ವಿವರಗಳು' },
    ml: { title: 'രേഖാ വിശകലന സംഗ്രഹം', subtitle: 'പ്രധാന നിബന്ധനകളുടെ അവലോകനം.', keyDetails: 'പ്രധാന വിവരങ്ങൾ' },
    pa: { title: 'ਦਸਤਾਵੇਜ਼ ਵਿਸ਼ਲੇਸ਼ਣ ਸਾਰ', subtitle: 'ਮਹੱਤਵਪੂਰਨ ਸ਼ਰਤਾਂ ਦਾ ਵੇਰਵਾ।', keyDetails: 'ਮੁੱਖ ਵੇਰਵੇ' },
    or: { title: 'ଦସ୍ତାବିଜ ବିଶ୍ଳେଷଣ ସାରାଂଶ', subtitle: 'ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ସର୍ତ୍ତାବଳୀର ବିବରଣୀ।', keyDetails: 'ମୁଖ୍ୟ ବିବରଣୀ' }
  };

  // --- 2. HEADER MAPPINGS (ROBUST) ---
  // Mappings for swapping English headers from AI to Target Language
  const headerMappings = {
    en: {
      'Parties': 'Parties Involved',
      'Financial': 'Financial Obligations',
      'Rights': 'Rights and Obligations',
      'Termination': 'Termination and Renewal',
      'Risks': 'Risks and Penalties',
      'Risk': 'Risks and Penalties',
      'Critical': 'Critical Risk Assessment'
    },
    hi: {
      'Parties': 'संबंधित पक्ष',
      'Financial': 'वित्तीय दायित्व',
      'Rights': 'अधिकार और दायित्व',
      'Termination': 'समाप्ति और नवीनीकरण',
      'Risks': 'जोखिम और दंड',
      'Risk': 'जोखिम और दंड',
      'Critical': 'गंभीर जोखिम मूल्यांकन'
    },
    mr: {
      'Parties': 'संबंधित पक्ष',
      'Financial': 'आर्थिक दायित्वे',
      'Rights': 'हक्क आणि दायित्वे',
      'Termination': 'समाप्ती आणि नूतनीकरण',
      'Risks': 'जोखीम आणि दंड',
      'Risk': 'जोखीम आणि दंड',
      'Critical': 'गंभीर जोखीम मूल्यांकन'
    },
    // Fallbacks for other languages to ensure they at least get translated headers
    bn: { 'Parties': 'জড়িত পক্ষ', 'Financial': 'আর্থিক বাধ্যবাধকতা', 'Rights': 'অধিকার', 'Termination': 'সমাপ্তি', 'Risks': 'ঝুঁকি', 'Critical': 'গুরুত্বপূর্ণ ঝুঁকি' },
    gu: { 'Parties': 'સંબંધિત પક્ષો', 'Financial': 'નાણાકીય', 'Rights': 'અધિકારો', 'Termination': 'સમાપ્તિ', 'Risks': 'જોખમો', 'Critical': 'ગંભીર જોખમ' },
    te: { 'Parties': 'పార్టీలు', 'Financial': 'ఆర్థిక', 'Rights': 'హక్కులు', 'Termination': 'రద్దు', 'Risks': 'ప్రమాదాలు', 'Critical': 'కీలక రిస్క్' },
    ta: { 'Parties': 'தரப்பினர்', 'Financial': 'நிதி', 'Rights': 'உரிமைகள்', 'Termination': 'முடிவு', 'Risks': 'ஆபத்துகள்', 'Critical': 'முக்கிய ஆபத்து' },
    kn: { 'Parties': 'ಪಕ್ಷಗಳು', 'Financial': 'ಹಣಕಾಸು', 'Rights': 'ಹಕ್ಕುಗಳು', 'Termination': 'ಮುಕ್ತಾಯ', 'Risks': 'ಅಪಾಯಗಳು', 'Critical': 'ಗಂಭೀರ ಅಪಾಯ' },
    ml: { 'Parties': 'കക്ഷികൾ', 'Financial': 'സാമ്പത്തിക', 'Rights': 'അവകാശങ്ങൾ', 'Termination': 'അവസാനിപ്പിക്കൽ', 'Risks': 'അപകടസാധ്യത', 'Critical': 'നിർണ്ണായക' },
    pa: { 'Parties': 'ਧਿਰਾਂ', 'Financial': 'ਵਿੱਤੀ', 'Rights': 'ਅਧਿਕਾਰ', 'Termination': 'ਸਮਾਪਤੀ', 'Risks': 'ਜੋਖਮ', 'Critical': 'ਗੰਭੀਰ' },
    or: { 'Parties': 'ପକ୍ଷ', 'Financial': 'ଆର୍ଥିକ', 'Rights': 'ଅଧିକାର', 'Termination': 'ସମାପ୍ତି', 'Risks': 'ବିପଦ', 'Critical': 'ଗୁରୁତର' },
    ur: { 'Parties': 'پارٹیاں', 'Financial': 'مالی', 'Rights': 'حقوق', 'Termination': 'خاتمہ', 'Risks': 'خطرات', 'Critical': 'اہم' }
  };

  const t = uiTranslations[language] || uiTranslations.en;
  const h = headerMappings[language] || headerMappings.en;

  // Helper function to translate a header string with NORMALIZATION
  const translateHeader = (rawTitle) => {
    // 1. Normalize: Remove '**', ':', trim whitespace, lowercase
    const cleanTitle = rawTitle.replace(/[*_:]/g, '').trim().toLowerCase();
    
    // 2. Check for keywords
    if (cleanTitle.includes('parties')) return h['Parties'];
    if (cleanTitle.includes('financial') || cleanTitle.includes('payment')) return h['Financial'];
    if (cleanTitle.includes('rights') || cleanTitle.includes('obligation')) return h['Rights'];
    if (cleanTitle.includes('termination') || cleanTitle.includes('renewal')) return h['Termination'];
    if (cleanTitle.includes('risk') || cleanTitle.includes('penalt')) return h['Risks'];
    if (cleanTitle.includes('critical')) return h['Critical'];

    return rawTitle.replace(/[*_]/g, ''); // Fallback: just clean up markdown
  };
  
  // --- PARSING LOGIC ---
  const rawSections = summary.split(/(?:^|\n)##\s+/).filter(s => s.trim().length > 0);
  
  const mainFactsContent = rawSections.length > 0 && !rawSections[0].startsWith('#') 
    ? rawSections[0] 
    : null;

  const cardSectionsRaw = mainFactsContent ? rawSections.slice(1) : rawSections;

  const colorPalette = [
    { icon: Users, color: '#4285F4', bg: 'rgba(66, 133, 244, 0.10)' },
    { icon: DollarSign, color: '#34A853', bg: 'rgba(52, 168, 83, 0.10)' },
    { icon: ShieldCheck, color: '#A142F4', bg: 'rgba(161, 66, 244, 0.10)' },
    { icon: Calendar, color: '#FBBC05', bg: 'rgba(251, 188, 5, 0.10)' },
    { icon: AlertTriangle, color: '#EA4335', bg: 'rgba(234, 67, 53, 0.10)' }
  ];

  const summarySections = cardSectionsRaw.map((section, index) => {
    const firstNewline = section.indexOf('\n');
    const rawTitle = firstNewline > 0 ? section.substring(0, firstNewline).trim() : section.substring(0, 50).trim();
    const content = firstNewline > 0 ? section.substring(firstNewline + 1).trim() : section.trim();
    
    // Translate the header
    const title = translateHeader(rawTitle);

    // Assign Color
    let config = colorPalette[index % colorPalette.length];
    
    // Smart Icon Matching (based on the English keywords in raw title)
    const cleanRaw = rawTitle.toLowerCase();
    if (cleanRaw.includes('parties')) config = colorPalette[0];
    else if (cleanRaw.includes('financial')) config = colorPalette[1];
    else if (cleanRaw.includes('rights')) config = colorPalette[2];
    else if (cleanRaw.includes('termination')) config = colorPalette[3];
    else if (cleanRaw.includes('risk')) config = colorPalette[4];
    
    return { title, content, ...config };
  }).filter(s => s.content.length > 20);

  return (
    <div className="space-y-6">
      <div className="bg-[#171717] rounded-xl border border-[#333333] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center mb-2">
            <FileText className="h-7 w-7 text-[#4285F4] mr-3" />
            {t.title}
          </h2>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleCopySummary} className="p-2.5 rounded-lg bg-[#252525] hover:bg-[#333333] text-gray-300 border border-[#333333]" title="Copy"><Copy className="h-5 w-5" /></button>
          <button onClick={handleDownloadSummary} className="p-2.5 rounded-lg bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-md" title="Download"><Download className="h-5 w-5" /></button>
        </div>
      </div>

      

      <div className="columns-1 md:columns-2 gap-6 space-y-6">
        {summarySections.map((section, index) => (
          <div key={index} className="break-inside-avoid rounded-xl border p-6 transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden flex flex-col mb-6"
            style={{ backgroundColor: '#171717', borderColor: '#333333', borderTopWidth: '4px', borderTopColor: section.color }}>
            <div className="flex items-center space-x-4 mb-5 pb-4 border-b border-[#333333]">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: section.bg }}>
                <section.icon className="h-6 w-6" style={{ color: section.color }} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{section.title}</h3>
            </div>
            <div className="text-gray-300 text-lg leading-relaxed">
              <ReactMarkdown components={{
                  strong: ({node, ...props}) => <span className="block w-full mt-4 mb-2 text-white font-bold text-sm uppercase tracking-wide opacity-90" style={{ color: section.color }} {...props} />,
                  li: ({node, ...props}) => <li className="mb-3 ml-5 list-disc marker:text-gray-500 pl-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3" {...props} />
                }}>
                {section.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}