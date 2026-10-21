import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS, SEMESTER_OPTIONS } from '../../utils/constants';

const FilterBar = ({
  filters,
  onFilterChange,
  onReset,
  availableSubjects = []
}) => {
  const hasActiveFilters = Boolean(
    filters.subject ||
    filters.semester ||
    filters.resourceType ||
    filters.sort !== 'newest'
  );

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider pr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
        </div>

        {/* Resource Type */}
        <select
          value={filters.resourceType || ''}
          onChange={(e) => onFilterChange('resourceType', e.target.value)}
          aria-label="Filter by resource type"
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-primary-500 cursor-pointer"
        >
          <option value="">All Types</option>
          {Object.entries(RESOURCE_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Semester */}
        <select
          value={filters.semester || ''}
          onChange={(e) => onFilterChange('semester', e.target.value)}
          aria-label="Filter by semester"
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-primary-500 cursor-pointer"
        >
          <option value="">All Semesters</option>
          {SEMESTER_OPTIONS.map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>

        {/* Subject */}
        {availableSubjects && availableSubjects.length > 0 && (
          <select
            value={filters.subject || ''}
            onChange={(e) => onFilterChange('subject', e.target.value)}
            aria-label="Filter by subject"
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-primary-500 cursor-pointer max-w-[180px] truncate"
          >
            <option value="">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Sorting & Reset */}
      <div className="flex items-center gap-2">
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          aria-label="Sort resources"
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-primary-500 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
