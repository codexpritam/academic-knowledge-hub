import React from 'react';
import { Bookmark } from 'lucide-react';

const SourceReference = ({ pageNumber, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(pageNumber)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 hover:border-primary-300 transition-all cursor-pointer group shadow-xs active:scale-95"
      title={`Jump to Page ${pageNumber} in PDF`}
    >
      <Bookmark className="w-3 h-3 text-primary-500 group-hover:scale-110 transition-transform" />
      <span>Page {pageNumber}</span>
    </button>
  );
};

export default SourceReference;
