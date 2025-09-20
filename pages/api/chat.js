// Enhanced API route for chatbot questions with decorated responses
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

    const processor = new DocumentProcessor();
    
    // Get the raw answer
    const rawAnswer = await processor.answerQuestion(question, documentText, language);
    
    // Decorate the response with structured formatting
    const decoratedAnswer = decorateResponse(rawAnswer, question);

    res.status(200).json({
      success: true,
      answer: decoratedAnswer.text,
      decoration: decoratedAnswer.decoration,
      question: question,
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

function decorateResponse(answer, question) {
  // Detect response type and add appropriate decoration
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
    hasList: false
  };

  const lowerAnswer = answer.toLowerCase();
  const lowerQuestion = question.toLowerCase();

  // Determine response category and styling
  if (lowerQuestion.includes('risk') || lowerQuestion.includes('danger') || lowerAnswer.includes('penalty') || lowerAnswer.includes('liable')) {
    decoration.type = 'warning';
    decoration.icon = 'alert-triangle';
    decoration.color = 'red';
    metadata.hasWarning = true;
    metadata.category = 'risk';
  } else if (lowerQuestion.includes('cost') || lowerQuestion.includes('fee') || lowerQuestion.includes('pay') || lowerAnswer.includes('$')) {
    decoration.type = 'financial';
    decoration.icon = 'dollar-sign';
    decoration.color = 'green';
    metadata.category = 'financial';
  } else if (lowerQuestion.includes('terminate') || lowerQuestion.includes('cancel') || lowerQuestion.includes('end')) {
    decoration.type = 'termination';
    decoration.icon = 'x-circle';
    decoration.color = 'orange';
    metadata.category = 'termination';
  } else if (lowerQuestion.includes('right') || lowerQuestion.includes('obligation') || lowerQuestion.includes('must')) {
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

  // Add emphasis to important terms
  const importantTerms = [
    'immediately', 'required', 'must', 'shall', 'penalty', 'fine', 'liable', 
    'terminate', 'breach', 'violation', 'damages', 'fee', 'cost', 'payment',
    'notice', 'written', 'days', 'months', 'years', 'deadline'
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
    // Try to break long responses into paragraphs
    structuredAnswer = structuredAnswer.replace(/\. ([A-Z])/g, '.\n\n$1');
  }

  return {
    text: structuredAnswer,
    decoration,
    metadata
  };
}