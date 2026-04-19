import React, { useState } from 'react';
import { X, Upload as UploadIcon } from 'lucide-react';
import { uploadPaper } from '../api/paperApi';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('paper', file);
    formData.append('title', title || file.name);
    formData.append('author', author);

    try {
      await uploadPaper(formData);
      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">Upload Academic Paper</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paper Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Enter paper title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Author(s)</label>
            <input 
              type="text" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g. Vaswani et al."
            />
          </div>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <UploadIcon size={24} />
            </div>
            <p className="text-sm text-slate-600 font-medium">
              {file ? file.name : 'Click or drag PDF here'}
            </p>
            <p className="text-xs text-slate-400">PDF files only, max 50MB</p>
          </div>

          <button 
            type="submit"
            disabled={!file || loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Uploading...' : 'Upload Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
