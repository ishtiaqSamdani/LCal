import React from 'react';
import { Download, FileText } from 'lucide-react';

const AmortizationTable = ({ schedule, onDownload }) => {
  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center shrink-0">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Amortization Schedule
        </h3>
        <button 
          onClick={onDownload}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={schedule.length === 0}
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm relative">
          <thead className="bg-gray-900/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
            <tr>
              <th className="px-4 py-4 font-medium text-gray-400 whitespace-nowrap">Mo</th>
              <th className="px-4 py-4 font-medium text-gray-400 whitespace-nowrap">Phase</th>
              <th className="px-4 py-4 font-medium text-gray-400 whitespace-nowrap">Payment</th>
              <th className="px-4 py-4 font-medium text-gray-400 whitespace-nowrap">Interest</th>
              <th className="px-4 py-4 font-medium text-gray-400 whitespace-nowrap">Principal</th>
              <th className="px-4 py-4 font-medium text-gray-400 whitespace-nowrap">Balance</th>
              <th className="px-4 py-4 font-medium text-orange-400 whitespace-nowrap">Int. Debt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {schedule.length > 0 ? schedule.map((row) => (
              <tr key={row.month} className="hover:bg-gray-700/30 transition group">
                <td className="px-4 py-3 text-gray-300">{row.month}</td>
                <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium inline-block w-24 text-center ${
                        row.phase === 'Standard' ? 'bg-blue-900/30 text-blue-300 border border-blue-900/50' :
                        row.phase === 'Prin. Paydown' ? 'bg-green-900/30 text-green-300 border border-green-900/50' :
                        'bg-orange-900/30 text-orange-300 border border-orange-900/50'
                    }`}>
                        {row.phase}
                    </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-200">{formatMoney(row.payment)}</td>
                <td className="px-4 py-3 text-red-300/90">{formatMoney(row.interest)}</td>
                <td className="px-4 py-3 text-green-300/90">{formatMoney(row.principal)}</td>
                <td className="px-4 py-3 text-gray-400 font-mono">{formatMoney(row.balance)}</td>
                <td className="px-4 py-3 text-orange-300/90 font-medium">{formatMoney(row.accumulatedInterest)}</td>
              </tr>
            )) : (
                <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No schedule data available.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AmortizationTable;

