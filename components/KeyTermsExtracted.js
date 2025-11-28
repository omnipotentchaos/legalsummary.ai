// components/KeyTermsExtracted.js
import { useState } from 'react';
import { DollarSign, AlertTriangle, Clock, FileText, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { createGoogleCalendarUrl } from './ActionChecklist';

// --- HELPER FUNCTIONS (Extraction Logic - Same as before) ---
export const extractFinancialTerms = (fullText) => {
  if (!fullText) return [];
  const currencyPatterns = [/\$[\d,]+(?:\.\d{2})?/g, /€[\d\s,]+(?:[.,]\d{2})?/g, /£[\d,]+(?:\.\d{2})?/g, /₹[\d,]+(?:\.\d{2})?/g, /\bRs\.?\s+[\d,]+(?:\.\d{2})?/g];
  const allMatches = [];
  currencyPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(fullText)) !== null) {
      allMatches.push({ amount: match[0].trim(), index: match.index });
    }
  });
  const rawTerms = allMatches.map(({ amount, index }) => {
    const contextStart = Math.max(0, index - 60);
    const contextEnd = Math.min(fullText.length, index + amount.length + 60);
    const context = fullText.substring(contextStart, contextEnd).trim();
    const lowerContext = context.toLowerCase();
    let type = 'Payment';
    if (lowerContext.match(/deposit/i)) type = 'Deposit';
    else if (lowerContext.match(/rent/i)) type = 'Rent';
    else if (lowerContext.match(/late fee|penalty/i)) type = 'Late Fee';
    else if (lowerContext.match(/fee|charge/i)) type = 'Fee';
    return { amount, type, context };
  });
  const uniqueTerms = [];
  const seen = new Set();
  rawTerms.forEach(term => {
    const key = `${term.amount}-${term.type}`;
    if (!seen.has(key)) { seen.add(key); uniqueTerms.push(term); }
  });
  return uniqueTerms;
};

export const extractDateTerms = (fullText) => {
  if (!fullText) return [];
  const datePatterns = [/\d{1,2}\/\d{1,2}\/\d{2,4}/g, /\d{4}-\d{2}-\d{2}/g, /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi];
  const terms = [];
  datePatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(fullText)) !== null) {
      const date = match[0];
      const context = fullText.substring(Math.max(0, match.index - 50), Math.min(fullText.length, match.index + 50)).trim();
      let type = 'Important Date';
      if (context.match(/start|begin|effective/i)) type = 'Start Date';
      else if (context.match(/end|expire|terminate/i)) type = 'End Date';
      else if (context.match(/due|deadline/i)) type = 'Due Date';
      terms.push({ date, type, context });
    }
  });
  return terms.filter((t, index, self) => index === self.findIndex(x => x.date === t.date));
};

export const extractNoticePeriods = (fullText) => {
  if (!fullText) return [];
  const terms = [];
  const noticePattern = /(\d+|one|two|three|four|five|ten|thirty|sixty|ninety)\s+(?:days?|weeks?|months?)\s+(?:written\s+)?notice/gi;
  let match;
  while ((match = noticePattern.exec(fullText)) !== null) {
    terms.push({
      period: match[0],
      type: 'Notice Period',
      context: fullText.substring(Math.max(0, match.index - 60), Math.min(fullText.length, match.index + 60)).trim()
    });
  }
  const unique = [];
  const seen = new Set();
  terms.forEach(t => { if(!seen.has(t.period)) { seen.add(t.period); unique.push(t); }});
  return unique;
};

export const extractPenalties = (fullText) => {
  if (!fullText) return [];
  const terms = [];
  const keywords = ['penalty', 'fine', 'breach', 'violation', 'forfeit', 'eviction', 'termination'];
  keywords.forEach(keyword => {
    let regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    let match;
    while ((match = regex.exec(fullText.toLowerCase())) !== null) {
      const context = fullText.substring(Math.max(0, match.index - 60), Math.min(fullText.length, match.index + 100)).trim();
      let severity = 'medium';
      if (context.match(/immediate|evict|forfeit/i)) severity = 'high';
      else if (context.match(/may|possible/i)) severity = 'low';
      terms.push({
        type: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        severity,
        context,
        riskScore: severity === 'high' ? 5 : 3
      });
    }
  });
  return terms;
};

// --- MAIN COMPONENT ---

