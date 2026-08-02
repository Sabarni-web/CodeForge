import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyCode } from '../../features/verification/verificationSlice';
import { FiUploadCloud, FiFileText, FiFolder, FiCode } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VerificationUploader = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [pasteContent, setPasteContent] = useState('');
  const [activeMethod, setActiveMethod] = useState('paste'); // paste, upload
  const [isReading, setIsReading] = useState(false);

  // If user wants to verify against a specific repo
  const [targetRepoId, setTargetRepoId] = useState('');

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) {
      return toast.error('Please paste some code to verify');
    }
    const files = [{ path: 'pasted_code.txt', content: pasteContent }];
    dispatch(verifyCode({ files, targetRepoId }));
  };

  const processFiles = async (fileList) => {
    setIsReading(true);
    const toastId = toast.loading('Reading files...');
    try {
      const filesToUpload = [];
      const excludePatterns = [/node_modules\//, /\.git\//, /\.DS_Store/];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (excludePatterns.some(pattern => pattern.test(file.webkitRelativePath || file.name))) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const content = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => resolve('');
          reader.readAsText(file);
        });

        if (content) {
          filesToUpload.push({
            path: file.webkitRelativePath || file.name,
            content
          });
        }
      }

      if (filesToUpload.length === 0) {
        toast.error('No valid text files found', { id: toastId });
        setIsReading(false);
        return;
      }

      toast.success(`Prepared ${filesToUpload.length} files`, { id: toastId });
      dispatch(verifyCode({ files: filesToUpload, targetRepoId }));
    } catch (err) {
      toast.error('Failed to read files', { id: toastId });
    } finally {
      setIsReading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) processFiles(e.target.files);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex gap-4 border-b border-dark-700/50 pb-4">
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeMethod === 'paste' ? 'bg-emerald-600 text-white' : 'text-dark-300 hover:bg-dark-800'}`}
          onClick={() => setActiveMethod('paste')}
        >
          <FiCode /> Paste Code
        </button>
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeMethod === 'upload' ? 'bg-emerald-600 text-white' : 'text-dark-300 hover:bg-dark-800'}`}
          onClick={() => setActiveMethod('upload')}
        >
          <FiUploadCloud /> Upload Files
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-dark-300 font-medium mb-1 block">Target Repository ID (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. 64abc123... (Leave empty to search global)" 
            className="input-field w-full md:w-1/2"
            value={targetRepoId}
            onChange={e => setTargetRepoId(e.target.value)}
          />
        </div>

        {activeMethod === 'paste' ? (
          <div className="space-y-4">
            <textarea 
              className="w-full h-64 bg-dark-950 border border-dark-700 rounded-lg p-4 text-sm font-mono text-dark-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
              placeholder="Paste your source code here..."
              value={pasteContent}
              onChange={e => setPasteContent(e.target.value)}
            />
            <div className="flex justify-end">
              <button 
                onClick={handlePasteSubmit}
                className="btn-primary bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2"
              >
                <FiCode /> Analyze Code
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <input type="file" webkitdirectory="" directory="" className="hidden" ref={folderInputRef} onChange={handleFileChange} />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isReading}
              className="border-2 border-dashed border-dark-600 hover:border-emerald-500 bg-dark-900 rounded-xl p-8 flex flex-col items-center justify-center text-dark-300 hover:text-emerald-400 transition-colors h-48"
            >
              <FiFileText className="w-10 h-10 mb-3" />
              <span className="font-semibold">Select Files</span>
              <span className="text-xs text-dark-400 mt-1">Supports multiple files or ZIP</span>
            </button>

            <button 
              onClick={() => folderInputRef.current?.click()}
              disabled={isReading}
              className="border-2 border-dashed border-dark-600 hover:border-emerald-500 bg-dark-900 rounded-xl p-8 flex flex-col items-center justify-center text-dark-300 hover:text-emerald-400 transition-colors h-48"
            >
              <FiFolder className="w-10 h-10 mb-3" />
              <span className="font-semibold">Upload Folder</span>
              <span className="text-xs text-dark-400 mt-1">Extracts structural DNA</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationUploader;
