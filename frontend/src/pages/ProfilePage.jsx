import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  X,
  MapPin,
  Info,
} from 'lucide-react';
import {
  updateProfile,
  updatePassword,
  resetUserState,
} from '../features/users/userSlice';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const { isSuccess, isError, message } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (isSuccess) {
      if (isEditing) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.success('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '' });
      }
    }
    if (isError) {
      toast.error(message);
    }
    dispatch(resetUserState());
  }, [isSuccess, isError, message, dispatch, isEditing]);

  if (!user) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ id: user._id, ...formData }));
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    dispatch(updatePassword({ id: user._id, ...passwordData }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-4xl space-y-10 divide-y divide-secondary-200 dark:divide-secondary-700">
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-secondary-900 dark:text-white">
              Personal Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-secondary-500 dark:text-secondary-400">
              Use a permanent address where you can receive mail.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-secondary-800 shadow-sm ring-1 ring-secondary-900/5 dark:ring-white/10 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="flex items-center gap-x-6 mb-8">
                <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 border border-secondary-200 dark:border-secondary-700 shadow-sm overflow-hidden">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      className="h-full w-full object-cover"
                      alt={user.name}
                    />
                  ) : (
                    <User className="h-12 w-12" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 capitalize flex items-center gap-1 mt-1">
                    <Shield className="h-4 w-4" /> {user.role} Account
                  </p>
                </div>
              </div>

              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white"
                  >
                    Full name
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600 sm:max-w-md bg-white dark:bg-secondary-900">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="block flex-1 border-0 bg-transparent py-1.5 px-3 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-0 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Jane Smith"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 sm:max-w-md bg-secondary-50 dark:bg-secondary-800 opacity-70">
                      <span className="flex select-none items-center pl-3 text-secondary-500 sm:text-sm">
                        <Mail className="h-4 w-4 mr-2" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={user.email}
                        disabled
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-secondary-900 dark:text-white focus:ring-0 sm:text-sm sm:leading-6 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white"
                  >
                    Location
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600 sm:max-w-md bg-white dark:bg-secondary-900">
                      <span className="flex select-none items-center pl-3 text-secondary-500 sm:text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                      </span>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-0 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white"
                  >
                    Bio
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600 bg-white dark:bg-secondary-900 relative">
                      <div className="absolute top-2 left-3 text-secondary-500 pointer-events-none">
                        <Info className="h-4 w-4" />
                      </div>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="block w-full border-0 bg-transparent py-1.5 pl-10 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-0 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                        placeholder="Write a few sentences about yourself."
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                    Member Since
                  </label>
                  <div className="mt-2 flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'April 2026'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-x-6 border-t border-secondary-900/10 dark:border-white/10 px-4 py-4 sm:px-8 bg-secondary-50 dark:bg-secondary-900/50 rounded-b-xl">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-md bg-white dark:bg-secondary-800 px-3 py-2 text-sm font-semibold text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        bio: user?.bio || '',
                        location: user?.location || '',
                      });
                    }}
                    className="text-sm font-semibold leading-6 text-secondary-900 dark:text-white flex items-center gap-1 hover:text-secondary-600 dark:hover:text-secondary-300"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Security / Change Password */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-secondary-900 dark:text-white">
              Security Settings
            </h2>
            <p className="mt-1 text-sm leading-6 text-secondary-500 dark:text-secondary-400">
              Update your password associated with your account.
            </p>
          </div>

          <form
            onSubmit={handlePasswordUpdate}
            className="bg-white dark:bg-secondary-800 shadow-sm ring-1 ring-secondary-900/5 dark:ring-white/10 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white"
                  >
                    Current password
                  </label>
                  <div className="mt-2">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 bg-white dark:bg-secondary-900 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white"
                  >
                    New password
                  </label>
                  <div className="mt-2">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 bg-white dark:bg-secondary-900 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-x-6 border-t border-secondary-900/10 dark:border-white/10 px-4 py-4 sm:px-8 bg-secondary-50 dark:bg-secondary-900/50 rounded-b-xl">
              <button
                type="submit"
                disabled={
                  !passwordData.currentPassword || !passwordData.newPassword
                }
                className="rounded-md bg-secondary-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-900 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-secondary-100 dark:text-secondary-900 dark:hover:bg-white"
              >
                Update password
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-secondary-900 dark:text-white">
              Delete account
            </h2>
            <p className="mt-1 text-sm leading-6 text-secondary-500 dark:text-secondary-400">
              No longer want to use our service? You can delete your account
              here. This action is not reversible. All information related to
              this account will be deleted permanently.
            </p>
          </div>

          <div className="flex items-start md:col-span-2 pt-2 px-4 sm:px-0">
            <button
              type="button"
              className="rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-red-600/20 dark:ring-red-500/30 hover:bg-red-100 dark:hover:bg-red-900/40 opacity-50 cursor-not-allowed"
              disabled
            >
              Yes, delete my account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
