import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import EventForm from '../components/EventForm';
import { createEvent, resetEventsState } from '../features/events/eventsSlice';
import { toast } from 'react-toastify';

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
          navigate(`/event/${event._id}`);
          dispatch(resetEventsState());
      }
  }, [isSuccess, isError, message, event, navigate, dispatch]);

  const handleSubmit = (formData) => {
    dispatch(createEvent(formData));
  };


  if (!user || (user.role !== 'organiser' && user.role !== 'admin')) {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
            <p className="text-secondary-600">You must be an organiser to create events.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Create New Event</h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">Fill out the details below to publish your event to the platform.</p>
      </div>

      <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default CreateEventPage;
