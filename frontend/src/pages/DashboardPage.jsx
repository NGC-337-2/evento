import { useSelector } from 'react-redux';
import AttendeeDashboard from '../components/AttendeeDashboard';
import OrganiserDashboard from '../components/OrganiserDashboard';
import AdminDashboard from '../components/AdminDashboard';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
          Welcome back,{' '}
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            {user.name}
          </span>{' '}
          ({user.role})
        </p>
      </div>

      {user.role === 'admin' ? (
        <AdminDashboard />
      ) : user.role === 'organizer' ? (
        <OrganiserDashboard />
      ) : (
        <AttendeeDashboard />
      )}
    </div>
  );
};

export default DashboardPage;
