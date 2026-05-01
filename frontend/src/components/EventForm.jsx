import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { MapPin, Calendar as CalendarIcon, Upload, Trash2, Plus, Info, Image as ImageIcon } from 'lucide-react';

const FRONTEND_CATEGORIES = [
  'music', 'sports', 'technology', 'arts', 'business', 'food', 
  'health', 'education', 'comedy', 'film', 'fashion', 'charity', 
  'networking', 'other'
];

const EventForm = ({ initialData, onSubmit, isLoading }) => {
  const [imagePreview, setImagePreview] = useState(initialData?.image && initialData.image !== 'no-photo.jpg' ? initialData.image : null);
  const [imageFile, setImageFile] = useState(null);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      status: initialData?.status || 'draft',
      location: {
        venue: initialData?.location?.venue || '',
        address: initialData?.location?.address || '',
        city: initialData?.location?.city || '',
      },
      date: initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
      ticketTiers: initialData?.ticketTiers || [{ name: 'general', price: 0, capacity: 100 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketTiers"
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    
    // Append standard fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('status', data.status);
    
    // Calculate total capacity
    const totalCapacity = data.ticketTiers.reduce((sum, tier) => sum + parseInt(tier.capacity || 0), 0);
    formData.append('capacity', totalCapacity);
    
    // Append nested objects as JSON strings
    formData.append('location', JSON.stringify(data.location));
    formData.append('date', data.date); // Backend expects a single date string
    formData.append('ticketTiers', JSON.stringify(data.ticketTiers));
    
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-12">
        <div className="border-b border-secondary-900/10 dark:border-white/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-secondary-900 dark:text-white">Basic Information</h2>
          <p className="mt-1 text-sm leading-6 text-secondary-500 dark:text-secondary-400">
            This information will be displayed publicly so be careful what you share.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="title" className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                Event Title *
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-600 sm:max-w-md bg-white dark:bg-secondary-900">
                  <input
                    type="text"
                    id="title"
                    className="block flex-1 border-0 bg-transparent py-1.5 px-3 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="e.g. Summer Music Festival 2026"
                    {...register("title", { required: "Title is required", maxLength: { value: 100, message: "Max 100 characters" } })}
                  />
                </div>
                {errors.title && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                Category *
              </label>
              <div className="mt-2">
                <input
                  list="categories"
                  id="category"
                  className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:max-w-xs sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900"
                  placeholder="Select or type category"
                  {...register("category", { required: "Category is required" })}
                />
                <datalist id="categories">
                  {FRONTEND_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </datalist>
                {errors.category && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.category.message}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                Status
              </label>
              <div className="mt-2">
                <select
                  id="status"
                  className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:max-w-xs sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900"
                  {...register("status")}
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="published">Published (Public)</option>
                </select>
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                Description *
              </label>
              <div className="mt-2 relative">
                <div className="absolute top-3 left-3 text-secondary-400 pointer-events-none">
                     <Info className="h-5 w-5" />
                </div>
                <textarea
                  id="description"
                  rows={4}
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900 resize-none"
                  placeholder="Provide details about your event..."
                  {...register("description", { required: "Description is required" })}
                />
              </div>
              {errors.description && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            </div>

            <div className="col-span-full">
              <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                Event Image
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-secondary-900/25 dark:border-white/25 px-6 py-10 relative bg-secondary-50 dark:bg-secondary-900/50 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors group overflow-hidden">
                {imagePreview ? (
                   <>
                       <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                           <span className="text-white font-medium flex items-center gap-2"><Upload className="w-4 h-4" /> Change Image</span>
                       </div>
                   </>
                ) : (
                   <div className="text-center">
                     <ImageIcon className="mx-auto h-12 w-12 text-secondary-300" aria-hidden="true" />
                     <div className="mt-4 flex text-sm leading-6 text-secondary-600 dark:text-secondary-400 justify-center">
                       <label
                         htmlFor="file-upload"
                         className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary-600 dark:text-primary-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500"
                       >
                         <span>Upload a file</span>
                         <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                       </label>
                       <p className="pl-1">or drag and drop</p>
                     </div>
                     <p className="text-xs leading-5 text-secondary-500 dark:text-secondary-500">PNG, JPG, GIF up to 5MB</p>
                   </div>
                )}
                {imagePreview && <input id="file-upload-overlay" name="file-upload-overlay" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-secondary-900/10 dark:border-white/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-secondary-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-secondary-400" /> Date & Location
          </h2>
          <p className="mt-1 text-sm leading-6 text-secondary-500 dark:text-secondary-400">
            Let people know when and where the event will take place.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="date" className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                Event Date & Time *
              </label>
              <div className="mt-2">
                <input
                  type="datetime-local"
                  id="date"
                  className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900"
                  {...register("date", { required: "Date is required" })}
                />
              </div>
            </div>

            <div className="col-span-full">
              <div className="flex items-center gap-2 mb-4">
                 <MapPin className="h-5 w-5 text-secondary-400" />
                 <h3 className="text-sm font-medium text-secondary-900 dark:text-white">Location Details</h3>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="venue" className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                Venue Name *
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="venue"
                  className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900"
                  placeholder="e.g. Madison Square Garden"
                  {...register("location.venue", { required: "Venue is required" })}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="address" className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                Address
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="address"
                  className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900"
                  placeholder="123 Main St"
                  {...register("location.address")}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="city" className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                City *
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="city"
                  className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900"
                  placeholder="New York"
                  {...register("location.city", { required: "City is required" })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-secondary-900/10 dark:border-white/10 pb-12">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-base font-semibold leading-7 text-secondary-900 dark:text-white">Ticket Tiers</h2>
                  <p className="mt-1 text-sm leading-6 text-secondary-500 dark:text-secondary-400">
                    Define the pricing and availability for your event.
                  </p>
              </div>
              <button 
                type="button" 
                onClick={() => append({ name: 'general', price: 0, capacity: 50 })}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-secondary-800 px-3 py-2 text-sm font-semibold text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700"
              >
                <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                Add Tier
              </button>
          </div>

          <div className="mt-8 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end bg-secondary-50 dark:bg-secondary-900/30 p-4 rounded-xl ring-1 ring-secondary-900/5 dark:ring-white/10 relative group">
                <div className="sm:col-span-1">
                  <label htmlFor={`tier-name-${index}`} className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                    Tier Type
                  </label>
                  <div className="mt-2">
                    <select
                      id={`tier-name-${index}`}
                      className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:max-w-xs sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900"
                      {...register(`ticketTiers.${index}.name`, { required: true })}
                    >
                      <option value="free">Free</option>
                      <option value="general">General Admission</option>
                      <option value="vip">VIP</option>
                      <option value="early_bird">Early Bird</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor={`tier-price-${index}`} className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                    Price ($)
                  </label>
                  <div className="mt-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id={`tier-price-${index}`}
                      className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900"
                      {...register(`ticketTiers.${index}.price`, { required: true, valueAsNumber: true, min: 0 })}
                    />
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label htmlFor={`tier-capacity-${index}`} className="block text-sm font-medium leading-6 text-secondary-900 dark:text-white">
                    Capacity
                  </label>
                  <div className="mt-2">
                    <input
                      type="number"
                      min="1"
                      id={`tier-capacity-${index}`}
                      className="block w-full rounded-md border-0 py-1.5 text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-white dark:bg-secondary-900"
                      {...register(`ticketTiers.${index}.capacity`, { required: true, valueAsNumber: true, min: 1 })}
                    />
                  </div>
                </div>

                <div className="sm:col-span-1 flex justify-end pb-1.5">
                   {fields.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-red-600/20 dark:ring-red-500/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Remove Tier"
                    >
                      <Trash2 className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                   )}
                </div>
              </div>
            ))}
            {errors.ticketTiers && <p className="mt-2 text-sm text-red-600 dark:text-red-400">At least one valid ticket tier is required.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6 pb-12">
        <button 
            type="button" 
            onClick={() => window.history.back()} 
            className="text-sm font-semibold leading-6 text-secondary-900 dark:text-white hover:text-secondary-600 dark:hover:text-secondary-300"
        >
            Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-primary-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : (initialData ? 'Update Event' : 'Create Event')}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
