import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Upload, Trash2, Edit3, AlertTriangle, BookOpen } from 'lucide-react';
import Layout from '../components/layout/Layout';
import ResourceGrid from '../components/resources/ResourceGrid';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { userService } from '../services/userService';
import { documentService } from '../services/documentService';
import { useToast } from '../hooks/useToast';
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS, SEMESTER_OPTIONS } from '../utils/constants';

const MyResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [editingResource, setEditingResource] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    subject: '',
    semester: 1,
    resourceType: RESOURCE_TYPES.NOTES
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirmation State
  const [deletingResource, setDeletingResource] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchMyResources = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await userService.getMyDocuments();
      if (res?.data?.documents) {
        setResources(res.data.documents);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch your resources.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMyResources();
  }, [fetchMyResources]);

  // Open Edit Modal
  const handleOpenEdit = (resource) => {
    setEditingResource(resource);
    setEditFormData({
      title: resource.title || '',
      description: resource.description || '',
      subject: resource.subject || '',
      semester: resource.semester || 1,
      resourceType: resource.resourceType || RESOURCE_TYPES.NOTES
    });
  };

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingResource) return;

    try {
      setIsUpdating(true);
      await documentService.updateDocument(editingResource._id, editFormData);
      toast.success('Resource details updated successfully.');
      setEditingResource(null);
      fetchMyResources();
    } catch (err) {
      toast.error(err.message || 'Failed to update resource.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deletingResource) return;

    try {
      setIsDeleting(true);
      await documentService.deleteDocument(deletingResource._id);
      toast.success('Resource and associated vector chunks deleted successfully.');
      setDeletingResource(null);
      fetchMyResources();
    } catch (err) {
      toast.error(err.message || 'Failed to delete resource.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              <span>Personal Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Uploaded Resources
            </h1>
            <p className="text-sm text-slate-500">
              Manage, edit metadata, or inspect the AI vector status of your shared materials.
            </p>
          </div>

          <Link to="/upload">
            <Button variant="primary" icon={Upload}>
              Upload New PDF
            </Button>
          </Link>
        </div>

        {/* Resources Grid */}
        <ResourceGrid
          resources={resources}
          isLoading={isLoading}
          isOwner={true}
          onEdit={handleOpenEdit}
          onDelete={(res) => setDeletingResource(res)}
          emptyTitle="You haven't uploaded any resources yet"
          emptyDescription="Contribute your class notes, tutorial solutions, or question papers to help your classmates learn."
          actionText="Upload First Resource"
          onAction={() => navigate('/upload')}
        />

        {/* Edit Resource Modal */}
        <Modal
          isOpen={Boolean(editingResource)}
          onClose={() => setEditingResource(null)}
          title="Edit Resource Metadata"
        >
          {editingResource && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <Input
                label="Title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                required
              />

              <Input
                label="Subject"
                value={editFormData.subject}
                onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Semester
                  </label>
                  <select
                    value={editFormData.semester}
                    onChange={(e) => setEditFormData({ ...editFormData, semester: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                  >
                    {SEMESTER_OPTIONS.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={editFormData.resourceType}
                    onChange={(e) => setEditFormData({ ...editFormData, resourceType: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                  >
                    {Object.entries(RESOURCE_TYPE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingResource(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isUpdating}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={Boolean(deletingResource)}
          onClose={() => setDeletingResource(null)}
          title="Delete Academic Resource"
          maxWidth="max-w-md"
        >
          {deletingResource && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl text-rose-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  This action is permanent. All indexed vector embeddings, text chunks, and stored PDF files will be immediately purged.
                </span>
              </div>

              <p className="text-sm text-slate-700">
                Are you sure you want to delete <strong className="text-slate-900">{deletingResource.title}</strong>?
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDeletingResource(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  isLoading={isDeleting}
                  onClick={handleConfirmDelete}
                  icon={Trash2}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default MyResourcesPage;
