// components/DocumentSummary.js

import { FileText, Users, DollarSign, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Helper function to extract a section from the markdown
const getSection = (markdown, title) => {
  const regex = new RegExp(`## ${title}\\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
  const match = markdown.match(regex);
  return match ? match[1].trim() : null;
};

export default function DocumentSummary({ documentData }) {
  const summary = documentData.summary || '';

  const atAGlanceContent = getSection(summary, 'Key Details At a Glance');

  // 1. Assign a 'color' theme to each section
  const summarySections = [
    { title: 'Parties Involved', icon: Users, content: getSection(summary, 'Parties Involved'), color: 'indigo' },
    { title: 'Financial Obligations', icon: DollarSign, content: getSection(summary, 'Financial Obligations'), color: 'green' },
    { title: 'Rights and Obligations', icon: ShieldCheck, content: getSection(summary, 'Rights and Obligations'), color: 'blue' },
    { title: 'Termination and Renewal', icon: Calendar, content: getSection(summary, 'Termination and Renewal'), color: 'amber' },
    { title: 'Risks and Penalties', icon: AlertTriangle, content: getSection(summary, 'Risks and Penalties'), color: 'red' },
  ].filter(section => section.content);

  // 2. Create a map of colors to Tailwind CSS classes
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-900/20',
      border: 'border-indigo-500/50',
      icon: 'text-indigo-400'
    },
    green: {
      bg: 'bg-green-900/20',
      border: 'border-green-500/50',
      icon: 'text-green-400'
    },
    blue: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-500/50',
      icon: 'text-blue-400'
    },
    amber: {
      bg: 'bg-amber-900/20',
      border: 'border-amber-500/50',
      icon: 'text-amber-400'
    },
    red: {
      bg: 'bg-red-900/20',
      border: 'border-red-500/50',
      icon: 'text-red-400'
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <h2 className="text-2xl font-semibold text-white flex items-center mb-2">
          <FileText className="h-6 w-6 text-blue-400 mr-2" />
          Document Analysis Summary
        </h2>
        <p className="text-gray-300">
          A clear breakdown of your document's most important terms.
        </p>
      </div>

      {atAGlanceContent && (
        <div className="bg-gradient-to-r from-blue-900/30 to-gray-800 rounded-lg border border-blue-500/50 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Key Details At a Glance</h3>
          <div className="prose prose-invert max-w-none text-gray-200">
            <ReactMarkdown>{atAGlanceContent}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summarySections.map((section) => {
          const Icon = section.icon;
          // 3. Apply the dynamic styles to each card
          const styles = colorClasses[section.color] || colorClasses.blue;
          
          return (
            <div key={section.title} className={`bg-gray-800 rounded-lg border p-6 transition-all hover:shadow-lg hover:-translate-y-1 ${styles.bg} ${styles.border}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-gray-700">
                  <Icon className={`h-5 w-5 ${styles.icon}`} />
                </div>
                <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 text-sm">
                <ReactMarkdown>{section.content}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}