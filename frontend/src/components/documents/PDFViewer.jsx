import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Download,
  Maximize2
} from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PDFViewer = ({
  fileUrl,
  title = 'Document Preview',
  targetPage = 1,
  totalPages = 1,
  onPageChange
}) => {
  const [currentPage, setCurrentPage] = useState(targetPage || 1);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(totalPages || 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (targetPage && targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [targetPage]);

  const resolvedUrl = fileUrl?.startsWith('http')
    ? fileUrl
    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${fileUrl}`;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const handleNextPage = () => {
    const maxPages = numPages || totalPages;

    if (currentPage < maxPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const handlePageInput = (e) => {
    const val = parseInt(e.target.value, 10);
    const maxPages = numPages || totalPages;

    if (!isNaN(val) && val >= 1 && (!maxPages || val <= maxPages)) {
      setCurrentPage(val);
      onPageChange?.(val);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);

    if (currentPage > numPages) {
      setCurrentPage(1);
      onPageChange?.(1);
    }
  };

  const handleLoadError = (error) => {
    console.error('PDF loading error:', error);
    setError(error);
  };

  const toggleFullScreen = () => {
    const element = document.getElementById('pdf-viewer-container');

    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div
      id="pdf-viewer-container"
      className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-850 border-b border-slate-700/80 text-white text-xs select-none">

        {/* Page Controls */}
        <div className="flex items-center gap-2">

          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 font-medium">
            <span>Page</span>

            <input
              type="number"
              min="1"
              max={numPages || totalPages || 999}
              value={currentPage}
              onChange={handlePageInput}
              className="w-12 text-center bg-slate-800 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-white"
            />

            {(numPages || totalPages) > 0 && (
              <span className="text-slate-400">
                of {numPages || totalPages}
              </span>
            )}
          </div>

          <button
            onClick={handleNextPage}
            disabled={
              (numPages || totalPages) > 0 &&
              currentPage >= (numPages || totalPages)
            }
            className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-40"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

        {/* Zoom + Actions */}
        <div className="flex items-center gap-2">

          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">

            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="px-1.5 text-[11px] font-mono">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

          </div>

          <button
            onClick={toggleFullScreen}
            className="p-1.5 rounded-lg hover:bg-slate-700"
            title="Full Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-slate-700"
            title="Open PDF"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href={resolvedUrl}
            download={title}
            className="p-1.5 rounded-lg bg-primary-600 hover:bg-primary-500"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>

        </div>
      </div>

      {/* PDF */}
      <div className="flex-1 w-full h-[600px] min-h-[500px] overflow-auto bg-slate-950 flex justify-center">

        {error ? (
          <div className="flex items-center justify-center text-red-400">
            <div className="text-center">
              <p className="text-lg font-semibold">
                Failed to load PDF.
              </p>

              <p className="text-sm text-slate-400 mt-2">
                Check the browser console for details.
              </p>
            </div>
          </div>
        ) : (
          <Document
            file={resolvedUrl}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={
              <div className="text-white mt-10">
                Loading PDF...
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={zoom}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        )}

      </div>
    </div>
  );
};

export default PDFViewer;