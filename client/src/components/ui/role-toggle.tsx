import { motion } from 'framer-motion';

export type RoleFilter = 'all' | 'providers' | 'seekers';

interface RoleToggleProps {
  activeFilter: RoleFilter;
  onChange: (filter: RoleFilter) => void;
}

export function RoleToggle({ activeFilter, onChange }: RoleToggleProps) {
  const filters: { value: RoleFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '👥' },
    { value: 'providers', label: 'Providers', icon: '✨' },
    { value: 'seekers', label: 'Seekers', icon: '🔍' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-full w-fit mx-auto">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeFilter === filter.value
              ? 'text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {activeFilter === filter.value && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 bg-blue-600 rounded-full"
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
