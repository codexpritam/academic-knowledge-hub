import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { userService } from '../services/userService';
import { User, Mail, GraduationCap, Building2, BookOpen, Layers, Check } from 'lucide-react';
import { SEMESTER_OPTIONS } from '../utils/constants';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({ uploadedResources: 0 });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    college: user?.college || '',
    branch: user?.branch || '',
    semester: user?.semester || 1,
    avatar: user?.avatar || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getMyProfile();
        if (res?.data?.stats) {
          setStats(res.data.stats);
        }
        if (res?.data?.user) {
          setFormData({
            name: res.data.user.name || '',
            bio: res.data.user.bio || '',
            college: res.data.user.college || '',
            branch: res.data.user.branch || '',
            semester: res.data.user.semester || 1,
            avatar: res.data.user.avatar || ''
          });
        }
      } catch {
        // Continue
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await userService.updateMyProfile(formData);
      if (res?.data?.user) {
        updateUser(res.data.user);
      }
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal academic identity and view your community contributions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: Avatar & Stats Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={
                  formData.avatar ||
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Student'}`
                }
                alt={user?.name}
                className="w-24 h-24 rounded-3xl object-cover mx-auto bg-slate-100 border-2 border-primary-200 shadow-md"
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-lg">{user?.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
              <span className="inline-block mt-2 text-[11px] font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
                Verified Student
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-around">
              <div>
                <p className="text-xl font-extrabold text-slate-900">{stats.uploadedResources}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Uploads</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <p className="text-xl font-extrabold text-primary-600">Sem {formData.semester}</p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Semester</p>
              </div>
            </div>
          </div>

          {/* Right: Edit Form */}
          <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
              Personal Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email (Read Only)"
                icon={Mail}
                value={user?.email || ''}
                disabled
                className="bg-slate-50 cursor-not-allowed text-slate-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="College / University"
                  name="college"
                  placeholder="e.g. National Institute of Tech"
                  icon={Building2}
                  value={formData.college}
                  onChange={handleChange}
                />

                <Input
                  label="Department / Branch"
                  name="branch"
                  placeholder="e.g. Computer Science"
                  icon={GraduationCap}
                  value={formData.branch}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Semester
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
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
                  Academic Bio
                </label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell your classmates about your academic interests or research focus..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  icon={Check}
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
