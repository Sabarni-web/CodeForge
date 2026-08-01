import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const MainLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-dark-50">
      <Navbar />
      <main className={`flex-1 w-full animate-fade-in ${isHome ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
