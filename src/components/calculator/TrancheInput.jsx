import React from 'react';
import { Plus, Trash2, IndianRupee, Percent } from 'lucide-react';

const TrancheInput = ({ tranches, setTranches }) => {
  const addTranche = () => {
    setTranches([...tranches, { amount: '', rate: '' }]);
  };

  const removeTranche = (index) => {
    if (tranches.length > 1) {
      const newTranches = tranches.filter((_, i) => i !== index);
      setTranches(newTranches);
    }
  };

  const updateTranche = (index, field, value) => {
    const newTranches = [...tranches];
    newTranches[index][field] = value;
    setTranches(newTranches);
  };

  const totalAmount = tranches.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  
  // Weighted Average Rate Calculation
  const weightedRate = totalAmount > 0 
    ? tranches.reduce((sum, t) => sum + ((parseFloat(t.amount) || 0) * (parseFloat(t.rate) || 0)), 0) / totalAmount
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-400">Loan Tranches</label>
        <span className="text-xs text-blue-400">
            Avg Rate: {weightedRate.toFixed(2)}%
        </span>
      </div>
      
      {tranches.map((tranche, index) => (
        <div key={index} className="flex gap-2 items-center">
            <div className="relative flex-1">
                <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                    type="number"
                    placeholder="Amount"
                    value={tranche.amount}
                    onChange={(e) => updateTranche(index, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>
            <div className="relative w-24">
                <Percent className="absolute left-2 top-2.5 w-3 h-3 text-gray-500" />
                <input
                    type="number"
                    placeholder="Rate"
                    title="Annual Rate %"
                    step="0.1"
                    value={tranche.rate}
                    onChange={(e) => updateTranche(index, 'rate', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-7 pr-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>
            <button 
                onClick={() => removeTranche(index)}
                className={`p-2 rounded-lg transition ${tranches.length === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-red-400 hover:bg-red-900/30'}`}
                disabled={tranches.length === 1}
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      ))}

      <button
        onClick={addTranche}
        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition"
      >
        <Plus className="w-4 h-4" /> Add Tranche
      </button>

      <div className="pt-2 border-t border-gray-700 flex justify-between text-sm">
        <span className="text-gray-400">Total Principal:</span>
        <span className="text-gray-200 font-medium">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmount)}
        </span>
      </div>
    </div>
  );
};

export default TrancheInput;

