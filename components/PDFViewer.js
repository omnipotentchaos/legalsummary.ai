// components/PDFViewer.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, Loader } from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker source (required for react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PDFViewer({ file, highlightText }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef(null);

  // When highlightText changes (from parent), search and jump
  useEffect(() => {
    if (highlightText && highlightText !== searchText) {
      setSearchText(highlightText);
      findTextInDocument(highlightText);
    }
  }, [highlightText]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Custom text renderer for highlighting
  const textRenderer = useCallback(
    (textItem) => {
      if (!searchText) return textItem.str;

      // Simple case-insensitive matching
      const str = textItem.str;
      const lowerStr = str.toLowerCase();
      const lowerSearch = searchText.toLowerCase().substring(0, 100); // Truncate search for stability

      // If the line contains a significant part of the clause
      if (lowerStr.includes(lowerSearch) || (lowerSearch.length > 20 && lowerSearch.includes(lowerStr))) {
        return (
          <span className="bg-yellow-300/50 text-transparent">
            {textItem.str}
          </span>
        );
      }

      return textItem.str;
    },
    [searchText]
  );

  // Search logic to find the page number
  const findTextInDocument = async (text) => {
    setIsSearching(true);
    if (!file) return;

    try {
      // NOTE: In a production app, you might want to cache the parsed text
      // Here we will rely on visual scanning or simple page jumping if we had page info.
      // Since we don't have page info from the AI, we iterate (simplified for demo).
      
      const loadingTask = pdfjs.getDocument(file);
      const pdf = await loadingTask.promise;
      
      const snippet = text.substring(0, 50).toLowerCase(); // Search for the start of the clause

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ').toLowerCase();

        if (pageText.includes(snippet)) {
          setPageNumber(i);
          setIsSearching(false);
          return;
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
           <button 
             onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
             disabled={pageNumber <= 1}
             className="p-1 hover:bg-gray-700 rounded text-gray-300 disabled:opacity-50"
           >
             <ChevronLeft className="h-5 w-5" />
           </button>
           <span className="text-sm text-gray-300">
             Page {pageNumber} of {numPages || '--'}
           </span>
           <button 
             onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
             disabled={pageNumber >= numPages}
             className="p-1 hover:bg-gray-700 rounded text-gray-300 disabled:opacity-50"
           >
             <ChevronRight className="h-5 w-5" />
           </button>
        </div>
        
        <div className="flex items-center space-x-2">
            {isSearching && <span className="text-xs text-yellow-400 flex items-center animate-pulse"><Search className="h-3 w-3 mr-1"/> Finding clause...</span>}
            <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="p-1 hover:bg-gray-700 rounded text-gray-300"><ZoomOut className="h-4 w-4" /></button>
            <span className="text-xs text-gray-400 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(s + 0.2, 2.0))} className="p-1 hover:bg-gray-700 rounded text-gray-300"><ZoomIn className="h-4 w-4" /></button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto bg-gray-500/20 flex justify-center p-4" ref={containerRef}>
        {file ? (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Loader className="h-8 w-8 animate-spin mb-2"/>
                    <span>Loading Document...</span>
                </div>
            }
          >
            <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                customTextRenderer={textRenderer}
                className="shadow-2xl"
                renderAnnotationLayer={true}
                renderTextLayer={true}
            />
          </Document>
        ) : (
          <div className="flex items-center justify-center text-gray-400 h-full">
            No document loaded
          </div>
        )}
      </div>
    </div>
  );
}