import { useEffect, useRef } from 'react';

const GeneratedSitePreview = ({ html }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      // Small delay to ensure iframe is fully ready
      setTimeout(() => {
        if (iframeRef.current) {
           // We use srcDoc directly on the iframe tag now, 
           // but keeping ref for potential direct DOM manipulation if needed
        }
      }, 50);
    }
  }, [html]);

  if (!html) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-900 border border-dark-700 rounded-lg">
        <p className="text-dark-400">No content to preview</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-dark-700 shadow-2xl relative group">
      {/* Overlay to catch clicks during drag if needed in future */}
      <iframe
        ref={iframeRef}
        title="AI Generated Website Preview"
        className="w-full h-full border-none bg-white"
        sandbox="allow-scripts allow-same-origin"
        srcDoc={html}
      />
    </div>
  );
};

export default GeneratedSitePreview;
