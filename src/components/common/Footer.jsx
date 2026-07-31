import { FiCode, FiGithub, FiHeart } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="border-t border-dark-700/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-dark-500 text-sm">
            <FiCode className="w-4 h-4" />
            <span>© {new Date().getFullYear()} CodeForge. Built with</span>
            <FiHeart className="w-3 h-3 text-red-400" />
          </div>
          <div className="flex items-center gap-4 text-dark-500 text-sm">
            <span>MERN Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
