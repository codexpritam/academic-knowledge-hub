import React from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import SourceReference from './SourceReference';

const ChatMessage = ({ message, onNavigateToPage }) => {
  const isAi = message.sender === 'ai';

  return (
    <div className={`flex gap-3 ${isAi ? 'bg-slate-50/80 -mx-4 px-4 py-4 rounded-2xl border border-slate-100' : 'py-2'}`}>
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
          isAi
            ? 'bg-gradient-to-tr from-accent-600 to-primary-600'
            : 'bg-slate-800'
        }`}
      >
        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-900">
            {isAi ? 'Gemini Document Assistant' : 'You'}
          </span>
          {isAi && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full border border-accent-200">
              <Sparkles className="w-2.5 h-2.5" />
              RAG Grounded
            </span>
          )}
        </div>

        {/* Text body */}
        <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>

        {/* Sources citations */}
        {isAi && message.sources && message.sources.length > 0 && (
          <div className="pt-2 border-t border-slate-200/70 mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <span>Verified Sources & Page Citations:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, index) => (
                <SourceReference
                  key={`${src.pageNumber}-${index}`}
                  pageNumber={src.pageNumber}
                  onClick={onNavigateToPage}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
