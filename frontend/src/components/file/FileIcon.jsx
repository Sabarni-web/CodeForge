import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiHtml5,
  SiCss,
  SiPython,
  SiMarkdown,
  SiJson,
} from 'react-icons/si';
import { FiFile, FiFolder } from 'react-icons/fi';
import { getFileExtension } from '../../utils/fileHelpers';

const FileIcon = ({ filename, isDirectory, isOpen, className = 'w-4 h-4' }) => {
  if (isDirectory) {
    return <FiFolder className={`${className} ${isOpen ? 'text-brand-400' : 'text-brand-500'}`} />;
  }

  const ext = getFileExtension(filename);

  switch (ext) {
    case 'js':
      return <SiJavascript className={`${className} text-yellow-400`} />;
    case 'jsx':
      return <SiReact className={`${className} text-cyan-400`} />;
    case 'ts':
    case 'tsx':
      return <SiTypescript className={`${className} text-blue-400`} />;
    case 'html':
    case 'htm':
      return <SiHtml5 className={`${className} text-orange-500`} />;
    case 'css':
      return <SiCss className={`${className} text-blue-500`} />;
    case 'py':
      return <SiPython className={`${className} text-yellow-500`} />;
    case 'md':
      return <SiMarkdown className={`${className} text-gray-300`} />;
    case 'json':
      return <SiJson className={`${className} text-green-400`} />;
    default:
      return <FiFile className={`${className} text-dark-400`} />;
  }
};

export default FileIcon;
