import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">
                Academic Knowledge Hub
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm">
              "Your Academic Knowledge, One Intelligent Hub."
              A peer-to-peer academic resource platform powered by Gemini RAG document intelligence.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-700 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>
                <Link to="/resources" className="hover:text-primary-600 transition-colors">
                  Explore Resources
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-primary-600 transition-colors">
                  Upload PDF
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-primary-600 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#rag-showcase" className="hover:text-primary-600 transition-colors">
                  RAG Document Engine
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Resources & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>
                <a href="/#features" className="hover:text-primary-600 transition-colors">
                  Key Features
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-primary-600 transition-colors">
                  FAQ & Guidelines
                </a>
              </li>
              <li>
                <span className="text-slate-400 cursor-not-allowed">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-slate-400 cursor-not-allowed">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Academic Knowledge Hub. Peer-to-peer student community.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with precision for college students</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
