import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { toggleTheme } from '../../features/ui/uiSlice';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function DashboardHeader() {
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-[#E2E8F0] bg-white px-8 dark:border-secondary-800 dark:bg-secondary-900 transition-colors">
      <div className="flex flex-1 items-center gap-4">
        <Search className="h-5 w-5 text-secondary-400" />
        <input
          type="text"
          placeholder="Type to search..."
          className="w-full max-w-md border-none bg-transparent py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:ring-0 dark:text-white"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF4FB] text-[#64748B] hover:bg-[#E2E8F0] dark:bg-secondary-800 dark:text-secondary-400 dark:hover:bg-secondary-700 transition-colors"
          >
            <div className="relative h-5 w-10 rounded-full bg-[#E2E8F0] dark:bg-secondary-700 flex items-center px-1">
              <div
                className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </div>
          </button>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF4FB] text-[#64748B] hover:bg-[#E2E8F0] dark:bg-secondary-800 dark:text-secondary-400">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF4FB] text-[#64748B] hover:bg-[#E2E8F0] dark:bg-secondary-800 dark:text-secondary-400">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-primary-600" />
          </button>
        </div>

        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-3 focus:outline-none">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-xs text-secondary-500">
                {user?.role === 'organizer' ? 'Event Organizer' : 'Attendee'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full overflow-hidden border border-secondary-200">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-secondary-400" />
          </MenuButton>

          <MenuItems className="absolute right-0 mt-3 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-secondary-800 dark:ring-white/10">
            <MenuItem>
              <a
                href="/profile"
                className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
              >
                My Profile
              </a>
            </MenuItem>
            <MenuItem>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
              >
                Settings
              </a>
            </MenuItem>
            <MenuItem>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary-100 dark:hover:bg-secondary-700"
              >
                Logout
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
}
