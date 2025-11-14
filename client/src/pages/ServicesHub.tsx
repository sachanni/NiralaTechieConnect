import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { SERVICE_CATEGORIES, COMMUNITY_FEATURES } from '../../../shared/serviceCategories';
import { ChevronRight, Settings, ArrowRight } from 'lucide-react';

export default function ServicesHub() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Community Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with neighbors offering services or find help in your community
          </p>
        </motion.div>

        {/* Manage My Services Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Manage Your Service Preferences
                  </h3>
                  <p className="text-sm text-gray-600">
                    Let neighbors know which services you offer or need
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setLocation('/my-services')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to My Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Service Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SERVICE_CATEGORIES.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card
                  onClick={() => setLocation(`/services/${category.id}`)}
                  className="p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    {category.services.length} services
                  </div>
                  <div className="flex items-center gap-1 text-sm text-blue-600 font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Browse</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Community Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMUNITY_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (0.05 * index) }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                  <div className="mt-3 text-xs text-gray-400">
                    Coming Soon
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
