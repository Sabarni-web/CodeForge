import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySites, deleteSite, fetchSiteById } from '../features/ai/aiThunks';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { FiCpu, FiExternalLink, FiTrash2, FiClock } from 'react-icons/fi';
import { timeAgo } from '../utils/dateFormatter';
import toast from 'react-hot-toast';

const MySitesPage = () => {
  const dispatch = useDispatch();
  const { sites, loading } = useSelector((state) => state.ai);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchMySites());
  }, [dispatch]);

  const confirmDelete = (site) => {
    setSiteToDelete(site);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!siteToDelete) return;
    try {
      await dispatch(deleteSite(siteToDelete._id)).unwrap();
      toast.success('Site deleted');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete site');
    }
  };

  const handlePreview = async (site) => {
    const loadingToast = toast.loading('Loading preview...');
    try {
      const fullSite = await dispatch(fetchSiteById(site._id)).unwrap();
      
      const blob = new Blob([fullSite.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to load preview');
    }
  };
  
  // Real implementation might fetch HTML by ID on click.
  
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8 border-b border-dark-700/50 pb-6">
        <FiCpu className="w-8 h-8 text-brand-500" />
        <div>
          <h1 className="text-3xl font-bold text-dark-50">My Generated Sites</h1>
          <p className="text-dark-400">History of websites you've built with AI</p>
        </div>
      </div>

      {loading ? (
        <Loader size="lg" text="Loading history..." />
      ) : sites.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-2">
          <h3 className="text-lg font-medium text-dark-200 mb-2">No generated sites yet</h3>
          <p className="text-dark-400 text-sm">Head over to the AI Generator to build your first site.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div key={site._id} className="glass-card p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-brand-400 mb-2 truncate" title={site.title}>
                {site.title}
              </h3>
              
              <div className="bg-dark-950 p-3 rounded-lg border border-dark-800 mb-4 flex-1">
                <p className="text-sm text-dark-300 font-mono text-xs line-clamp-4">
                  "{site.prompt}"
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-dark-700/50">
                <div className="flex items-center gap-1 text-xs text-dark-400">
                  <FiClock /> {timeAgo(site.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePreview(site)}
                    className="text-brand-400 hover:text-brand-300 p-1.5 rounded hover:bg-dark-800 transition-colors"
                    title="Preview"
                  >
                    <FiExternalLink className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => confirmDelete(site)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-dark-800 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Generated Site">
        <p className="text-dark-300 mb-6">
          Are you sure you want to delete <strong className="text-brand-400">"{siteToDelete?.title}"</strong>? 
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default MySitesPage;
