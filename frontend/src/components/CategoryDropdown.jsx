import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setFilters } from '../features/events/eventsSlice';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { Search, ChevronDown } from 'lucide-react';

const EVENT_CATEGORIES = [
  'music',
  'sports',
  'technology',
  'arts',
  'business',
  'food',
  'health',
  'education',
  'comedy',
  'film',
  'fashion',
  'charity',
  'networking',
  'other',
];

const CategoryDropdown = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const filteredCategories = EVENT_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (category) => {
    dispatch(setFilters({ category }));
    navigate('/explore');
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-1 text-sm font-semibold leading-6 text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        Categories
        <ChevronDown className="h-4 w-4" />
      </MenuButton>
      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute left-0 z-50 mt-2 w-64 origin-top-left rounded-xl bg-white dark:bg-secondary-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
          <div
            className="p-3 border-b border-secondary-100 dark:border-secondary-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 text-sm bg-secondary-50 dark:bg-secondary-900 border-none rounded-lg focus:ring-2 focus:ring-primary-500 text-secondary-900 dark:text-white"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-2">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <MenuItem key={category}>
                  {({ focus }) => (
                    <button
                      onClick={() => handleSelect(category)}
                      className={`${
                        focus ? 'bg-secondary-50 dark:bg-secondary-700' : ''
                      } group flex w-full items-center px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 capitalize`}
                    >
                      {category}
                    </button>
                  )}
                </MenuItem>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-secondary-500">
                No categories found
              </div>
            )}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default CategoryDropdown;
