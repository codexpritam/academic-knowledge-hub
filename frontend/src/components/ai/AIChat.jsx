
import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import ChatMessage from './ChatMessage';
import { aiService } from '../../services/aiService';
import { useToast } from '../../hooks/useToast';

const SUGGESTED_PROMPTS = [
  'Summarize the core takeaways of this document.',
  'What are the primary definitions or formulas explained here?',
  'Explain the main topics covered in simple terms.'
];

const AIChat = ({
  documentId,
  documentTitle = 'Document',
  processingStatus = 'READY',
  onNavigateToPage
}) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your AI Academic Assistant. Ask me anything about "${documentTitle}", and I will find the answers directly in this document with page citations.`,
      sources: []
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the scrollable messages section only.
  const messagesContainerRef = useRef(null);

  const toast = useToast();

  const isReady = processingStatus === 'READY';

  // Scroll inside the messages container, not the whole page.
  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (questionText) => {
    const question = (questionText || inputQuestion).trim();

    if (!question || isLoading) return;

    if (!isReady) {
      toast.warning(
        'This document is still being indexed. Please wait until processing completes.'
      );
      return;
    }

    const newUserMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: question
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await aiService.askQuestion(
        documentId,
        question
      );

      const answerData = response?.data;

      const newAiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: answerData?.answer || 'No answer could be retrieved.',
        sources: answerData?.sources || []
      };

      setMessages((prev) => [...prev, newAiMsg]);
    } catch (err) {
      const errorText =
        err.message || 'Failed to get answer from AI.';

      toast.error(errorText);

      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `I encountered an issue generating the answer: ${errorText}. Please ask again or rephrase your question.`,
        sources: []
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Chat cleared. Ask me any question about "${documentTitle}".`,
        sources: []
      }
    ]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-sm">

      {/* Header: fixed height */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-slate-50/90 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent-600 to-primary-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              AI Document Assistant
            </h3>

            <p className="text-[10px] text-slate-500">
              Gemini RAG Engine with Page Citations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
          title="Reset Chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Processing warning: does not grow with messages */}
      {!isReady && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />

          <span>
            {processingStatus === 'PROCESSING' ||
            processingStatus === 'UPLOADING'
              ? 'Document is currently being analyzed and vectorized. AI Q&A will be enabled once ready.'
              : 'Document processing failed. Text could not be extracted for vector search.'}
          </span>
        </div>
      )}

      {/* Messages: this is the only vertically scrollable section */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4"
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onNavigateToPage={onNavigateToPage}
          />
        ))}

        {isLoading && (
          <div className="flex gap-3 bg-slate-50 -mx-4 px-4 py-3 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-600 to-primary-600 flex items-center justify-center shrink-0 text-white shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 py-1">
              <p className="text-xs font-semibold text-slate-700">
                Searching chunks &amp; generating answer...
              </p>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts: separate from the scrolling messages */}
      {messages.length === 1 && isReady && (
        <div className="shrink-0 px-4 pb-2">
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Suggested questions:
          </p>

          <div className="flex flex-col gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-left text-xs bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 transition-all"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input: stays at the bottom */}
      <div className="shrink-0 p-3 bg-slate-50/80 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isReady
                ? 'Ask a question about this document...'
                : 'Indexing document...'
            }
            disabled={!isReady || isLoading}
            className="w-full min-w-0 pl-4 pr-12 py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 disabled:opacity-50 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputQuestion.trim() || !isReady || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-40 disabled:hover:bg-primary-600 transition-all"
            title="Send Question"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        <p className="text-[10px] text-slate-600 text-center mt-1.5">
          Answers are strictly retrieved from this document with verified page citations.
        </p>
      </div>
    </div>
  );
};

export default AIChat;
