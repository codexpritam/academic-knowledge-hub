import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SearchBar from '../components/resources/SearchBar';
import FilterBar from '../components/resources/FilterBar';
import ResourceGrid from '../components/resources/ResourceGrid';
import { documentService } from '../services/documentService';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const ResourcesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    subject: searchParams.get('subject') || '',
    semester: searchParams.get('semester') || '',
    resourceType: searchParams.get('type') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10)
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  });

  // Fetch available subjects for filter dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await documentService.getDistinctSubjects();
        if (res?.data?.subjects) {
          setSubjects(res.data.subjects);
        }
      } catch {
        // Continue
      }
    };
    fetchSubjects();
  }, []);

  // Fetch documents from backend
  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        search: searchQuery,
        subject: filters.subject,
        semester: filters.semester,
        resourceType: filters.resourceType,
        sort: filters.sort,
        page: filters.page,
        limit: 12
      };

      const res = await documentService.getDocuments(params);
      if (res?.data) {
        setResources(res.data.documents || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
      }
    } catch {
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      subject: '',
      semester: '',
      resourceType: '',
      sort: 'newest',
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Academic Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Study Resources
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Browse verified lecture notes, question papers, and manuals shared by students across semesters and subjects.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            onSubmit={fetchDocuments}
          />

          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            availableSubjects={subjects}
          />
        </div>

        {/* Results Count Banner */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing {resources.length} of {pagination.total} {pagination.total === 1 ? 'resource' : 'resources'}
          </span>
          {pagination.totalPages > 1 && (
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>

        {/* Resource Cards Grid */}
        <ResourceGrid
          resources={resources}
          isLoading={isLoading}
          emptyTitle="No matching academic resources"
          emptyDescription="Try clearing your filters or searching with a different subject keyword."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${
                  pagination.page === pageNum
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ResourcesPage;
