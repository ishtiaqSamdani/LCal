import React from 'react';
import { Clock } from 'lucide-react';

const LoanSummary = ({ summary, loanType }) => {
  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <p className="text-xs text-gray-400 uppercase tracking-wider">
            {loanType === 'standard' ? 'Monthly Payment' : 'Fixed Payment'}
        </p>
        <p className="text-xl font-bold text-green-400 mt-1">
          {formatMoney(summary.monthlyPayment)}
        </p>
      </div>
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Total Duration</p>
        <p className="text-xl font-bold text-yellow-400 mt-1 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {summary.totalDuration || '0 Months'}
        </p>
      </div>
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Total Interest</p>
        <p className="text-xl font-bold text-blue-400 mt-1">
          {formatMoney(summary.totalInterest)}
        </p>
      </div>
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Total Cost</p>
        <p className="text-xl font-bold text-purple-400 mt-1">
          {formatMoney(summary.totalPayment)}
        </p>
      </div>
    </div>
  );
};

export default LoanSummary;

