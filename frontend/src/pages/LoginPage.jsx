import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
      <div className="card w-full max-w-md p-8 dark:bg-secondary-800 dark:border-secondary-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">Enter your credentials to access your account</p>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              className="input-field dark:bg-secondary-900 dark:border-secondary-700 dark:text-white" 
              placeholder="you@example.com" 
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300" htmlFor="password">Password</label>
              <a href="#" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</a>
            </div>
            <input 
              id="password" 
              type="password" 
              className="input-field dark:bg-secondary-900 dark:border-secondary-700 dark:text-white" 
              placeholder="••••••••" 
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full h-10 mt-6">
            Log In
          </button>
        </form>
        
        <p className="text-center text-sm text-secondary-500 dark:text-secondary-400 mt-6">
          Don't have an account? <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
