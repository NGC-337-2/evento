import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { toggleTheme } from '../features/ui/uiSlice';
import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel } from '@headlessui/react';
import { Calendar, User, LogOut, Sun, Moon, Layout, Menu as MenuIcon, X } from 'lucide-react';

import CategoryDropdown from './CategoryDropdown';

const navigation = [
  // Discover and Categories removed as requested
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isCurrentPage = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-secondary-200 bg-white/80 backdrop-blur-md dark:bg-secondary-900/80 dark:border-secondary-800 transition-colors">
      <nav aria-label="Global" className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2 text-primary-600 dark:text-primary-500 font-bold text-xl tracking-tight">
            <Calendar className="h-6 w-6" />
            <span>EventO</span>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-secondary-700 dark:text-secondary-300"
          >
            <span className="sr-only">Open main menu</span>
            <MenuIcon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8 lg:items-center">
          <Link 
            to="/explore" 
            className={`text-sm font-semibold leading-6 ${
              isCurrentPage('/explore') 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400'
            }`}
          >
            Explore Events
          </Link>
          <CategoryDropdown />
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <Link 
              to="/dashboard" 
              className={`text-sm font-semibold leading-6 ${
                isCurrentPage('/dashboard') 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              Manage Events
            </Link>
          )}
        </div>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
          <button 
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-300 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex rounded-full bg-secondary-50 dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </MenuButton>
              </div>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-secondary-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white/10 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="px-4 py-2 border-b border-secondary-100 dark:border-secondary-700">
                  <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">{user.email}</p>
                </div>
                <MenuItem>
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 data-[focus]:bg-secondary-100 dark:data-[focus]:bg-secondary-700 flex items-center gap-2">
                    <Layout className="w-4 h-4" /> Dashboard
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 data-[focus]:bg-secondary-100 dark:data-[focus]:bg-secondary-700 flex items-center gap-2">
                    <User className="w-4 h-4" /> Your Profile
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 data-[focus]:bg-secondary-100 dark:data-[focus]:bg-secondary-700 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold leading-6 text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Log in
              </Link>
              <Link to="/register" className="rounded-md bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      {/* Mobile Slide-over Menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-secondary-900/80 backdrop-blur-sm" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-secondary-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-secondary-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2 text-primary-600 dark:text-primary-500 font-bold text-xl tracking-tight" onClick={() => setMobileMenuOpen(false)}>
              <Calendar className="h-6 w-6" />
              <span>EventO</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-secondary-700 dark:text-secondary-300"
            >
              <span className="sr-only">Close menu</span>
              <X aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-secondary-200 dark:divide-secondary-800">
              <div className="space-y-2 py-6">
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-secondary-50 dark:hover:bg-secondary-800 ${
                    isCurrentPage('/explore') ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-900 dark:text-white'
                  }`}
                >
                  Explore Events
                </Link>
                <div className="px-3 py-2">
                   <CategoryDropdown />
                </div>
                {(user?.role === 'organizer' || user?.role === 'admin') && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-secondary-900 dark:text-white hover:bg-secondary-50 dark:hover:bg-secondary-800"
                  >
                    Manage Events
                  </Link>
                )}
              </div>
              <div className="py-6">
                <div className="flex items-center justify-between mb-6 px-3">
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">Theme</span>
                  <button 
                    onClick={() => dispatch(toggleTheme())}
                    className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-600 dark:text-secondary-300 transition-colors"
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                </div>
                
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 mb-6">
                      <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-base font-medium text-secondary-900 dark:text-white">{user.name}</div>
                        <div className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{user.email}</div>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-secondary-900 dark:text-white hover:bg-secondary-50 dark:hover:bg-secondary-800"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-secondary-900 dark:text-white hover:bg-secondary-50 dark:hover:bg-secondary-800"
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="-mx-3 block w-full text-left rounded-lg px-3 py-2 text-base font-semibold leading-7 text-red-600 dark:text-red-400 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-secondary-900 dark:text-white hover:bg-secondary-50 dark:hover:bg-secondary-800"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg bg-primary-600 px-3 py-2.5 text-center text-base font-semibold leading-7 text-white hover:bg-primary-500"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Header;
