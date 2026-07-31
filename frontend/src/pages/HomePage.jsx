import { useSelector } from 'react-redux';
import LandingHero from '../components/LandingHero';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="animate-fade-in">
      <LandingHero />
    </div>
  );
};

export default HomePage;
