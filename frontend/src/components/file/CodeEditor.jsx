import { Editor } from '@monaco-editor/react';
import { getLanguageFromFilename } from '../../utils/fileHelpers';
import { useSelector } from 'react-redux';

const CodeEditor = ({ filename, content, onChange, readOnly = false }) => {
  const language = getLanguageFromFilename(filename);
  const { theme } = useSelector((state) => state.ui);

  return (
    <div className="border border-dark-700 rounded-lg overflow-hidden h-[600px] w-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        value={content}
        onChange={onChange}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          padding: { top: 16 },
        }}
        loading={<div className="text-dark-400 flex justify-center p-8">Loading editor...</div>}
      />
    </div>
  );
};

export default CodeEditor;
