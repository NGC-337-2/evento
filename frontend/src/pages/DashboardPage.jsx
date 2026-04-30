import { useSelector } from 'react-redux';
import AttendeeDashboard from '../components/AttendeeDashboard';
import OrganiserDashboard from '../components/OrganiserDashboard';
import AdminDashboard from '../components/AdminDashboard';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 flex-grow">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white uppercase tracking-tight">Dashboard</h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-1">
          Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400">{user.name}</span> ({user.role})
        </p>
      </div>
      
      {user.role === 'admin' ? (
          <AdminDashboard />
      ) : user.role === 'organiser' ? (
          <OrganiserDashboard />
      ) : (
          <AttendeeDashboard />
      )}
    </div>
  );
};

export default DashboardPage;
