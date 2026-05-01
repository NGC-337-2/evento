import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEventById, updateEvent, resetEventsState } from '../features/events/eventsSlice';
import EventForm from '../components/EventForm';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { event, isLoading, isError, isSuccess, message } = useSelector(state => state.events);
  const { user } = useSelector(state => state.auth);
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
    dispatch(updateEvent({ id, eventData: formData }))
        .unwrap()
        .then(() => {
            toast.success('Event updated successfully!');
            navigate(`/event/${id}`);
        })
        .catch((err) => toast.error(err))
        .finally(() => setIsSaving(false));
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
                    <p>You must be an organizer to edit events.</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
    );
  }

  if (isLoading || !event) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (isError) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center text-red-500">Error loading event details for editing.</div>;
  }

  // Safety check: ensure the currently logged in user owns this event
  if (event.organizer?._id !== user._id && user.role !== 'admin') {
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
                    <p>You are not authorized to edit this event.</p>
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
            <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">Edit Event</h1>
            <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">Update the details for "{event.title}"</p>
          </div>

          {event && <EventForm initialData={event} onSubmit={handleSubmit} isLoading={isSaving} />}
      </div>
    </div>
  );
};

export default EditEventPage;
