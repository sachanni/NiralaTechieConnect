import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SERVICE_CATEGORIES, ROLE_TYPES, type RoleType } from '../../../shared/serviceCategories';
import { motion } from 'framer-motion';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface RoleSelectorProps {
  selectedCategories: string[];
  categoryRoles: Record<string, RoleType[]>;
  onChange: (categoryRoles: Record<string, RoleType[]>) => void;
}

export default function RoleSelector({ selectedCategories, categoryRoles, onChange }: RoleSelectorProps) {
  const [roles, setRoles] = useState<Record<string, RoleType[]>>(categoryRoles);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialRoles: Record<string, RoleType[]> = {};
    const initialExpanded: Record<string, boolean> = {};
    selectedCategories.forEach(catId => {
      initialRoles[catId] = categoryRoles[catId] || [];
      initialExpanded[catId] = true; // Expand first category by default
    });
    setRoles(initialRoles);
    setExpandedCategories(initialExpanded);
  }, [selectedCategories, categoryRoles]);

  const toggleRole = (categoryId: string, role: RoleType) => {
    const currentRoles = roles[categoryId] || [];
    const updatedRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    const newRoles = {
      ...roles,
      [categoryId]: updatedRoles,
    };
    
    setRoles(newRoles);
    onChange(newRoles);
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Select specific services you can offer or need
            </p>
            <p className="text-xs text-blue-700">
              Check the boxes for services you can provide (✨ Provider) or services you're looking for (🔍 Seeker)
            </p>
          </div>
        </div>
      </div>

      {selectedCategories.map((catId, index) => {
        const category = SERVICE_CATEGORIES.find(c => c.id === catId);
        if (!category) return null;

        const currentRoles = roles[catId] || [];
        const isProvider = currentRoles.includes(ROLE_TYPES.PROVIDER);
        const isSeeker = currentRoles.includes(ROLE_TYPES.SEEKER);
        const isExpanded = expandedCategories[catId];

        return (
          <motion.div
            key={catId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            <Card className="overflow-hidden">
              {/* Category Header */}
              <div
                onClick={() => toggleExpanded(catId)}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <div className="flex gap-1">
                      {isProvider && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                          ✨ Provider
                        </Badge>
                      )}
                      {isSeeker && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                          🔍 Seeker
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {/* Expanded Service Selection */}
              {isExpanded && (
                <div className="border-t bg-gray-50 p-4 space-y-4">
                  {/* Provider Section */}
                  <div>
                    <div
                      onClick={() => toggleRole(catId, ROLE_TYPES.PROVIDER)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all mb-3 ${
                        isProvider
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-400 bg-white'
                      }`}
                    >
                      <Checkbox
                        id={`${catId}-provider`}
                        checked={isProvider}
                        onCheckedChange={() => toggleRole(catId, ROLE_TYPES.PROVIDER)}
                        className="pointer-events-none"
                      />
                      <Label
                        htmlFor={`${catId}-provider`}
                        className="flex-1 cursor-pointer font-semibold text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-green-600">✨</span>
                          <span>I can offer these services</span>
                        </span>
                      </Label>
                    </div>

                    {isProvider && (
                      <div className="ml-6 space-y-2 bg-white p-3 rounded-lg border border-green-200">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Select services you can provide:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {category.services.map((service) => (
                            <div
                              key={service.id}
                              className="flex items-start gap-2 p-2 rounded hover:bg-green-50 transition-colors"
                            >
                              <Checkbox
                                id={`${catId}-provider-${service.id}`}
                                className="mt-0.5"
                              />
                              <Label
                                htmlFor={`${catId}-provider-${service.id}`}
                                className="cursor-pointer flex-1"
                              >
                                <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                <div className="text-xs text-gray-500">{service.description}</div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seeker Section */}
                  <div>
                    <div
                      onClick={() => toggleRole(catId, ROLE_TYPES.SEEKER)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all mb-3 ${
                        isSeeker
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400 bg-white'
                      }`}
                    >
                      <Checkbox
                        id={`${catId}-seeker`}
                        checked={isSeeker}
                        onCheckedChange={() => toggleRole(catId, ROLE_TYPES.SEEKER)}
                        className="pointer-events-none"
                      />
                      <Label
                        htmlFor={`${catId}-seeker`}
                        className="flex-1 cursor-pointer font-semibold text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-blue-600">🔍</span>
                          <span>I need these services</span>
                        </span>
                      </Label>
                    </div>

                    {isSeeker && (
                      <div className="ml-6 space-y-2 bg-white p-3 rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Select services you're looking for:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {category.services.map((service) => (
                            <div
                              key={service.id}
                              className="flex items-start gap-2 p-2 rounded hover:bg-blue-50 transition-colors"
                            >
                              <Checkbox
                                id={`${catId}-seeker-${service.id}`}
                                className="mt-0.5"
                              />
                              <Label
                                htmlFor={`${catId}-seeker-${service.id}`}
                                className="cursor-pointer flex-1"
                              >
                                <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                <div className="text-xs text-gray-500">{service.description}</div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
