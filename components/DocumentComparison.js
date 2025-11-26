import { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle, MinusCircle, ArrowRight } from 'lucide-react';

export default function DocumentComparison() {
  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState(null);

  const handleFileUpload = async (file, docNum) => {
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      
      if (docNum === 1) setDoc1(result.data);
      else setDoc2(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  const compareDocuments = async () => {
    if (!doc1 || !doc2) return;
    
    setComparing(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc1Id: doc1.id, doc2Id: doc2.id })
      });
      const result = await res.json();
      setComparison(result.comparison);
    } catch (err) {
      console.error(err);
    }
    setComparing(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Compare Documents</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6">
          <h3 className="text-white font-medium mb-3">Original Document</h3>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => handleFileUpload(e.target.files[0], 1)}
            className="w-full text-sm text-gray-300"
          />
          {doc1 && <p className="text-green-400 text-sm mt-2">✓ {doc1.fileName}</p>}
        </div>
        
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6">
          <h3 className="text-white font-medium mb-3">Updated Document</h3>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => handleFileUpload(e.target.files[0], 2)}
            className="w-full text-sm text-gray-300"
          />
          {doc2 && <p className="text-green-400 text-sm mt-2">✓ {doc2.fileName}</p>}
        </div>
      </div>

      <button
        onClick={compareDocuments}
        disabled={!doc1 || !doc2 || comparing}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {comparing ? 'Comparing...' : 'Compare Documents'}
      </button>

      {comparison && (
        <div className="mt-6 space-y-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              High Risk Changes ({comparison.highRisk.length})
            </h3>
            {comparison.highRisk.map((change, i) => (
              <div key={i} className="text-gray-200 text-sm mt-2 pl-4 border-l-2 border-red-500">
                {change}
              </div>
            ))}
          </div>

          <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
            <h3 className="text-orange-400 font-semibold mb-2 flex items-center">
              <MinusCircle className="h-5 w-5 mr-2" />
              Modified Clauses ({comparison.modified.length})
            </h3>
            {comparison.modified.map((change, i) => (
              <div key={i} className="text-gray-200 text-sm mt-2">
                <div className="flex items-center text-red-300">
                  <span className="mr-2">−</span>
                  <span className="line-through">{change.old}</span>
                </div>
                <div className="flex items-center text-green-300 mt-1">
                  <span className="mr-2">+</span>
                  <span>{change.new}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Unchanged ({comparison.unchanged})
            </h3>
            <p className="text-gray-300 text-sm">{comparison.unchanged} clauses remain the same</p>
          </div>
        </div>
      )}
    </div>
  );
}