import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SERVICE_CATEGORIES } from '../../../shared/serviceCategories';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

interface CategorySelectorProps {
  onContinue: (selectedCategories: string[]) => void;
}

export default function CategorySelector({ onContinue }: CategorySelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleContinue = () => {
    if (selectedCategories.length > 0) {
      onContinue(selectedCategories);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Welcome to Nirala Estate
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            Your Community Services Marketplace
          </p>
          <p className="text-sm md:text-base text-gray-500">
            Select the services you're interested in to get started
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {SERVICE_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Card
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  selectedCategories.includes(category.id)
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                {selectedCategories.includes(category.id) && (
                  <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div className="p-6">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <div className="space-y-1">
                    {category.services.slice(0, 3).map(service => (
                      <p key={service.id} className="text-xs text-gray-500">
                        • {service.name}
                      </p>
                    ))}
                    {category.services.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{category.services.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={selectedCategories.length === 0}
            className="px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedCategories.length === 0
              ? 'Select at least one category'
              : `Continue with ${selectedCategories.length} ${
                  selectedCategories.length === 1 ? 'category' : 'categories'
                }`}
            {selectedCategories.length > 0 && (
              <ArrowRight className="ml-2 h-5 w-5" />
            )}
          </Button>
          {selectedCategories.length > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              You can always add or remove categories later
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
