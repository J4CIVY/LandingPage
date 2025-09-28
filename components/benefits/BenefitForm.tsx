'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import { BenefitFormProps, CategoryType } from '@/types/benefits';

const BenefitForm: React.FC<BenefitFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  benefit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'workshops-mechanics' as CategoryType,
    briefDescription: '',
    fullDescription: '',
    discount: '',
    location: '',
    website: '',
    company: '',
    promoCode: '',
    startDate: '',
    endDate: '',
    requirements: [''],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Available categories
  const categories = [
    { id: 'workshops-mechanics', name: 'Workshops & Mechanics' },
    { id: 'accessories-parts', name: 'Accessories & Parts' },
    { id: 'restaurants-hotels', name: 'Restaurants & Hotels' },
    { id: 'insurance-finance', name: 'Insurance & Finance' },
    { id: 'health-wellness', name: 'Health & Wellness' },
    { id: 'others', name: 'Others' },
  ];

  // Load benefit data for editing
  useEffect(() => {
    if (benefit) {
      setFormData({
        name: benefit.name,
        category: benefit.category,
        briefDescription: benefit.briefDescription,
        fullDescription: benefit.fullDescription,
        discount: benefit.discount,
        location: benefit.location || '',
        website: benefit.website || '',
        company: benefit.company,
        promoCode: benefit.promoCode,
        startDate: new Date(benefit.startDate).toISOString().split('T')[0],
        endDate: new Date(benefit.endDate).toISOString().split('T')[0],
        requirements: benefit.requirements.length > 0 ? benefit.requirements : [''],
      });
      setImagePreview(benefit.image);
    } else {
      // Reset form for new benefit
      setFormData({
        name: '',
        category: 'workshops-mechanics',
        briefDescription: '',
        fullDescription: '',
        discount: '',
        location: '',
        website: '',
        company: '',
        promoCode: '',
        startDate: '',
        endDate: '',
        requirements: [''],
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [benefit]);

  // Close modal with ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle requirement changes
  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  // Add new requirement
  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  // Remove requirement
  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        requirements: newRequirements
      }));
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      requirements: formData.requirements.filter(req => req.trim() !== ''),
      image: imageFile
    };

    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
  <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 
           rounded-lg shadow-xl">
          
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {benefit ? 'Edit Benefit' : 'Add New Benefit'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Basic information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Benefit Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. Parts discount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. AutoParts Pro"
                />
              </div>
            </div>

            {/* Category and discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount *
                </label>
                <input
                  type="text"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. 15% OFF, $500 off"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brief Description *
              </label>
              <textarea
                name="briefDescription"
                value={formData.briefDescription}
                onChange={handleInputChange}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Short description to show in the card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Description *
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Detailed benefit description, terms and conditions..."
              />
            </div>

            {/* Location and website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Physical address of the establishment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Promo code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Promotional Code *
              </label>
              <input
                type="text"
                name="promoCode"
                value={formData.promoCode}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                placeholder="BSK2024MT15"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                             rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Benefit Image
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {imagePreview && (
                  <div className="w-32 h-32 relative rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requirements
              </label>
              <div className="space-y-2">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 
                               rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g. Show member card"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 
                                 rounded-lg"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 
                           hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                >
                  <FaPlus className="w-4 h-4" />
                  Add requirement
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
                         font-medium"
              >
                {isLoading 
                  ? 'Saving...' 
                  : benefit 
                    ? 'Update Benefit' 
                    : 'Create Benefit'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BenefitForm;