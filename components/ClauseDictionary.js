// ClauseDictionary.js - Dark theme version to match your app
import { useState } from 'react';
import { BookOpen, TrendingUp, Clock, Users } from 'lucide-react';

export default function ClauseDictionary({ clauses, language }) {
  const [selectedType, setSelectedType] = useState('all');

  // Group clauses by type
  const clauseTypes = clauses.reduce((acc, clause) => {
    if (!acc[clause.type]) {
      acc[clause.type] = [];
    }
    acc[clause.type].push(clause);
    return acc;
  }, {});

  // Calculate statistics
  const stats = {
    totalClauses: clauses.length,
    fromDictionary: clauses.filter(c => c.fromDictionary).length,
    uniqueTypes: Object.keys(clauseTypes).length,
    avgRiskScore: clauses.length > 0 
      ? (clauses.reduce((sum, c) => sum + c.riskScore, 0) / clauses.length).toFixed(1)
      : 0
  };

  const filteredClauses = selectedType === 'all' 
    ? clauses 
    : clauses.filter(c => c.type === selectedType);

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
      {/* Header - Dark Theme */}
      <div className="border-b border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <BookOpen className="h-6 w-6 text-blue-400 mr-2" />
          Clause Dictionary Insights
        </h3>
        <p className="text-gray-300 mt-1">
          Analysis powered by our growing knowledge base of legal clauses
        </p>
      </div>

      {/* Statistics - Dark Theme */}
      <div className="p-6 border-b border-gray-700 bg-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalClauses}</div>
            <div className="text-sm text-gray-300">Total Clauses</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">{stats.fromDictionary}</div>
            <div className="text-sm text-gray-300">From Dictionary</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">{stats.uniqueTypes}</div>
            <div className="text-sm text-gray-300">Clause Types</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-400">{stats.avgRiskScore}</div>
            <div className="text-sm text-gray-300">Avg Risk Score</div>
          </div>
        </div>
      </div>

      {/* Filter Section - Dark Theme */}
      <div className="p-6 border-b border-gray-700">
        <h4 className="font-medium text-white mb-3">Filter by Clause Type:</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
            }`}
          >
            All ({stats.totalClauses})
          </button>
          {Object.entries(clauseTypes).map(([type, typeclauses]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              {type} ({typeclauses.length})
            </button>
          ))}
        </div>
      </div>

      {/* Dictionary Matches - Dark Theme */}
      <div className="p-6">
        <h4 className="font-medium text-white mb-4">
          Dictionary Analysis ({filteredClauses.length} clauses)
        </h4>
        
        {filteredClauses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No clauses found for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClauses.map((clause, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  clause.fromDictionary 
                    ? 'bg-blue-900/20 border-blue-500/30' 
                    : 'bg-gray-700 border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize text-white">
                        {clause.type} Clause
                      </span>
                      {clause.fromDictionary && (
                        <span className="bg-blue-600 text-blue-100 text-xs px-2 py-1 rounded-full">
                          ✓ Dictionary Match
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        clause.riskCategory === 'high' 
                          ? 'bg-red-600 text-red-100'
                          : clause.riskCategory === 'medium'
                          ? 'bg-yellow-600 text-yellow-100'
                          : 'bg-green-600 text-green-100'
                      }`}>
                        Risk: {clause.riskScore}/5
                      </span>
                    </div>
                  </div>
                </div>
                
                {clause.explanation && (
                  <div className="mb-3">
                    <h5 className="font-medium text-white text-sm mb-1">
                      {clause.fromDictionary ? 'Dictionary Explanation:' : 'AI Explanation:'}
                    </h5>
                    <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded border border-gray-600">
                      {clause.explanation}
                    </p>
                  </div>
                )}
                
                {clause.suggestedQuestions && clause.suggestedQuestions.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-white text-sm mb-2">Related Questions:</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {clause.suggestedQuestions.slice(0, 2).map((question, qIndex) => (
                        <li key={qIndex} className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-xs text-gray-400">
                  <span className="capitalize">{clause.type}</span> • 
                  <span className="ml-1">
                    Confidence: {(clause.confidence * 100).toFixed(0)}%
                  </span>
                  {clause.fromDictionary && (
                    <span className="ml-2 text-blue-400">
                      • Powered by Clause Dictionary
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Insights - Dark Theme */}
      <div className="border-t border-gray-700 p-6 bg-gray-700/50">
        <h4 className="font-medium text-white mb-3">Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-800 p-4 rounded border border-gray-600">
            <h5 className="font-medium text-white mb-2">Dictionary Coverage</h5>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-600 rounded-full h-2 mr-3">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(stats.fromDictionary / stats.totalClauses) * 100}%` }}
                ></div>
              </div>
              <span className="text-gray-300">
                {((stats.fromDictionary / stats.totalClauses) * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-gray-400 mt-1">
              {stats.fromDictionary} of {stats.totalClauses} clauses matched our dictionary
            </p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded border border-gray-600">
            <h5 className="font-medium text-white mb-2">Processing Speed</h5>
            <div className="text-green-400 font-medium">
              {stats.fromDictionary > 0 ? '⚡ Faster' : '🔄 Standard'}
            </div>
            <p className="text-gray-400 mt-1">
              {stats.fromDictionary > 0 
                ? 'Dictionary matches provided instant explanations'
                : 'All explanations generated by AI analysis'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}