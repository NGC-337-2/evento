import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEventById, updateEvent, resetEventsState } from '../features/events/eventsSlice';
import EventForm from '../components/EventForm';
import { toast } from 'react-toastify';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { event, isLoading, isError, isSuccess, message } = useSelector(state => state.events);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(getEventById(id));
    
    return () => {
        dispatch(resetEventsState());
    }
  }, [dispatch, id]);

  useEffect(() => {
      if (isError) {
          toast.error(message);
          dispatch(resetEventsState());
      }
      if (isSuccess && event && !isLoading) {
          // If we just finished an update (isSuccess is true)
          // we can navigate away or stay. 
          // Note: isSuccess is also true after getEventById.
          // So we should probably check if it was an update.
      }
  }, [isError, isSuccess, message, dispatch, event, isLoading]);

  const handleSubmit = (formData) => {
    dispatch(updateEvent({ id, eventData: formData }))
        .unwrap()
        .then(() => {
            toast.success('Event updated successfully!');
            navigate(`/event/${id}`);
        })
        .catch((err) => toast.error(err));
  };


  if (!user || (user.role !== 'organiser' && user.role !== 'admin')) {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
            <p className="text-secondary-600">You must be an organiser to edit events.</p>
        </div>
    );
  }

  if (isLoading || !event) {
    return <div className="container mx-auto px-4 py-12 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }


  if (isError) {
    return <div className="container mx-auto px-4 py-12 text-center text-red-500">Error loading event details for editing.</div>;
  }

  // Safety check: ensure the currently logged in user owns this event
  if (event.organiser?._id !== user._id && user.role !== 'admin') {
      return (
          <div className="container mx-auto px-4 py-12 text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
              <p className="text-secondary-600">You are not authorized to edit this event.</p>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Edit Event</h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">Update the details for "{event.title}"</p>
      </div>

      {event && <EventForm initialData={event} onSubmit={handleSubmit} isLoading={isSaving} />}
    </div>
  );
};

export default EditEventPage;
