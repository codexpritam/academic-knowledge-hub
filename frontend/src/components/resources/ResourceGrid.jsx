import React from 'react';
import ResourceCard from './ResourceCard';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';

const ResourceGrid = ({
  resources = [],
  isLoading = false,
  isOwner = false,
  onEdit,
  onDelete,
  emptyTitle = 'No academic resources found',
  emptyDescription = 'Try adjusting your search query or filter tags to discover more student uploads.',
  actionText,
  onAction
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={actionText}
        onAction={onAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource._id}
          resource={resource}
          isOwner={isOwner}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ResourceGrid;