export default function KeyTermsExtracted({ documentData, language = 'en' }) {
  const [expandedSections, setExpandedSections] = useState({ financial: true, penalties: true, notices: true, dates: true });
  
  const fullText = documentData.originalText || '';
  const financialTerms = extractFinancialTerms(fullText);
  const penalties = extractPenalties(fullText);
  const noticePeriods = extractNoticePeriods(fullText);
  const dateTerms = extractDateTerms(fullText);

  // --- FULL TRANSLATION DICTIONARY ---
  const translations = {
    en: { title: 'Key Terms & Data', subtitle: 'Specific financial and risk values identified in your document.', financial: 'Financial Terms', dates: 'Important Dates', notices: 'Notice Periods', risks: 'Risks & Penalties', penaltiesHeader: 'Penalties & Consequences', noticesHeader: 'Notice Periods & Deadlines', datesHeader: 'Important Dates', found: 'found', highRisk: 'HIGH RISK', lowRisk: 'LOW RISK', addToCalendar: 'Add to Calendar' },
    hi: { title: 'प्रमुख शर्तें और डेटा', subtitle: 'दस्तावेज़ में पहचाने गए विशिष्ट वित्तीय और जोखिम मूल्य।', financial: 'वित्तीय शर्तें', dates: 'महत्वपूर्ण तिथियां', notices: 'नोटिस अवधि', risks: 'जोखिम और दंड', penaltiesHeader: 'दंड और परिणाम', noticesHeader: 'नोटिस अवधि और समय सीमा', datesHeader: 'महत्वपूर्ण तिथियां', found: 'मिला', highRisk: 'उच्च जोखिम', lowRisk: 'कम जोखिम', addToCalendar: 'कैलेंडर में जोड़ें' },
    bn: { title: 'মূল শর্তাবলী এবং ডেটা', subtitle: 'আপনার নথিতে চিহ্নিত নির্দিষ্ট আর্থিক এবং ঝুঁকির মান।', financial: 'আর্থিক শর্তাবলী', dates: 'গুরুত্বপূর্ণ তারিখ', notices: 'নোটিশ সময়কাল', risks: 'ঝুঁকি এবং জরিমানা', penaltiesHeader: 'জরিমানা এবং ফলাফল', noticesHeader: 'নোটিশ সময়কাল এবং সময়সীমা', datesHeader: 'গুরুত্বপূর্ণ তারিখ', found: 'পাওয়া গেছে', highRisk: 'উচ্চ ঝুঁকি', lowRisk: 'কম ঝুঁকি', addToCalendar: 'ক্যালেন্ডারে যোগ করুন' },
    te: { title: 'ముఖ్య నిబంధనలు & డేటా', subtitle: 'మీ పత్రంలో గుర్తించబడిన నిర్దిష్ట ఆర్థిక మరియు ప్రమాద విలువలు.', financial: 'ఆర్థిక నిబంధనలు', dates: 'ముఖ్యమైన తేదీలు', notices: 'నోటీసు కాలాలు', risks: 'ప్రమాదాలు & జరిమానాలు', penaltiesHeader: 'జరిమానాలు & పర్యవసానాలు', noticesHeader: 'నోటీసు కాలాలు & గడువులు', datesHeader: 'ముఖ్యమైన తేదీలు', found: 'కనుగొనబడింది', highRisk: 'అధిక ప్రమాదం', lowRisk: 'తక్కువ ప్రమాదం', addToCalendar: 'క్యాలెండర్‌కు జోడించు' },
    mr: { title: 'महत्त्वाच्या अटी आणि डेटा', subtitle: 'तुमच्या दस्तऐवजात ओळखलेली विशिष्ट आर्थिक आणि जोखीम मूल्ये.', financial: 'आर्थिक अटी', dates: 'महत्त्वाच्या तारखा', notices: 'सूचना कालावधी', risks: 'जोखीम आणि दंड', penaltiesHeader: 'दंड आणि परिणाम', noticesHeader: 'सूचना कालावधी आणि मुदत', datesHeader: 'महत्त्वाच्या तारखा', found: 'आढळले', highRisk: 'उच्च जोखीम', lowRisk: 'कमी जोखीम', addToCalendar: 'कॅलेंडरमध्ये जोडा' },
    ta: { title: 'முக்கிய விதிமுறைகள் & தரவு', subtitle: 'உங்கள் ஆவணத்தில் அடையாளம் காணப்பட்ட குறிப்பிட்ட நிதி மற்றும் இடர் மதிப்புகள்.', financial: 'நிதி விதிமுறைகள்', dates: 'முக்கிய தேதிகள்', notices: 'அறிவிப்பு காலங்கள்', risks: 'இடர்கள் & அபராதங்கள்', penaltiesHeader: 'அபராதங்கள் & விளைவுகள்', noticesHeader: 'அறிவிப்பு காலங்கள் & காலக்கெடு', datesHeader: 'முக்கிய தேதிகள்', found: 'கண்டறியப்பட்டது', highRisk: 'அதிக ஆபத்து', lowRisk: 'குறைந்த ஆபத்து', addToCalendar: 'நாட்காட்டியில் சேர்' },
    ur: { title: 'اہم شرائط اور ڈیٹا', subtitle: 'آپ کی دستاویز میں شناخت کی گئی مخصوص مالی اور خطرے کی اقدار۔', financial: 'مالی شرائط', dates: 'اہم تواریخ', notices: 'نوٹس کی مدت', risks: 'خطرات اور جرمانے', penaltiesHeader: 'جرمانے اور نتائج', noticesHeader: 'نوٹس کی مدت اور ڈیڈ لائن', datesHeader: 'اہم تواریخ', found: 'ملا', highRisk: 'زیادہ خطرہ', lowRisk: 'کم خطرہ', addToCalendar: 'کیلنڈر میں شامل کریں' },
    gu: { title: 'મુખ્ય શરતો અને ડેટા', subtitle: 'તમારા દસ્તાવેજમાં ઓળખાયેલ ચોક્કસ નાણાકીય અને જોખમ મૂલ્યો.', financial: 'નાણાકીય શરતો', dates: 'મહત્વપૂર્ણ તારીખો', notices: 'નોટિસ સમયગાળો', risks: 'જોખમો અને દંડ', penaltiesHeader: 'દંડ અને પરિણામો', noticesHeader: 'નોટિસ સમયગાળો અને સમયમર્યાદા', datesHeader: 'મહત્વપૂર્ણ તારીખો', found: 'મળ્યું', highRisk: 'ઉચ્ચ જોખમ', lowRisk: 'ઓછું જોખમ', addToCalendar: 'કેલેન્ડરમાં ઉમેરો' },
    kn: { title: 'ಪ್ರಮುಖ ನಿಯಮಗಳು ಮತ್ತು ಡೇಟಾ', subtitle: 'ನಿಮ್ಮ ದಾಖಲೆಯಲ್ಲಿ ಗುರುತಿಸಲಾದ ನಿರ್ದಿಷ್ಟ ಹಣಕಾಸು ಮತ್ತು ಅಪಾಯದ ಮೌಲ್ಯಗಳು.', financial: 'ಹಣಕಾಸಿನ ನಿಯಮಗಳು', dates: 'ಪ್ರಮುಖ ದಿನಾಂಕಗಳು', notices: 'ಸೂಚನೆ ಅವಧಿಗಳು', risks: 'ಅಪಾಯಗಳು ಮತ್ತು ದಂಡಗಳು', penaltiesHeader: 'ದಂಡಗಳು ಮತ್ತು ಪರಿಣಾಮಗಳು', noticesHeader: 'ಸೂಚನೆ ಅವಧಿಗಳು ಮತ್ತು ಗಡುವುಗಳು', datesHeader: 'ಪ್ರಮುಖ ದಿನಾಂಕಗಳು', found: 'ಕಂಡುಬಂದಿದೆ', highRisk: 'ಅಧಿಕ ಅಪಾಯ', lowRisk: 'ಕಡಿಮೆ ಅಪಾಯ', addToCalendar: 'ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ' },
    ml: { title: 'പ്രധാന വ്യവസ്ഥകളും ഡാറ്റയും', subtitle: 'നിങ്ങളുടെ രേഖയിൽ തിരിച്ചറിഞ്ഞ നിർദ്ദിഷ്ട സാമ്പത്തിക, അപകടസാധ്യത മൂല്യങ്ങൾ.', financial: 'സാമ്പത്തിക വ്യവസ്ഥകൾ', dates: 'പ്രധാന തീയതികൾ', notices: 'നോട്ടീസ് കാലയളവ്', risks: 'അപകടസാധ്യതകളും പിഴകളും', penaltiesHeader: 'പിഴകളും അനന്തരഫലങ്ങളും', noticesHeader: 'നോട്ടീസ് കാലയളവും സമയപരിധിയും', datesHeader: 'പ്രധാന തീയതികൾ', found: 'കണ്ടെത്തി', highRisk: 'ഉയർന്ന അപകടസാധ്യത', lowRisk: 'കുറഞ്ഞ അപകടസാധ്യത', addToCalendar: 'കലണ്ടറിലേക്ക് ചേർക്കുക' },
    pa: { title: 'ਮੁੱਖ ਸ਼ਰਤਾਂ ਅਤੇ ਡੇਟਾ', subtitle: 'ਤੁਹਾਡੇ ਦਸਤਾਵੇਜ਼ ਵਿੱਚ ਪਛਾਣੇ ਗਏ ਵਿਸ਼ੇਸ਼ ਵਿੱਤੀ ਅਤੇ ਜੋਖਮ ਮੁੱਲ।', financial: 'ਵਿੱਤੀ ਸ਼ਰਤਾਂ', dates: 'ਮਹੱਤਵਪੂਰਨ ਤਾਰੀਖਾਂ', notices: 'ਨੋਟਿਸ ਪੀਰੀਅਡ', risks: 'ਜੋਖਮ ਅਤੇ ਜੁਰਮਾਨੇ', penaltiesHeader: 'ਜੁਰਮਾਨੇ ਅਤੇ ਨਤੀਜੇ', noticesHeader: 'ਨੋਟਿਸ ਪੀਰੀਅਡ ਅਤੇ ਸਮਾਂ ਸੀਮਾਵਾਂ', datesHeader: 'ਮਹੱਤਵਪੂਰਨ ਤਾਰੀਖਾਂ', found: 'ਲੱਭਿਆ', highRisk: 'ਉੱਚ ਜੋਖਮ', lowRisk: 'ਘੱਟ ਜੋਖਮ', addToCalendar: 'ਕੈਲੰਡਰ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ' },
    or: { title: 'ମୁଖ୍ୟ ସର୍ତ୍ତାବଳୀ ଏବଂ ତଥ୍ୟ', subtitle: 'ଆପଣଙ୍କ ଦସ୍ତାବିଜରେ ଚିହ୍ନଟ ହୋଇଥିବା ନିର୍ଦ୍ଦିଷ୍ଟ ଆର୍ଥିକ ଏବଂ ବିପଦ ମୂଲ୍ୟ।', financial: 'ଆର୍ଥିକ ସର୍ତ୍ତାବଳୀ', dates: 'ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ତାରିଖ', notices: 'ନୋଟିସ୍ ଅବଧି', risks: 'ବିପଦ ଏବଂ ଜରିମାନା', penaltiesHeader: 'ଜରିମାନା ଏବଂ ପରିଣାମ', noticesHeader: 'ନୋଟିସ୍ ଅବଧି ଏବଂ ସମୟସୀମା', datesHeader: 'ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ତାରିଖ', found: 'ମିଳିଲା', highRisk: 'ଉଚ୍ଚ ବିପଦ', lowRisk: 'କମ୍ ବିପଦ', addToCalendar: 'କ୍ୟାଲେଣ୍ଡରରେ ଯୋଡନ୍ତୁ' }
  };

  const t = translations[language] || translations.en;

  const stats = [
    { label: t.financial, value: financialTerms.length, color: 'text-[#34A853]' },
    { label: t.dates, value: dateTerms.length, color: 'text-[#4285F4]' },
    { label: t.notices, value: noticePeriods.length, color: 'text-[#FBBC05]' },
    { label: t.risks, value: penalties.length, color: 'text-[#EA4335]' },
  ];

  const SectionHeader = ({ icon: Icon, title, count, section, color }) => (
    <button
      onClick={() => setExpandedSections(p => ({...p, [section]: !p[section]}))}
      className="w-full flex items-center justify-between p-5 bg-[#202020] hover:bg-[#252525] border border-[#333333] transition-colors rounded-lg mb-3 shadow-sm group"
    >
      <div className="flex items-center space-x-4">
        <Icon className={`h-6 w-6 ${color}`} />
        <h4 className="text-xl font-bold text-white group-hover:text-gray-200">{title}</h4>
        <span className="text-sm text-gray-400 bg-[#171717] px-3 py-1 rounded border border-[#333333]">{count} {t.found}</span>
      </div>
      {expandedSections[section] ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
    </button>
  );

  return (
    <div className="bg-[#171717] rounded-xl border border-[#333333] h-full w-full shadow-sm">
      <div className="border-b border-[#333333] p-6">
        <h3 className="text-2xl font-bold text-white flex items-center mb-2">
          <FileText className="h-7 w-7 text-[#4285F4] mr-3" />
          {t.title}
        </h3>
        <p className="text-gray-400 text-base">{t.subtitle}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#333333]">
            {stats.map((stat, i) => (
                <div key={i} className="text-center group">
                    <div className={`text-3xl font-bold ${stat.color} transition-transform group-hover:scale-110`}>{stat.value}</div>
                    <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
                </div>
            ))}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {penalties.length > 0 && (
          <div>
            <SectionHeader icon={AlertTriangle} title={t.penaltiesHeader} count={penalties.length} section="penalties" color="text-[#EA4335]" />
            {expandedSections.penalties && (
              <div className="space-y-3 pl-1">
                {penalties.map((term, i) => (
                  <div key={i} className="bg-[#202020] rounded-lg p-5 border-l-4 border-y border-r border-[#333333] transition-all hover:-translate-y-1 hover:shadow-lg" style={{ borderLeftColor: term.severity === 'high' ? '#EA4335' : '#FBBC05' }}>
                    <div className="flex justify-between items-start mb-3">
                        <span className={`text-base font-bold uppercase ${term.severity === 'high' ? 'text-[#EA4335]' : 'text-[#FBBC05]'}`}>{term.type}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded text-white ${term.severity === 'high' ? 'bg-[#EA4335]' : 'bg-[#FBBC05] text-black'}`}>
                            {term.severity === 'high' ? t.highRisk : t.lowRisk}
                        </span>
                    </div>
                    <p className="text-gray-400 text-base italic leading-relaxed">"...{term.context}..."</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {noticePeriods.length > 0 && (
          <div>
            <SectionHeader icon={Clock} title={t.noticesHeader} count={noticePeriods.length} section="notices" color="text-[#FBBC05]" />
            {expandedSections.notices && (
              <div className="space-y-3 pl-1">
                {noticePeriods.map((term, i) => (
                  <div key={i} className="bg-[#202020] rounded-lg p-5 border-l-4 border-[#FBBC05] border-y border-r border-[#333333] transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xl font-bold text-[#FBBC05]">{term.period}</span>
                        <span className="text-sm text-gray-400 bg-[#171717] px-2 py-1 rounded border border-[#333333]">{term.type}</span>
                    </div>
                    <p className="text-gray-400 text-base italic leading-relaxed">"...{term.context}..."</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {financialTerms.length > 0 && (
          <div>
            <SectionHeader icon={DollarSign} title={t.financial} count={financialTerms.length} section="financial" color="text-[#34A853]" />
            {expandedSections.financial && (
              <div className="space-y-3 pl-1">
                {financialTerms.map((term, i) => (
                  <div key={i} className="bg-[#202020] rounded-lg p-5 border-l-4 border-[#34A853] border-y border-r border-[#333333] transition-all hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xl font-bold text-[#34A853]">{term.amount}</span>
                        <span className="text-sm text-gray-400 bg-[#171717] px-2 py-1 rounded border border-[#333333]">{term.type}</span>
                    </div>
                    <p className="text-gray-400 text-base italic leading-relaxed">"...{term.context}..."</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {dateTerms.length > 0 && (
            <div className="mt-4 pt-2">
                <div className="bg-[#202020] rounded-lg p-6 border border-[#333333]">
                    <h3 className="text-white text-base font-bold mb-5 flex items-center uppercase tracking-wide">
                        <Calendar className="h-5 w-5 mr-2 text-[#4285F4]" /> {t.datesHeader}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {dateTerms.map((term, i) => (
                            <div key={i} className="flex flex-col p-4 bg-[#171717] rounded border border-[#333333] hover:border-[#4285F4]/50 transition-colors">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-[#4285F4] text-sm font-bold uppercase mb-1">{term.type}</p>
                                        <p className="text-white text-lg font-bold">{term.date}</p>
                                    </div>
                                    <a href={createGoogleCalendarUrl(term.date, term.type, 'Document')} target="_blank" className="text-sm bg-[#252525] text-gray-300 hover:text-white hover:bg-[#333333] px-4 py-2 rounded border border-[#333333] transition-colors whitespace-nowrap font-medium">
                                        {t.addToCalendar}
                                    </a>
                                </div>
                                <p className="text-gray-500 text-sm italic border-t border-[#333333] pt-2 mt-1">"...{term.context}..."</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}