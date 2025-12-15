import { useState } from 'react';
import { ArrowLeft, Plus, Sparkles, Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { contractFunctions } from '../utils/contract';

interface AdminPanelProps {
  walletAddress: string;
  onBack: () => void;
}

export function AdminPanel({ walletAddress, onBack }: AdminPanelProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    city: '',
    genre: 'Music',
    maxTickets: 1000,
    price: '',
    imageUrl: '',
    description: '',
  });
  const [creating, setCreating] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdEventName, setCreatedEventName] = useState('');
  const [dateTimeError, setDateTimeError] = useState('');
  const [formError, setFormError] = useState('');

  // Get current date and time in local timezone
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
      datetime: now
    };
  };

  // Validate date and time
  const validateDateTime = (date: string, time: string): string => {
    if (!date || !time) return '';
    
    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}`);
    
    // Check if date is in the past
    if (selectedDateTime < now) {
      return 'Choose a current or future date/time. Past times are not allowed.';
    }
    
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxTickets' ? parseInt(value) || 0 : value
    }));
    
    // Clear form error when user makes changes
    if (formError) setFormError('');
    
    // Validate date/time on change
    if (name === 'date' || name === 'time') {
      const dateValue = name === 'date' ? value : formData.date;
      const timeValue = name === 'time' ? value : formData.time;
      
      const error = validateDateTime(dateValue, timeValue);
      setDateTimeError(error);
    }
  };


  const handleAIPricing = async () => {
    setAiSuggesting(true);
    // Simulate AI pricing recommendation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock AI logic based on genre and capacity
    let suggestedPrice = 0.05;
    
    switch (formData.genre) {
      case 'Music':
        suggestedPrice = formData.maxTickets > 80 ? 0.06 : 0.04;
        break;
      case 'Conference':
        suggestedPrice = formData.maxTickets > 80 ? 0.10 : 0.08;
        break;
      case 'Art':
        suggestedPrice = formData.maxTickets > 50 ? 0.05 : 0.03;
        break;
      case 'Comedy':
        suggestedPrice = 0.02;
        break;
      case 'Food':
        suggestedPrice = 0.04;
        break;
      default:
        suggestedPrice = 0.05;
    }
    
    setFormData(prev => ({ ...prev, price: suggestedPrice.toString() }));
    setAiSuggesting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormError('');
    setDateTimeError('');

    if (!walletAddress) {
      setFormError('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.date || !formData.time || !formData.location || !formData.price) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    // Validate date/time before submission
    const dateTimeValidationError = validateDateTime(formData.date, formData.time);
    if (dateTimeValidationError) {
      setDateTimeError(dateTimeValidationError);
      setFormError('Cannot create event with past date/time. Please select a current or future date/time.');
      return;
    }

    setCreating(true);
    try {
      await contractFunctions.createEvent({
        name: formData.name,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        city: formData.city,
        genre: formData.genre,
        maxTickets: formData.maxTickets,
        price: formData.price,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        description: formData.description
      });

      // Show success message
      setCreatedEventName(formData.name);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        date: '',
        time: '',
        location: '',
        city: '',
        genre: 'Music',
        maxTickets: 1000,
        price: '',
        imageUrl: '',
        description: '',
      });
      setDateTimeError('');
      setFormError('');
    } catch (error: any) {
      console.error('Error creating event:', error);
      setFormError(error.message || 'Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center shadow-lg">
          <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-card-foreground font-bold text-xl mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to create events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Confirmation Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-white font-bold text-2xl">Event Created Successfully!</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-card-foreground text-center">
                <span className="font-semibold">"{createdEventName}"</span> has been successfully created and is now live on the platform.
              </p>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-card-foreground text-sm mb-2">Next Steps:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Your event is now visible to all users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Ticket sales will begin immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Track performance in the Organizer Dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                    <span>Monitor sales and withdraw funds anytime</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setCreatedEventName('');
                  }}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Create Another Event
                </button>
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setCreatedEventName('');
                    onBack();
                  }}
                  className="flex-1 bg-muted text-card-foreground py-3 rounded-lg hover:bg-accent transition-colors font-semibold border border-gray-200 dark:border-gray-700"
                >
                  View All Events
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Events
      </button>

      {/* Page Header - Typography Fix */}
      <div className="text-center space-y-2">
        <h1 className="text-foreground font-black text-3xl">Admin Panel</h1>
        <p className="text-muted-foreground text-lg">Create and manage events</p>
      </div>

      {/* Create Event Form - Card Container */}
      <div className="bg-card rounded-xl shadow-card border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Section - Visual Hierarchy */}
        <div className="bg-muted border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-card-foreground font-bold text-xl">Create New Event</h2>
              <p className="text-muted-foreground text-sm">Fill in the details below to create a new event</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Top-level Form Error */}
        {formError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 text-sm font-medium">
              ⚠️ {formError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Name - Input Field Fix */}
          <div className="md:col-span-2">
            <label className="block text-muted-foreground font-semibold text-sm mb-2">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Summer Music Festival 2025"
              className="w-full bg-input border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              required
            />
          </div>

            {/* Date */}
            <div>
              <label className="block text-muted-foreground font-semibold text-sm mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getCurrentDateTime().date}
                className={`w-full bg-input border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm ${
                  dateTimeError && formData.date ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
                required
              />
              {dateTimeError && formData.date && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {dateTimeError}
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-muted-foreground font-semibold text-sm mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                min={formData.date === getCurrentDateTime().date ? getCurrentDateTime().time : undefined}
                className={`w-full bg-input border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm ${
                  dateTimeError && formData.time ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
                required
              />
              {dateTimeError && formData.time && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {dateTimeError}
                </p>
              )}
            </div>

          {/* Genre */}
          <div>
            <label className="block text-muted-foreground font-semibold text-sm mb-2">Genre</label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full bg-input border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
            >
              <option value="Music">Music</option>
              <option value="Conference">Conference</option>
              <option value="Art">Art</option>
              <option value="Comedy">Comedy</option>
              <option value="Food">Food</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-muted-foreground font-semibold text-sm mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Central Park, New York"
              className="w-full bg-input border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-muted-foreground font-semibold text-sm mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
              className="w-full bg-input border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
            />
          </div>

          {/* Max Tickets */}
          <div>
            <label className="block text-muted-foreground font-semibold text-sm mb-2">
              Max Tickets
              <span className="text-muted-foreground font-normal text-xs ml-2">(1-1000)</span>
            </label>
            <input
              type="number"
              name="maxTickets"
              value={formData.maxTickets}
              onChange={handleChange}
              min="1"
              max="1000"
              className="w-full bg-input border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-muted-foreground font-semibold text-sm mb-2">
              Price (ETH) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.05"
                step="0.001"
                min="0"
                className="flex-1 bg-input border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
                required
              />
              <button
                type="button"
                onClick={handleAIPricing}
                disabled={aiSuggesting}
                className="bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                title="AI Pricing Suggestion"
              >
                {aiSuggesting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Image URL Input */}
          <div className="md:col-span-2">
            <label className="block text-muted-foreground font-semibold text-sm mb-2">
              Image URL (optional)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-input border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              />
            </div>
            {formData.imageUrl && (
              <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-muted">
                 <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>

          {/* Event Description */}
          <div className="md:col-span-2">
            <label className="block text-muted-foreground font-semibold text-sm mb-2">Event Description (optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event, what attendees can expect, special features, etc."
              rows={4}
              className="w-full bg-input border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm resize-none"
            />
          </div>
        </div>

        {/* AI Pricing Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-card-foreground">
              <strong className="text-card-foreground">AI Pricing Assistant:</strong> Click the sparkle button to get an AI-powered pricing recommendation based on your event genre, capacity, and market trends.
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={creating}
          className="w-full bg-primary text-white py-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-bold text-lg shadow-lg"
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Event...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Event
            </>
          )}
        </button>

        {/* Note */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-card-foreground text-sm">
            <strong className="text-card-foreground">Note:</strong> Only the contract owner can create events. The event will be deployed to the blockchain and become visible to all users.
          </p>
        </div>
        </form>
      </div>
    </div>
  );
}
