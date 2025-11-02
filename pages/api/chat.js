// Enhanced API route for chatbot with proper language support
import { DocumentProcessor } from '../../lib/documentProcessor';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, documentText, language = 'en' } = req.body;

    if (!question || !documentText) {
      return res.status(400).json({ 
        error: 'Question and document text are required' 
      });
    }

    console.log(`Processing chat question in language: ${language}`);

    const processor = new DocumentProcessor();
    
    // Get the answer in the requested language
    const rawAnswer = await processor.answerQuestion(question, documentText, language);
    
    // Decorate the response with structured formatting
    const decoratedAnswer = decorateResponse(rawAnswer, question, language);

    res.status(200).json({
      success: true,
      answer: decoratedAnswer.text,
      decoration: decoratedAnswer.decoration,
      question: question,
      language: language,
      timestamp: new Date().toISOString(),
      metadata: decoratedAnswer.metadata
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Failed to process question',
      details: error.message 
    });
  }
}

function decorateResponse(answer, question, language = 'en') {
  const decoration = {
    type: 'default',
    icon: 'message-circle',
    color: 'blue',
    emphasis: []
  };

  const metadata = {
    confidence: 'medium',
    category: 'general',
    hasWarning: false,
    hasList: false,
    language: language
  };

  const lowerAnswer = answer.toLowerCase();
  const lowerQuestion = question.toLowerCase();

  // Multi-language warning keywords
  const warningKeywords = {
    en: ['penalty', 'liable', 'risk', 'danger', 'breach', 'violation', 'forfeit'],
    es: ['penalización', 'responsable', 'riesgo', 'peligro', 'incumplimiento', 'violación'],
    fr: ['pénalité', 'responsable', 'risque', 'danger', 'violation', 'manquement'],
    de: ['strafe', 'haftbar', 'risiko', 'gefahr', 'verletzung', 'verstoß'],
    it: ['penalità', 'responsabile', 'rischio', 'pericolo', 'violazione'],
    pt: ['penalidade', 'responsável', 'risco', 'perigo', 'violação'],
    hi: ['जुर्माना', 'जिम्मेदार', 'जोखिम', 'खतरा'],
    zh: ['处罚', '责任', '风险', '危险'],
    ja: ['罰則', '責任', 'リスク', '危険'],
    ko: ['벌금', '책임', '위험']
  };

  const financialKeywords = {
    en: ['cost', 'fee', 'pay', 'price', 'amount', '$'],
    es: ['costo', 'tarifa', 'pagar', 'precio', 'cantidad', '$'],
    fr: ['coût', 'frais', 'payer', 'prix', 'montant', '€'],
    de: ['kosten', 'gebühr', 'zahlen', 'preis', 'betrag', '€'],
    it: ['costo', 'tariffa', 'pagare', 'prezzo', 'importo', '€'],
    pt: ['custo', 'taxa', 'pagar', 'preço', 'quantia', '$'],
  };

  const terminationKeywords = {
    en: ['terminate', 'cancel', 'end', 'expire'],
    es: ['terminar', 'cancelar', 'finalizar', 'expirar'],
    fr: ['résilier', 'annuler', 'terminer', 'expirer'],
    de: ['kündigen', 'beenden', 'stornieren', 'auslaufen'],
    it: ['terminare', 'cancellare', 'finire', 'scadere'],
    pt: ['terminar', 'cancelar', 'finalizar', 'expirar'],
  };

  // Check for warning indicators in question or answer
  const langWarnings = warningKeywords[language] || warningKeywords['en'];
  const hasWarning = langWarnings.some(keyword => 
    lowerAnswer.includes(keyword) || lowerQuestion.includes(keyword)
  );

  const langFinancial = financialKeywords[language] || financialKeywords['en'];
  const hasFinancial = langFinancial.some(keyword => 
    lowerAnswer.includes(keyword) || lowerQuestion.includes(keyword)
  );

  const langTermination = terminationKeywords[language] || terminationKeywords['en'];
  const hasTermination = langTermination.some(keyword => 
    lowerAnswer.includes(keyword) || lowerQuestion.includes(keyword)
  );

  // Determine response category and styling
  if (hasWarning || lowerQuestion.includes('risk') || lowerQuestion.includes('danger')) {
    decoration.type = 'warning';
    decoration.icon = 'alert-triangle';
    decoration.color = 'red';
    metadata.hasWarning = true;
    metadata.category = 'risk';
  } else if (hasFinancial) {
    decoration.type = 'financial';
    decoration.icon = 'dollar-sign';
    decoration.color = 'green';
    metadata.category = 'financial';
  } else if (hasTermination) {
    decoration.type = 'termination';
    decoration.icon = 'x-circle';
    decoration.color = 'orange';
    metadata.category = 'termination';
  } else if (lowerQuestion.includes('right') || lowerQuestion.includes('obligation')) {
    decoration.type = 'legal';
    decoration.icon = 'shield';
    decoration.color = 'purple';
    metadata.category = 'legal';
  } else if (lowerQuestion.includes('date') || lowerQuestion.includes('when') || lowerQuestion.includes('deadline')) {
    decoration.type = 'timeline';
    decoration.icon = 'calendar';
    decoration.color = 'blue';
    metadata.category = 'timeline';
  }

  // Structure the answer with better formatting
  let structuredAnswer = answer;

  // Multi-language important terms
  const importantTerms = [
    ...langWarnings,
    ...(langFinancial || []),
    ...(langTermination || []),
    'immediately', 'required', 'must', 'shall',
    'inmediatamente', 'requerido', 'debe', // Spanish
    'immédiatement', 'requis', 'doit', // French
    'sofort', 'erforderlich', 'muss', // German
  ];

  importantTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(structuredAnswer)) {
      decoration.emphasis.push(term);
      structuredAnswer = structuredAnswer.replace(regex, `**${term}**`);
    }
  });

  // Detect and format lists
  if (structuredAnswer.includes('1.') || structuredAnswer.includes('•') || structuredAnswer.includes('-')) {
    metadata.hasList = true;
    // Convert numbered lists to bullet points for consistency
    structuredAnswer = structuredAnswer.replace(/^\d+\.\s/gm, '• ');
  }

  // Add section breaks for better readability
  if (structuredAnswer.length > 200) {
    // Break long responses into paragraphs
    structuredAnswer = structuredAnswer.replace(/\. ([A-Z])/g, '.\n\n$1');
  }

  return {
    text: structuredAnswer,
    decoration,
    metadata
  };
}