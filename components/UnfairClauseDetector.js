import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function UnfairClauseDetector({ clauses }) {
  const detectUnfairClauses = (clausesList) => {
    // Ensure clausesList is an array and handle null/undefined input gracefully
    if (!Array.isArray(clausesList)) return []; 
    
    const unfairPatterns = {
      high: [
        { pattern: /waive|waiver.*right/i, reason: 'Waives your legal rights' },
        { pattern: /auto.*renew|automatic.*renewal/i, reason: 'Auto-renewal trap' },
        { pattern: /indemnify.*from all|hold.*harmless/i, reason: 'Unlimited liability' },
        { pattern: /at.*sole discretion/i, reason: 'One-sided decision power' },
        { pattern: /irrevocable/i, reason: 'Cannot be reversed' }
      ],
      medium: [
        { pattern: /may change.*without notice/i, reason: 'Can change terms unilaterally' },
        { pattern: /non-refundable/i, reason: 'No refunds allowed' },
        { pattern: /final.*binding.*not subject to appeal/i, reason: 'No appeals allowed' },
        { pattern: /liquidated damages/i, reason: 'Pre-set penalty amount' }
      ],
      low: [
        { pattern: /reasonable efforts/i, reason: 'Vague obligation' },
        { pattern: /as is.*without warranty/i, reason: 'No guarantees provided' }
      ]
    };

    const detected = [];
    
    // MODIFIED: Switched to a standard for...of loop for guaranteed iteration control
    for (const clause of clausesList) {
      // CRITICAL FIX: Skip if clause.text is not a valid string or too short
      if (typeof clause.text !== 'string' || clause.text.length < 10) {
          continue; 
      }

      const lowerText = clause.text.toLowerCase();
      
      // Iterate over severity levels: high, medium, low
      for (const severity of ['high', 'medium', 'low']) {
        let isMatched = false;
        
        for (const { pattern, reason } of unfairPatterns[severity]) {
          // Use the pre-lowercased text for pattern testing
          if (pattern.test(lowerText)) { 
            detected.push({
              text: clause.text.substring(0, 200) + (clause.text.length > 200 ? '...' : ''), // Truncate text for display
              severity,
              reason,
              type: clause.type || 'general' // Use 'general' if type is missing
            });
            isMatched = true;
            break; // Stop checking other patterns in this severity level
          }
        }
        
        if (isMatched) {
            break; // Move to the next clause in the outer loop
        }
      }
    }

    return detected;
  };

  const unfairClauses = detectUnfairClauses(clauses);
  const highRisk = unfairClauses.filter(c => c.severity === 'high');
  const mediumRisk = unfairClauses.filter(c => c.severity === 'medium');
  const lowRisk = unfairClauses.filter(c => c.severity === 'low');
  
  // Get total AI-analyzed clause count
  const totalAnalyzedClauses = clauses.length; // Uses the length of the input clauses array

  const getSeverityColor = (severity) => {
    if (severity === 'high') return 'border-red-500 bg-red-900/20';
    if (severity === 'medium') return 'border-orange-500 bg-orange-900/20';
    return 'border-yellow-500 bg-yellow-900/20';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'high') return <AlertTriangle className="h-5 w-5 text-red-400" />;
    if (severity === 'medium') return <AlertCircle className="h-5 w-5 text-orange-400" />;
    return <Info className="h-5 w-5 text-yellow-400" />;
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-2">Unfair Clause Detection</h2>
      {/* MODIFIED: Show both the total analyzed count and the unfair count */}
      <p className="text-gray-300 mb-6">
        Analyzed <strong className="text-white">{totalAnalyzedClauses} key clauses</strong> from your document. We found <strong className="text-red-400">{unfairClauses.length} potentially unfair</strong> or one-sided clauses.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{highRisk.length}</div>
          <div className="text-sm text-gray-300">High Risk</div>
        </div>
        <div className="bg-orange-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-400">{mediumRisk.length}</div>
          <div className="text-sm text-gray-300">Medium Risk</div>
        </div>
        <div className="bg-yellow-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{lowRisk.length}</div>
          <div className="text-sm text-gray-300">Low Risk</div>
        </div>
      </div>

      <div className="space-y-4">
        {unfairClauses.map((clause, index) => (
          <div
            key={index}
            className={`border-l-4 rounded-lg p-4 ${getSeverityColor(clause.severity)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getSeverityIcon(clause.severity)}
                <span className="font-semibold text-white capitalize">
                  {clause.severity} Risk
                </span>
              </div>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                {clause.type}
              </span>
            </div>
            
            <div className="bg-red-900/30 border border-red-500/30 rounded p-3 mb-2">
              <p className="text-red-200 text-sm font-medium">⚠️ {clause.reason}</p>
            </div>
            
            <p className="text-gray-300 text-sm italic">{clause.text}</p>
          </div>
        ))}

        {unfairClauses.length === 0 && (
          <div className="text-center py-8 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-green-300">✓ No obviously unfair clauses detected</p>
          </div>
        )}
      </div>
    </div>
  );
}