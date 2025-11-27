import React from 'react';

const Tabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8">
        <div className="bg-gray-800 p-1 rounded-xl inline-flex shadow-lg border border-gray-700">
            <button
                onClick={() => onTabChange('calculator')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'calculator'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Calculator
            </button>
            <button
                onClick={() => onTabChange('strategy')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'strategy'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Decision Strategy
            </button>
        </div>
    </div>
  );
};

export default Tabs;

