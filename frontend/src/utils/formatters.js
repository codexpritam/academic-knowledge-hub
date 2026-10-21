/**
 * Format bytes to readable string (e.g. 2.4 MB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Format ISO date string to friendly readable date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Get color classes for processing status badge
 */
export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'READY':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PROCESSING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'UPLOADING':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'FAILED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

/**
 * Get color classes for resource type badge
 */
export const getResourceTypeColor = (type) => {
  switch (type) {
    case 'NOTES':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'PYQ':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'LAB_MANUAL':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'ASSIGNMENT':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'STUDY_MATERIAL':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
