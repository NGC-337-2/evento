import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
      <div className="card w-full max-w-md p-8 dark:bg-secondary-800 dark:border-secondary-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Create an account</h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">Join EventO to discover and book events</p>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1" htmlFor="name">Full Name</label>
            <input 
              id="name" 
              type="text" 
              className="input-field dark:bg-secondary-900 dark:border-secondary-700 dark:text-white" 
              placeholder="John Doe" 
            />
          </div>
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
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              className="input-field dark:bg-secondary-900 dark:border-secondary-700 dark:text-white" 
              placeholder="••••••••" 
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full h-10 mt-6">
            Sign Up
          </button>
        </form>
        
        <p className="text-center text-sm text-secondary-500 dark:text-secondary-400 mt-6">
          Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
