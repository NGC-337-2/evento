import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
      <Header />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
