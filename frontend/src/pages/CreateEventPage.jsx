import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import EventForm from '../components/EventForm';
import { createEvent, resetEventsState } from '../features/events/eventsSlice';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const { isLoading, isSuccess, isError, message, event } = useSelector(state => state.events);

  useEffect(() => {
      if (isError) {
          toast.error(message);
          dispatch(resetEventsState());
      }
      if (isSuccess && event) {
          toast.success('Event created successfully!');
          navigate('/dashboard');
          dispatch(resetEventsState());
      }
  }, [isSuccess, isError, message, event, navigate, dispatch]);

  const handleSubmit = (formData) => {
    dispatch(createEvent(formData));
  };


  if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 max-w-md w-full ring-1 ring-inset ring-red-600/20 dark:ring-red-500/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Access Denied</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>You must be an organizer to create events.</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">Create New Event</h1>
            <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">Fill out the details below to publish your event to the platform.</p>
          </div>

          <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CreateEventPage;
