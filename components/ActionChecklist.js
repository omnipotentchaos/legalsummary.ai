// components/ActionChecklist.js
import { useState } from 'react';
import { CheckSquare, Square, Calendar, Bell, Download, Clock } from 'lucide-react';

// --- START: Date Helper Functions (FIXED for Calendar Integration) ---

export const formatTermDate = (dateString, targetLanguage) => {
  try {
    let date;
    let hasDay = false;
    const monthMap = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5, 
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11,
      'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5, 
      'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11,
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    
    const normalizedString = dateString.toLowerCase().replace(/\sde\s/g, ' ').replace(/\s\s+/g, ' ').trim();
    
    // Try DD Month YYYY (like "15 enero 2024" or "15 January 2024")
    const dmyParts = normalizedString.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
    if (dmyParts && monthMap[dmyParts[2]] !== undefined) {
        const day = parseInt(dmyParts[1], 10);
        const year = parseInt(dmyParts[3], 10);
        const monthIndex = monthMap[dmyParts[2]];
        date = new Date(year, monthIndex, day);
        hasDay = true;
    }
    
    // Try Month YYYY (like "enero 2024" or "January 2024")
    if (!date || isNaN(date.getTime())) {
        const myParts = normalizedString.match(/([a-z]+)\s+(\d{4})/i);
        if (myParts && monthMap[myParts[1]] !== undefined) {
            const year = parseInt(myParts[2], 10);
            const monthIndex = monthMap[myParts[1]];
            date = new Date(year, monthIndex, 1);
            hasDay = false;
        }
    }

    // Try standard date formats (MM/DD/YYYY, YYYY-MM-DD, etc)
    if (!date || isNaN(date.getTime())) {
        date = new Date(dateString);
        hasDay = !isNaN(date.getTime()) && dateString.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/);
    }
    
    if (date && !isNaN(date.getTime())) {
      const options = { year: 'numeric', month: 'long' };
      if (hasDay) {
        options.day = 'numeric';
      }
      const locale = targetLanguage === 'es' ? 'es-ES' : 
                     targetLanguage === 'fr' ? 'fr-FR' :
                     targetLanguage === 'de' ? 'de-DE' :
                     targetLanguage === 'hi' ? 'hi-IN' : 'en-US';
      return date.toLocaleDateString(locale, options);
    }
    
    return dateString;
  } catch (e) {
    console.error('Error formatting date:', dateString, e);
    return dateString;
  }
};


