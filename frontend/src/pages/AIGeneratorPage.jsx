import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateSite } from '../features/ai/aiThunks';
import { clearAiError, clearGeneratedHtml } from '../features/ai/aiSlice.js';
import GeneratedSitePreview from '../components/ai/GeneratedSitePreview';
import { FiCpu, FiCode, FiDownload, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AIGeneratorPage = () => {
  const [prompt, setPrompt] = useState('');
  const dispatch = useDispatch();
  const { generatedHtml, generating, error } = useSelector((state) => state.ai);

  useEffect(() => {
    return () => {
      dispatch(clearGeneratedHtml());
      dispatch(clearAiError());
    };
  }, [dispatch]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (prompt.length < 10) {
      toast.error('Please provide a more detailed description (at least 10 chars)');
      return;
    }

    try {
      await dispatch(generateSite({ prompt })).unwrap();
      toast.success('Website generated successfully!');
    } catch (err) {
      toast.error(err || 'Generation failed');
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;
    
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-site-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded index.html');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
          <FiCpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dark-50">AI Website Generator</h1>
          <p className="text-dark-400 text-sm">Describe a website, and Gemini will build it.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 shrink-0">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left column: Input */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 shrink-0">
          <div className="glass-card p-5 flex-1 flex flex-col">
            <label className="block text-sm font-semibold text-dark-200 mb-3">
              What do you want to build?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full flex-1 bg-dark-950 border border-dark-700 rounded-lg p-4 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500/50 resize-none font-sans"
              placeholder="E.g., A modern dark-mode landing page for a coffee shop, with a hero section, pricing table, and a contact form. Use purple and orange accents."
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="btn-primary w-full mt-4 flex justify-center items-center gap-2 h-12"
            >
              {generating ? (
                <>
                  <FiRefreshCw className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FiCode /> Generate Code
                </>
              )}
            </button>
          </div>
          
          <div className="glass-card p-4 text-sm text-dark-400">
            <strong className="text-brand-400 block mb-1">Pro Tip:</strong>
            Be specific about colors, layout structure (navbar, hero, footer), and the overall vibe you want to achieve.
          </div>
        </div>

        {/* Right column: Preview */}
        <div className="w-full lg:w-2/3 flex flex-col bg-dark-900 border border-dark-700 rounded-xl overflow-hidden shadow-2xl relative min-h-[500px]">
          <div className="h-12 border-b border-dark-700 flex items-center justify-between px-4 bg-dark-950 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-4 text-xs font-mono text-dark-400">Preview: index.html</span>
            </div>
            
            {generatedHtml && (
              <button 
                onClick={handleDownload}
                className="text-dark-300 hover:text-white flex items-center gap-1.5 text-xs bg-dark-800 hover:bg-dark-700 px-3 py-1.5 rounded transition-colors"
              >
                <FiDownload /> Download HTML
              </button>
            )}
          </div>
          
          <div className="flex-1 relative bg-dark-800">
            {generating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/80 backdrop-blur-sm z-10">
                <div className="w-16 h-16 border-4 border-dark-700 border-t-brand-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <p className="text-brand-300 font-medium animate-pulse">AI is writing code...</p>
                <p className="text-dark-500 text-sm mt-2">This usually takes 10-20 seconds.</p>
              </div>
            ) : null}
            
            <GeneratedSitePreview html={generatedHtml} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorPage;
