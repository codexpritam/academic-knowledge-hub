import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { userService } from '../services/userService';
import { Shield, LogOut, Trash2, AlertTriangle, Key, UserCheck } from 'lucide-react';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch {
      toast.error('Logout failed.');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account removal.');
      return;
    }

    try {
      setIsDeleting(true);
      await userService.deleteMyAccount();
      toast.success('Your account and all associated resources have been removed.');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your session preferences, security, and account status.
          </p>
        </div>

        {/* Account Details Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <UserCheck className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-bold text-slate-900">Current Session Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Account Email
              </span>
              <span className="font-medium text-slate-800 text-sm">{user?.email}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Security Type
              </span>
              <span className="font-medium text-slate-800 text-sm">
                {user?.googleId ? 'Google OIDC Single Sign-On' : 'Password & HttpOnly Cookie'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <Button
              variant="outline"
              icon={LogOut}
              onClick={handleLogout}
              size="sm"
            >
              Sign Out of This Device
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-50/50 p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold">Danger Zone</h3>
          </div>

          <p className="text-xs text-rose-800 leading-relaxed max-w-2xl">
            Deleting your account will immediately remove your student profile, all your uploaded academic PDFs, extracted text chunks, and vector index records. This action cannot be undone.
          </p>

          <div className="pt-2">
            <Button
              variant="danger"
              icon={Trash2}
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete My Account Permanently
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Account Confirmation"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span>
                All your uploaded notes and RAG indices will be permanently destroyed.
              </span>
            </div>

            <p className="text-xs text-slate-600">
              To confirm, type <strong className="text-slate-900 font-mono">DELETE</strong> in the box below:
            </p>

            <input
              type="text"
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm uppercase tracking-wider font-mono focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={confirmText !== 'DELETE'}
                isLoading={isDeleting}
                onClick={handleDeleteAccount}
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default SettingsPage;
