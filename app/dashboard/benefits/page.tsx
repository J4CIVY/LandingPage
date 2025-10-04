'use client';

import { useState, useMemo } from 'react';
import { Benefit, CategoryType, BenefitFormData } from '@/types/benefits';
import { 
  categories, 
  benefitsMock, 
  usageHistoryMock,
  getBenefitsByCategory,
  getHistoryByUser 
} from '@/data/benefitsData';

// Components
import BenefitsHeader from '@/components/benefits/BenefitsHeader';
import CategoryTabs from '@/components/benefits/CategoryTabs';
import BenefitCard from '@/components/benefits/BenefitCard';
import BenefitModal from '@/components/benefits/BenefitModal';
import BenefitForm from '@/components/benefits/BenefitForm';
import UsageHistory from '@/components/benefits/UsageHistory';

const BenefitsPage = () => {
  // States for page management
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [benefitsData, setBenefitsData] = useState(benefitsMock);
  const [currentView, setCurrentView] = useState<'benefits' | 'history'>('benefits');
  const [isLoading, setIsLoading] = useState(false);

  // User and permissions simulation
  const isAdmin = true; // In a real app, this would come from auth context
  const userId = 'user123'; // In a real app, this would come from auth context

  // Benefits filtered by category
  const filteredBenefits = useMemo(() => {
    return getBenefitsByCategory(activeCategory);
  }, [activeCategory]);

  // User history
  const userHistory = useMemo(() => {
    return getHistoryByUser(userId);
  }, [userId]);

  // Handlers
  const handleCategoryChange = (category: CategoryType | 'all') => {
    setActiveCategory(category);
  };

  const handleViewDetails = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setDetailModalOpen(true);
  };

  const handleClaimBenefit = (benefit: Benefit) => {
    // In a real app, here would register the benefit usage
    
    // Simulate successful action
    alert(`Benefit claimed! Code: ${benefit.promoCode}`);
    
    // You could update history here if needed
    // setUserHistory(prev => [...prev, newRecord]);
  };

  const handleShareBenefit = (benefit: Benefit) => {
    // In a real app, here would implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: `BSK Benefit: ${benefit.name}`,
        text: `Check out this exclusive benefit for BSK members! ${benefit.briefDescription}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      const text = `BSK Benefit! ${benefit.name} - ${benefit.discount} at ${benefit.company}. Code: ${benefit.promoCode}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Benefit copied to clipboard!');
      });
    }
  };

  const handleAddBenefit = () => {
    setSelectedBenefit(null);
    setFormModalOpen(true);
  };

  const handleEditBenefit = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setFormModalOpen(true);
  };

  const handleSubmitBenefit = async (data: BenefitFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (selectedBenefit) {
        // Edit existing benefit
        const updatedBenefits = benefitsData.map(b => 
          b.id === selectedBenefit.id 
            ? { 
                ...b, 
                name: data.name,
                category: data.category,
                briefDescription: data.briefDescription,
                fullDescription: data.fullDescription,
                discount: data.discount,
                location: data.location,
                website: data.website,
                company: data.company,
                promoCode: data.promoCode,
                requirements: data.requirements,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: (new Date(data.endDate) > new Date() ? 'active' : 'expired') as 'active' | 'coming-soon' | 'expired',
                updatedAt: new Date(),
                // Only update image if new one is provided
                ...(data.image && { image: URL.createObjectURL(data.image) })
              } 
            : b
        );
        setBenefitsData(updatedBenefits);
        alert('Benefit updated successfully');
      } else {
        // Create new benefit
        const newBenefit: Benefit = {
          id: String(Date.now()),
          name: data.name,
          category: data.category,
          briefDescription: data.briefDescription,
          fullDescription: data.fullDescription,
          discount: data.discount,
          location: data.location,
          website: data.website,
          image: data.image ? URL.createObjectURL(data.image) : '/images/benefits/default.jpg',
          company: data.company,
          promoCode: data.promoCode,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          status: (new Date(data.endDate) > new Date() ? 'active' : 'expired') as 'active' | 'coming-soon' | 'expired',
          requirements: data.requirements,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setBenefitsData(prev => [newBenefit, ...prev]);
        alert('Benefit created successfully');
      }
      
      setFormModalOpen(false);
      setSelectedBenefit(null);
    } catch (error) {
      console.error('Error saving benefit:', error);
      alert('Error saving benefit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main header */}
        <BenefitsHeader 
          isAdmin={isAdmin}
          onAddBenefit={handleAddBenefit}
        />

        {/* Navigation between views */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setCurrentView('benefits')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              currentView === 'benefits'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Available Benefits
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              currentView === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            My History
          </button>
        </div>

        {/* Main content */}
        {currentView === 'benefits' ? (
          <>
            {/* Category filters */}
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />

            {/* Benefits grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBenefits.map((benefit) => (
                <BenefitCard
                  key={benefit.id}
                  benefit={benefit}
                  onViewDetails={handleViewDetails}
                  onClaimBenefit={handleClaimBenefit}
                />
              ))}
            </div>

            {/* Empty state */}
            {filteredBenefits.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🎁</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No benefits in this category
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Explore other categories or come back later to see new benefits.
                </p>
              </div>
            )}
          </>
        ) : (
          /* History view */
          <UsageHistory 
            history={userHistory}
            isLoading={false}
          />
        )}

        {/* Detail modal */}
        <BenefitModal
          benefit={selectedBenefit}
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedBenefit(null);
          }}
          onShare={handleShareBenefit}
        />

        {/* Form modal (admin only) */}
        {isAdmin && (
          <BenefitForm
            isOpen={formModalOpen}
            onClose={() => {
              setFormModalOpen(false);
              setSelectedBenefit(null);
            }}
            onSubmit={handleSubmitBenefit}
            benefit={selectedBenefit}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default BenefitsPage;