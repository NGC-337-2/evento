import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register, reset } from '../features/auth/authSlice';
import Spinner from '../components/Spinner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const userData = {
      name,
      email,
      password,
    };

    dispatch(register(userData));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
      <div className="card w-full max-w-md p-8 dark:bg-secondary-800 dark:border-secondary-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Create an account</h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">Join EventO to discover and book events</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1" htmlFor="name">Full Name</label>
            <input 
              id="name" 
              type="text" 
              className="input-field dark:bg-secondary-900 dark:border-secondary-700 dark:text-white" 
              placeholder="John Doe"
              value={name}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              autoComplete="email"
              className="input-field dark:bg-secondary-900 dark:border-secondary-700 dark:text-white" 
              placeholder="you@example.com"
              value={email}
              onChange={onChange}
              required
            />

          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              autoComplete="new-password"
              className="input-field dark:bg-secondary-900 dark:border-secondary-700 dark:text-white" 
              placeholder="••••••••"
              value={password}
              onChange={onChange}
              required
            />

          </div>
          
          <button type="submit" className="btn btn-primary w-full h-10 mt-6" disabled={isLoading}>
             {isLoading ? 'Creating Account...' : 'Sign Up'}
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

