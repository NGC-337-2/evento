import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { MapPin, Calendar as CalendarIcon, Upload, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';


const FRONTEND_CATEGORIES = [
  'music', 'sports', 'technology', 'arts', 'business', 'food', 
  'health', 'education', 'comedy', 'film', 'fashion', 'charity', 
  'networking', 'other'
];

const EventForm = ({ initialData, onSubmit, isLoading }) => {
  const [imagePreview, setImagePreview] = useState(initialData?.image && initialData.image !== 'no-photo.jpg' ? initialData.image : null);
  const [imageFile, setImageFile] = useState(null);

  const { register, control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      status: initialData?.status || 'draft',
      location: {
        address: initialData?.location?.address || '',
        city: initialData?.location?.city || '',
      },
      date: {
        start: initialData?.date?.start ? new Date(initialData.date.start).toISOString().slice(0, 16) : '',
        end: initialData?.date?.end ? new Date(initialData.date.end).toISOString().slice(0, 16) : '',
      },
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
    
    // Append nested objects as JSON strings
    formData.append('location', JSON.stringify(data.location));
    formData.append('date', JSON.stringify(data.date));
    formData.append('ticketTiers', JSON.stringify(data.ticketTiers));
    
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="card p-6 md:p-8 dark:bg-secondary-800 dark:border-secondary-700">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Basic Information</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Event Title *</label>
            <input 
              type="text" 
              className={`input-field dark:bg-secondary-900 dark:text-white dark:border-secondary-600 ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g. Summer Music Festival 2026"
              {...register("title", { required: "Title is required", maxLength: { value: 100, message: "Max 100 characters" } })}
            />
            {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Category *</label>
              <select 
                className={`input-field dark:bg-secondary-900 dark:text-white dark:border-secondary-600 ${errors.category ? 'border-red-500' : ''}`}
                {...register("category", { required: "Category is required" })}
              >
                <option value="">Select a category</option>
                {FRONTEND_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
              {errors.category && <span className="text-red-500 text-xs mt-1">{errors.category.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Status</label>
              <select 
                className="input-field dark:bg-secondary-900 dark:text-white dark:border-secondary-600"
                {...register("status")}
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Public)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Description *</label>
            <textarea 
              className={`input-field min-h-[150px] py-3 dark:bg-secondary-900 dark:text-white dark:border-secondary-600 ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Provide details about your event..."
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description.message}</span>}
          </div>
        </div>
      </div>

      {/* Date & Location */}
      <div className="card p-6 md:p-8 dark:bg-secondary-800 dark:border-secondary-700">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Date & Location</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 text-primary-600 dark:text-primary-400 font-semibold">
              <CalendarIcon className="w-5 h-5" /> Date & Time
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Start Time *</label>
              <input 
                type="datetime-local" 
                className={`input-field dark:bg-secondary-900 dark:text-white dark:border-secondary-600 ${errors.date?.start ? 'border-red-500' : ''}`}
                {...register("date.start", { required: "Start time is required" })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">End Time *</label>
              <input 
                type="datetime-local" 
                className={`input-field dark:bg-secondary-900 dark:text-white dark:border-secondary-600 ${errors.date?.end ? 'border-red-500' : ''}`}
                {...register("date.end", { required: "End time is required" })}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 text-primary-600 dark:text-primary-400 font-semibold">
              <MapPin className="w-5 h-5" /> Location
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Venue / Address *</label>
              <input 
                type="text" 
                className={`input-field dark:bg-secondary-900 dark:text-white dark:border-secondary-600 ${errors.location?.address ? 'border-red-500' : ''}`}
                placeholder="123 Main St, Venue Name"
                {...register("location.address", { required: "Address is required" })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">City *</label>
              <input 
                type="text" 
                className={`input-field dark:bg-secondary-900 dark:text-white dark:border-secondary-600 ${errors.location?.city ? 'border-red-500' : ''}`}
                placeholder="New York"
                {...register("location.city", { required: "City is required" })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className="card p-6 md:p-8 dark:bg-secondary-800 dark:border-secondary-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Ticket Tiers</h2>
          <button 
            type="button" 
            onClick={() => append({ name: 'general', price: 0, capacity: 50 })}
            className="btn btn-outline text-sm h-8 px-3 gap-1"
          >
            <Plus className="w-4 h-4" /> Add Tier
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap items-start gap-4 p-4 border border-secondary-200 dark:border-secondary-700 rounded-xl relative">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">Tier Type</label>
                <select 
                  className="input-field text-sm dark:bg-secondary-900 dark:text-white dark:border-secondary-600"
                  {...register(`ticketTiers.${index}.name`, { required: true })}
                >
                  <option value="free">Free</option>
                  <option value="general">General Admission</option>
                  <option value="vip">VIP</option>
                  <option value="early_bird">Early Bird</option>
                </select>
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className="block text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  className="input-field text-sm dark:bg-secondary-900 dark:text-white dark:border-secondary-600"
                  {...register(`ticketTiers.${index}.price`, { required: true, valueAsNumber: true, min: 0 })}
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                <label className="block text-xs font-medium text-secondary-500 dark:text-secondary-400 mb-1">Capacity</label>
                <input 
                  type="number" 
                  min="1"
                  className="input-field text-sm dark:bg-secondary-900 dark:text-white dark:border-secondary-600"
                  {...register(`ticketTiers.${index}.capacity`, { required: true, valueAsNumber: true, min: 1 })}
                />
              </div>
              {fields.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  title="Remove Tier"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          {errors.ticketTiers && <span className="text-red-500 text-xs">At least one valid ticket tier is required.</span>}
        </div>
      </div>

      {/* Media */}
      <div className="card p-6 md:p-8 dark:bg-secondary-800 dark:border-secondary-700">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Event Image</h2>
        
        <div className="flex items-start gap-8">
          <div className="w-full max-w-sm">
             <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-xl cursor-pointer bg-secondary-50 dark:bg-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-800/80 transition-colors overflow-hidden group">
                {imagePreview ? (
                   <>
                       <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                           <span className="text-white font-medium flex items-center gap-2"><Upload className="w-4 h-4" /> Change Image</span>
                       </div>
                   </>
                ) : (
                   <div className="flex flex-col items-center justify-center pt-5 pb-6 text-secondary-500">
                     <Upload className="w-8 h-8 mb-3" />
                     <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span></p>
                     <p className="text-xs">PNG, JPG, WEBP (Max 5MB)</p>
                   </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
             </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pb-12">
        <button type="button" onClick={() => window.history.back()} className="btn btn-outline h-12 px-8">Cancel</button>
        <button type="submit" disabled={isLoading} className="btn btn-primary h-12 px-10 text-base">
          {isLoading ? 'Saving...' : (initialData ? 'Update Event' : 'Create Event')}
        </button>
      </div>

    </form>
  );
};

export default EventForm;
