import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useToast } from '../hooks/useToast';
import { documentService } from '../services/documentService';
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS, SEMESTER_OPTIONS } from '../utils/constants';
import { formatFileSize } from '../utils/formatters';

const UploadPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    semester: '1',
    resourceType: RESOURCE_TYPES.NOTES
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateFile = (file) => {
    if (!file) return 'Please select a PDF file.';
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF documents (.pdf) are supported.';
    }
    if (file.size > 25 * 1024 * 1024) {
      return 'File size exceeds 25MB limit.';
    }
    return null;
  };

  const handleFileSelect = (file) => {
    const error = validateFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, file: error }));
      toast.error(error);
      return;
    }
    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, file: '' }));

    // Autofill title if empty
    if (!formData.title) {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setFormData((prev) => ({ ...prev, title: cleanTitle }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!selectedFile) newErrors.file = 'Please attach a PDF document.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      data.append('semester', formData.semester);
      data.append('resourceType', formData.resourceType);
      data.append('file', selectedFile);

      const response = await documentService.uploadDocument(data, (percent) => {
        setUploadProgress(percent);
      });

      const docId = response?.data?.document?._id;
      toast.success('Document uploaded! Vector indexing started in background.');

      if (docId) {
        navigate(`/documents/${docId}`);
      } else {
        navigate('/my-resources');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 uppercase tracking-widest">
            <Upload className="w-4 h-4" />
            <span>Contribute Knowledge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Upload Academic Resource
          </h1>
          <p className="text-sm text-slate-500">
            Share your lecture notes, PYQs, and study materials. Our engine automatically indexes each page for intelligent AI retrieval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40">
          {/* File Dropzone */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              PDF Document <span className="text-rose-500">*</span>
            </label>

            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50/50'
                    : 'border-slate-300 hover:border-primary-400 bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 mb-4 shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-slate-800 text-center">
                  Click to browse or drag and drop your PDF here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported format: PDF up to 25MB
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-primary-50/60 rounded-2xl border border-primary-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {errors.file && <p className="text-xs text-rose-600 font-medium">{errors.file}</p>}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <Input
                label="Resource Title *"
                name="title"
                placeholder="e.g. DBMS Normalization and Functional Dependencies Notes"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                required
              />
            </div>

            <div>
              <Input
                label="Subject / Course *"
                name="subject"
                placeholder="e.g. Database Systems, OS, Data Structures"
                value={formData.subject}
                onChange={handleInputChange}
                error={errors.subject}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester *
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Resource Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(RESOURCE_TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, resourceType: key }))}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      formData.resourceType === key
                        ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Briefly describe topics, textbook references, or tips covered in this PDF..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
              />
            </div>
          </div>

          {/* Upload Progress Bar (when uploading) */}
          {isUploading && (
            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                  Uploading PDF & Initiating Extraction...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/resources')}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isUploading}
              icon={Sparkles}
            >
              Upload & Vectorize PDF
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UploadPage;
