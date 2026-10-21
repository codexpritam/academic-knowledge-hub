import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import ResourceGrid from '../components/resources/ResourceGrid';
import { useAuth } from '../hooks/useAuth';
import { documentService } from '../services/documentService';
import { userService } from '../services/userService';

const DashboardPage = () => {
  const { user } = useAuth();
  const [recentResources, setRecentResources] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingMy, setIsLoadingMy] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setIsRecentLoading(true);
        const res = await documentService.getDocuments({ limit: 6, sort: 'newest' });
        if (res?.data?.documents) {
          setRecentResources(res.data.documents);
        }
      } catch {
        // Keep empty
      } finally {
        setIsLoadingRecent(false);
      }
    };

    const fetchMyResources = async () => {
      try {
        setIsLoadingMy(true);
        const res = await userService.getMyDocuments();
        if (res?.data?.documents) {
          setMyResources(res.data.documents.slice(0, 3));
        }
      } catch {
        // Keep empty
      } finally {
        setIsLoadingMy(false);
      }
    };

    const setIsRecentLoading = (val) => setIsLoadingRecent(val);

    fetchRecent();
    fetchMyResources();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="text-xs font-semibold text-primary-400 uppercase tracking-widest flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              Student Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Explore recent materials shared across subjects, upload your notes, or pick any document to ask AI questions with verified page citations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 pt-6">
            <Link to="/upload">
              <Button variant="primary" icon={Upload} size="sm">
                Upload Resource
              </Button>
            </Link>
            <Link to="/resources">
              <Button variant="outline" icon={BookOpen} size="sm" className="text-white border-slate-700 bg-slate-900/60 hover:bg-slate-800">
                Explore All Resources
              </Button>
            </Link>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* My Recent Resources Preview (if user has uploaded any) */}
        {myResources.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">My Uploaded Resources</h2>
                <p className="text-xs text-slate-500">Quick access to manage your own contributions</p>
              </div>
              <Link
                to="/my-resources"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
              >
                <span>View all ({myResources.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <ResourceGrid
              resources={myResources}
              isLoading={isLoadingMy}
            />
          </div>
        )}

        {/* Community Recent Academic Resources */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recently Uploaded Resources</h2>
                <p className="text-xs text-slate-500">Latest academic materials shared by university students</p>
              </div>
            </div>
            <Link
              to="/resources"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ResourceGrid
            resources={recentResources}
            isLoading={isLoadingRecent}
            emptyTitle="No resources uploaded yet"
            emptyDescription="Be the first student to contribute! Upload your lecture notes, previous papers, or lab manuals."
            actionText="Upload First Resource"
            onAction={() => window.location.href = '/upload'}
          />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
