import { useSelector } from 'react-redux';
import { User, Mail, Shield, Calendar, Edit2 } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white uppercase tracking-tight">Account Settings</h1>
        <button className="btn btn-primary h-10 px-6 gap-2"><Edit2 className="w-4 h-4" /> Edit Profile</button>
      </div>

      <div className="space-y-6">
          {/* Profile Card */}
          <div className="card p-8 bg-white dark:bg-secondary-800 dark:border-secondary-700 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 border-4 border-white dark:border-secondary-800 shadow-xl">
                  {user.avatar ? (
                      <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
                  ) : (
                      <User className="w-12 h-12" />
                  )}
              </div>
              <h2 className="text-2xl font-black text-secondary-900 dark:text-white uppercase tracking-tighter">{user.name}</h2>
              <p className="text-secondary-500 dark:text-secondary-400 capitalize flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4" /> {user.role} Account
              </p>
          </div>

          {/* Details Card */}
          <div className="card p-6 bg-white dark:bg-secondary-800 dark:border-secondary-700 space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-700 px-2 hover:bg-secondary-50 dark:hover:bg-secondary-900/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-secondary-400" />
                      <span className="text-sm font-medium text-secondary-500 uppercase tracking-widest">Email</span>
                  </div>
                  <span className="text-secondary-900 dark:text-white font-bold">{user.email}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-700 px-2 hover:bg-secondary-50 dark:hover:bg-secondary-900/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-secondary-400" />
                      <span className="text-sm font-medium text-secondary-500 uppercase tracking-widest">Member Since</span>
                  </div>
                  <span className="text-secondary-900 dark:text-white font-bold">April 2026</span>
              </div>
          </div>

          <div className="flex justify-center">
              <button className="text-red-500 text-sm font-bold uppercase tracking-widest hover:underline">Delete Account</button>
          </div>
      </div>
    </div>
  );
};

export default ProfilePage;
