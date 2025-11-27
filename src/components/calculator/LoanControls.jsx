import React from 'react';
import { RefreshCw, Calendar, Wallet } from 'lucide-react';
import TrancheInput from './TrancheInput';

const LoanControls = ({ 
    tranches, 
    setTranches, 
    loanTermYears, 
    setLoanTermYears, 
    startDate, 
    setStartDate, 
    loanType, 
    setLoanType, 
    monthlyBudget, 
    setMonthlyBudget 
}) => {
  return (
    <div className="lg:col-span-1 space-y-6 bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 h-fit">
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5 text-gray-400" />
        Loan Parameters
      </h2>

      <div className="space-y-5">
        {/* Multi-Tranche Input */}
        <TrancheInput tranches={tranches} setTranches={setTranches} />

        {/* Loan Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Amortization Type</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-700 rounded-lg">
            <button
              onClick={() => setLoanType('standard')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition ${
                loanType === 'standard' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setLoanType('principalFirst')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition ${
                loanType === 'principalFirst' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Principal First
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            {loanType === 'standard' 
              ? 'Fixed monthly payments. Interest decreases over time (Standard Annuity).' 
              : 'Pay 100% principal first. Interest accumulates and is paid after principal is cleared.'}
          </p>
        </div>

        {/* Conditional Inputs */}
        {loanType === 'standard' ? (
           <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Loan Term (Years)</label>
              <input
                type="number"
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
           </div>
        ) : (
           <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Payment Budget</label>
              <div className="relative">
                  <Wallet className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                  <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
              </div>
              <p className="text-xs text-gray-500 mt-1">Amount you commit to pay every month.</p>
           </div>
        )}

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoanControls;