export const createGoogleCalendarUrl = (dateString, type, fileName) => {
  console.log('Creating calendar URL for:', dateString); // DEBUG
  
  let dateObj;
  
  // Enhanced month mapping for parsing
  const monthMap = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5, 
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11,
    'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5, 
    'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11,
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
  };
  
  const normalizedString = dateString.toLowerCase().replace(/\sde\s/g, ' ').replace(/\s\s+/g, ' ').trim();
  
  // Try DD Month YYYY format (e.g., "15 enero 2024")
  const dmyParts = normalizedString.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
  if (dmyParts && monthMap[dmyParts[2]] !== undefined) {
    const day = parseInt(dmyParts[1], 10);
    const year = parseInt(dmyParts[3], 10);
    const monthIndex = monthMap[dmyParts[2]];
    dateObj = new Date(year, monthIndex, day);
  }
  
  // Try Month YYYY format (e.g., "enero 2024")
  if (!dateObj || isNaN(dateObj.getTime())) {
    const myParts = normalizedString.match(/([a-z]+)\s+(\d{4})/i);
    if (myParts && monthMap[myParts[1]] !== undefined) {
      const year = parseInt(myParts[2], 10);
      const monthIndex = monthMap[myParts[1]];
      dateObj = new Date(year, monthIndex, 1);
    }
  }
  
  // Try ISO format (YYYY-MM-DD)
  if (!dateObj || isNaN(dateObj.getTime())) {
    const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      dateObj = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }
  }
  
  // Try standard US format (MM/DD/YYYY or MM-DD-YYYY)
  if (!dateObj || isNaN(dateObj.getTime())) {
    const usMatch = dateString.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
    if (usMatch) {
      let year = parseInt(usMatch[3]);
      if (year < 100) year += 2000; // Handle 2-digit years
      dateObj = new Date(year, parseInt(usMatch[1]) - 1, parseInt(usMatch[2]));
    }
  }
  
  // Last resort: try native Date parsing
  if (!dateObj || isNaN(dateObj.getTime())) {
    dateObj = new Date(dateString);
  }

  // Validate the final date object
  if (!dateObj || isNaN(dateObj.getTime())) {
    console.error('Failed to parse date:', dateString);
    return null;
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  const formattedDate = `${year}${month}${day}/${year}${month}${day}`;
  
  const text = encodeURIComponent(`Legal Date: ${type} - ${fileName}`);
  const details = encodeURIComponent(`Review this key date in your legal document: ${dateString}.`);
  
  console.log('Generated calendar URL for date:', formattedDate); // DEBUG
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${formattedDate}&details=${details}&sf=true&output=xml`;
};
// --- END: Date Helper Functions ---


export default function ActionChecklist({ documentData, dateTerms = [], language = 'en' }) {
  
  console.log('ActionChecklist received dateTerms:', dateTerms); // DEBUG
  
  const translations = {
    en: {
      title: 'Action Checklist & Key Dates',
      subtitle: 'A step-by-step list of actions and reminders for your document.',
      beforeSigning: 'Before Signing',
      afterSigning: 'After Signing',
      task1: 'Read entire document carefully',
      task2: 'Verify all monetary amounts are correct',
      task3: 'Check all dates (start, end, payment due)',
      task4: 'Understand termination conditions',
      task5: 'Review penalty clauses',
      task6: 'Confirm you can meet all obligations',
      task7: 'Keep signed copy in safe place',
      task8: 'Set calendar reminders for key dates',
      task9: 'Set up automatic payments if applicable',
      task10: 'Note termination notice period',
      task11: 'Save contact information for all parties',
      setCalendarTitle: 'Set Calendar',
      setCalendarSubtitle: 'Use the "Add to Calendar" buttons above for one-click reminder creation.',
      downloadChecklist: 'Download Checklist (.txt)',
      documentChecklist: 'DOCUMENT ACTION CHECKLIST',
      extractedDates: 'IMPORTANT DATES (extracted automatically):'
    },
    hi: {
      title: 'कार्य सूची और मुख्य तिथियां',
      subtitle: 'आपके दस्तावेज़ के लिए कार्यों और अनुस्मारकों की चरण-दर-चरण सूची।',
      beforeSigning: 'हस्ताक्षर करने से पहले',
      afterSigning: 'हस्ताक्षर करने के बाद',
      task1: 'पूरे दस्तावेज़ को ध्यान से पढ़ें',
      task2: 'सभी मौद्रिक राशियों की सटीकता की जाँच करें',
      task3: 'सभी तिथियां जांचें (शुरुआत, समाप्ति, भुगतान देय)',
      task4: 'समाप्ति की शर्तों को समझें',
      task5: 'दंड खंडों की समीक्षा करें',
      task6: 'पुष्टि करें कि आप सभी दायित्वों को पूरा कर सकते हैं',
      task7: 'हस्ताक्षरित प्रति सुरक्षित स्थान पर रखें',
      task8: 'मुख्य तिथियों के लिए कैलेंडर अनुस्मारक सेट करें',
      task9: 'यदि लागू हो तो स्वचालित भुगतान सेट करें',
      task10: 'समाप्ति नोटिस अवधि पर ध्यान दें',
      task11: 'सभी पक्षों के लिए संपर्क जानकारी सहेजें',
      setCalendarTitle: 'कैलेंडर सेट करें',
      setCalendarSubtitle: 'वन-क्लिक रिमाइंडर बनाने के लिए ऊपर "कैलेंडर में जोड़ें" बटन का उपयोग करें।',
      downloadChecklist: 'चेकलिस्ट डाउनलोड करें (.txt)',
      documentChecklist: 'दस्तावेज़ कार्य सूची',
      extractedDates: 'महत्वपूर्ण तिथियां (स्वचालित रूप से निकाली गई):'
    }
  };

  const t = translations[language] || translations.en;
  
  const generateChecklist = () => {
    const items = [
      { category: t.beforeSigning, tasks: [
        t.task1, t.task2, t.task3, t.task4, t.task5, t.task6
      ]},
      { category: t.afterSigning, tasks: [
        t.task7, t.task8, t.task9, t.task10, t.task11
      ]},
    ];
    return items;
  };
  
  const checklist = generateChecklist();
  const [checked, setChecked] = useState({});

  const toggleCheck = (category, index) => {
    const key = `${category}-${index}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const downloadChecklist = () => {
    let text = `📋 ${t.documentChecklist}\n\n`;
    checklist.forEach(section => {
      text += `${section.category}:\n`;
      section.tasks.forEach((task, i) => {
        text += `  ${i + 1}. ${task}\n`;
      });
      text += '\n';
    });
    
    if (dateTerms.length > 0) {
        text += `📅 ${t.extractedDates}\n`;
        dateTerms.forEach((term) => {
             text += `  - ${term.type}: ${formatTermDate(term.date, language)}\n`;
        });
        text += '\n';
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document-checklist.txt';
    a.click();
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 h-full flex flex-col">
        {/* The Action Panel Header, Checklist rendering, and all Date/Calendar rendering 
            blocks have been removed from this component as requested and moved to 
            KeyTermsExtracted.js to ensure a stacked, full-width layout. */}

      <div className="space-y-6 flex-1 overflow-y-auto">
        
        {/* Keeping only the basic calendar tip and checklist section, but the Checklist itself is commented out */}
        <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 flex-shrink-0">
        <div className="flex items-start space-x-2">
          <Bell className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            {/* FIXED: Added Set Calendar translation */}
            <p className="text-yellow-200 font-medium">{t.setCalendarTitle}</p>
            <p className="text-yellow-300 text-sm mt-1">
              {t.setCalendarSubtitle}
            </p>
          </div>
        </div>
      </div>
        
      </div>

      
    </div>
  );
}