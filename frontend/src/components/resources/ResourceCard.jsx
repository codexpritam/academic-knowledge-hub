import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Sparkles, User, Calendar, BookOpen, Layers } from 'lucide-react';
import Badge from '../common/Badge';
import {
  formatDate,
  getResourceTypeColor,
  getStatusBadgeColor,
} from '../../utils/formatters';
import { RESOURCE_TYPE_LABELS } from '../../utils/constants';

const ResourceCard = ({
  resource,
  isOwner = false,
  onEdit,
  onDelete
}) => {
  const {
    _id,
    title,
    description,
    subject,
    semester,
    resourceType,
    pageCount,
    processingStatus,
    uploadedBy,
    createdAt
  } = resource;

  const isReady = processingStatus === 'READY';
  const typeLabel = RESOURCE_TYPE_LABELS[resourceType] || resourceType;
  const typeColor = getResourceTypeColor(resourceType);
  const statusColor = getStatusBadgeColor(processingStatus);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge className={typeColor}>
            {typeLabel}
          </Badge>
          <div className="flex items-center gap-1.5">
            <Badge className={statusColor}>
              {processingStatus}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <Link to={`/documents/${_id}`} className="block group-hover:text-primary-600 transition-colors">
          <h3 className="font-semibold text-slate-900 text-base line-clamp-2 leading-snug mb-1.5">
            {title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {description || 'No detailed description provided for this academic resource.'}
        </p>

        {/* Subject and Semester metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded-xl">
          <BookOpen className="w-3.5 h-3.5 text-primary-500 shrink-0" />
          <span className="font-medium truncate">{subject}</span>
          <span className="text-slate-300">•</span>
          <span className="shrink-0 text-slate-500">Sem {semester}</span>
          {pageCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="shrink-0 text-slate-500 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                {pageCount} {pageCount === 1 ? 'page' : 'pages'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        {/* Uploader info */}
        <div className="flex items-center gap-2 truncate">
          <img
            src={
              uploadedBy?.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${uploadedBy?.name || 'S'}`
            }
            alt={uploadedBy?.name || 'Student'}
            className="w-5 h-5 rounded-full object-cover bg-slate-200 shrink-0"
          />
          <span className="text-slate-600 font-medium truncate max-w-[90px]">
            {uploadedBy?.name || 'Student'}
          </span>
          <span className="text-slate-300 shrink-0">•</span>
          <span className="text-slate-400 shrink-0">{formatDate(createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              {onEdit && (
                <button
                  onClick={() => onEdit(resource)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(resource)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                >
                  Delete
                </button>
              )}
            </>
          )}

          <Link
            to={`/documents/${_id}`}
            className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span>Open & Ask</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
