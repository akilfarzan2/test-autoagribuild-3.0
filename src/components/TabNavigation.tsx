import React from 'react';
import { Archive, Clock } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'active' | 'archived';
  onTabChange: (tab: 'active' | 'archived') => void;
  activeCounts: { active: number; archived: number };
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, activeCounts }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => onTabChange('active')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Active Job Cards
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
              activeTab === 'active' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {activeCounts.active}
            </span>
          </button>
          
          <button
            onClick={() => onTabChange('archived')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'archived'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Archive className="w-4 h-4 mr-2" />
            Archived Job Cards
            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
              activeTab === 'archived' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {activeCounts.archived}
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;