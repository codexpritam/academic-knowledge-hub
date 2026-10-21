import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { FileQuestion, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 min-h-[500px]">
        <div className="w-16 h-16 rounded-3xl bg-primary-50 flex items-center justify-center text-primary-600 mb-6 border border-primary-100 shadow-sm">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          The academic page or resource you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" icon={Home}>
            Return Home
          </Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
