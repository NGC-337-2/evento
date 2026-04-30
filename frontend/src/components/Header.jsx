import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { toggleTheme } from '../features/ui/uiSlice';
import { Calendar, User, LogOut, Sun, Moon, Layout } from 'lucide-react';

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-secondary-200 bg-white/80 backdrop-blur-md dark:bg-secondary-900/80 dark:border-secondary-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xl tracking-tight">
          <Calendar className="h-6 w-6" />
          <span>EventO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/explore" className="text-secondary-600 hover:text-primary-600 dark:text-secondary-300 dark:hover:text-primary-400 transition-colors">
            Discover
          </Link>
          <Link to="/explore" className="text-secondary-600 hover:text-primary-600 dark:text-secondary-300 dark:hover:text-primary-400 transition-colors">
            Categories
          </Link>
          {user?.role === 'organiser' || user?.role === 'admin' ? (
            <Link to="/dashboard" className="text-secondary-600 hover:text-primary-600 dark:text-secondary-300 dark:hover:text-primary-400 transition-colors">
              Manage Events
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-300 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <Link to="/dashboard" className="p-2 text-secondary-500 hover:text-primary-600 transition-colors" title="Dashboard">
                <Layout className="h-5 w-5" />
              </Link>
              <button onClick={handleLogout} className="text-secondary-500 hover:text-red-500 transition-colors" title="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost px-4 h-9">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary px-4 h-9">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
