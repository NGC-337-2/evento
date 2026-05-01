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
    role: 'attendee',
  });

  const { name, email, password, role } = formData;

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
      role,
    };

    dispatch(register(userData));
  };

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  return (
    <div className="flex min-h-full flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-secondary-900 dark:text-white">
              Create an account
            </h2>
            <p className="mt-2 text-sm leading-6 text-secondary-500 dark:text-secondary-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <div>
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white"
                  >
                    Full Name
                  </label>
                  <div className="mt-2">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={onChange}
                      className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white dark:bg-secondary-800 shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={onChange}
                      className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white dark:bg-secondary-800 shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white"
                  >
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={onChange}
                      className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white dark:bg-secondary-800 shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white mb-2">
                    I want to:
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: 'attendee' }))
                      }
                      className={`relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm focus:outline-none ring-1 ring-inset transition-colors ${
                        role === 'attendee'
                          ? 'ring-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'ring-secondary-300 dark:ring-secondary-700 bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <p
                              className={`font-medium ${role === 'attendee' ? 'text-primary-900 dark:text-primary-200' : 'text-secondary-900 dark:text-white'}`}
                            >
                              Attend Events
                            </p>
                            <p
                              className={`inline ${role === 'attendee' ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500 dark:text-secondary-400'}`}
                            >
                              Buy tickets
                            </p>
                          </div>
                        </div>
                        {role === 'attendee' && (
                          <div className="shrink-0 text-primary-600 dark:text-primary-400">
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: 'organizer' }))
                      }
                      className={`relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm focus:outline-none ring-1 ring-inset transition-colors ${
                        role === 'organizer'
                          ? 'ring-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'ring-secondary-300 dark:ring-secondary-700 bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-sm">
                            <p
                              className={`font-medium ${role === 'organizer' ? 'text-primary-900 dark:text-primary-200' : 'text-secondary-900 dark:text-white'}`}
                            >
                              Organize
                            </p>
                            <p
                              className={`inline ${role === 'organizer' ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-500 dark:text-secondary-400'}`}
                            >
                              Host events
                            </p>
                          </div>
                        </div>
                        {role === 'organizer' && (
                          <div className="shrink-0 text-primary-600 dark:text-primary-400">
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1908&q=80"
          alt="Concert crowd"
        />
        <div
          className="absolute inset-0 bg-primary-600 mix-blend-multiply"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default RegisterPage;
