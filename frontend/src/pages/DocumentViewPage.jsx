
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Layout from '../components/layout/Layout';
import DocumentHeader from '../components/documents/DocumentHeader';
import PDFViewer from '../components/documents/PDFViewer';
import AIChat from '../components/ai/AIChat';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

import { documentService } from '../services/documentService';
import { useToast } from '../hooks/useToast';

const DocumentViewPage = () => {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [targetPage, setTargetPage] = useState(1);

  const toast = useToast();
  const navigate = useNavigate();

  // Fetch document details
  const fetchDocument = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }

        const res = await documentService.getDocumentById(id);

        if (res?.data?.document) {
          setDocument(res.data.document);
        } else {
          setDocument(null);
        }
      } catch (err) {
        toast.error(
          err.message || 'Failed to load document.'
        );

        setDocument(null);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [id, toast]
  );

  useEffect(() => {
    fetchDocument(true);
  }, [fetchDocument]);

  // Poll while document processing is in progress
  useEffect(() => {
    if (!document) return;

    const isProcessing =
      document.processingStatus === 'PROCESSING' ||
      document.processingStatus === 'UPLOADING';

    if (!isProcessing) return;

    const interval = setInterval(() => {
      fetchDocument(false);
    }, 3500);

    return () => clearInterval(interval);
  }, [document, fetchDocument]);

  // Navigate to the page selected through an AI citation
  const handleNavigateToPage = (pageNumber) => {
    setTargetPage(pageNumber);
    toast.info(`Navigated to Page ${pageNumber}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <Loader
          fullScreen
          message="Loading document and AI assistant..."
        />
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <EmptyState
            title="Academic resource not found"
            description="The requested document may have been deleted by the owner or the URL is incorrect."
            actionText="Browse Library"
            onAction={() => navigate('/resources')}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      {/* Desktop: fixed available viewport height.
          Mobile: natural page height and normal page scrolling. */}
      <div
        className="
          flex min-h-[calc(100vh-64px)] flex-col
          bg-slate-100/60
          lg:h-[calc(100dvh-64px)]
          lg:min-h-0
          lg:overflow-hidden
        "
      >
        {/* Document metadata header */}
        <div className="shrink-0">
          <DocumentHeader document={document} />
        </div>

        {/* Workspace uses only the remaining available height */}
        <div
          className="
            mx-auto flex w-full max-w-7xl flex-1
            min-h-0 flex-col px-4 py-4
            sm:px-6 sm:py-5
            lg:overflow-hidden lg:px-8
          "
        >
          {/* PDF + AI assistant */}
          <div
            className="
              grid grid-cols-1 gap-6
              lg:h-full lg:min-h-0
              lg:grid-cols-12
            "
          >
            {/* Left: PDF viewer */}
            <div
              className="
                flex min-h-[550px] flex-col
                lg:col-span-7
                lg:h-full lg:min-h-0
              "
            >
              <PDFViewer
                fileUrl={document.fileUrl}
                title={document.title}
                targetPage={targetPage}
                totalPages={document.pageCount}
                onPageChange={(page) => setTargetPage(page)}
              />
            </div>

            {/* Right: AI chat */}
            <div
              className="
                flex min-h-[500px] flex-col
                lg:col-span-5
                lg:h-full lg:min-h-0
              "
            >
              <AIChat
                documentId={document._id}
                documentTitle={document.title}
                processingStatus={document.processingStatus}
                onNavigateToPage={handleNavigateToPage}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentViewPage;
