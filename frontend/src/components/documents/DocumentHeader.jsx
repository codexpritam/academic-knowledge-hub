
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  HardDrive,
  Calendar
} from 'lucide-react';

import Badge from '../common/Badge';

import {
  formatDate,
  formatFileSize,
  getResourceTypeColor,
  getStatusBadgeColor
} from '../../utils/formatters';

import { RESOURCE_TYPE_LABELS } from '../../utils/constants';

const DocumentHeader = ({ document }) => {
  if (!document) return null;

  const {
    title,
    description,
    subject,
    semester,
    resourceType,
    pageCount,
    fileSize,
    processingStatus,
    uploadedBy,
    createdAt
  } = document;

  const typeLabel =
    RESOURCE_TYPE_LABELS[resourceType] || resourceType;

  const typeColor = getResourceTypeColor(resourceType);
  const statusColor = getStatusBadgeColor(processingStatus);

  const uploaderName =
    uploadedBy?.name || 'Anonymous Student';

  const avatarUrl =
    uploadedBy?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(uploaderName)}`;

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">

        {/* Compact back navigation */}
        <Link
          to="/resources"
          className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Resources</span>
        </Link>

        {/* Main header: details left, contributor right */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">

          {/* Document information */}
          <div className="min-w-0 flex-1">

            {/* Row 1: Badges + title */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">

              <Badge className={typeColor}>
                {typeLabel}
              </Badge>

              <Badge className={statusColor}>
                {processingStatus === 'READY'
                  ? 'Indexed & Ready'
                  : processingStatus}
              </Badge>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Semester {semester}
              </span>

              <h1 className="min-w-0 break-words text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl">
                {title}
              </h1>
            </div>

            {/* Row 2: Metadata */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">

              {subject && (
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary-500" />
                  <span>{subject}</span>
                </div>
              )}

              {pageCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>
                    {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                  </span>
                </div>
              )}

              {fileSize > 0 && (
                <div className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>{formatFileSize(fileSize)}</span>
                </div>
              )}

              {createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>Uploaded {formatDate(createdAt)}</span>
                </div>
              )}
            </div>

            {/* Optional description */}
            {description && (
              <p className="mt-1.5 max-w-3xl line-clamp-1 text-xs text-slate-500">
                {description}
              </p>
            )}
          </div>

          {/* Contributor card */}
          <div className="flex shrink-0 items-center gap-2.5 self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 lg:self-center">

            <img
              src={avatarUrl}
              alt={uploaderName}
              className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
            />

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900">
                {uploaderName}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Resource Contributor
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DocumentHeader;
