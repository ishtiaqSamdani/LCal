import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const MathFooter = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-12 border-t border-gray-800 pt-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition mb-4 mx-auto"
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-sm font-medium">How the Math Works</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            
            {/* Standard Math */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-blue-300 border-b border-gray-700 pb-2">Standard Amortization</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                    Calculates a fixed monthly payment (EMI) that pays off the loan exactly over the term.
                </p>
                <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-300 overflow-x-auto">
                    <div className="mb-2 text-xs text-gray-500">// Formula</div>
                    E = P × r × (1 + r)ⁿ / ((1 + r)ⁿ - 1)
                </div>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li><strong className="text-gray-300">P</strong>: Principal Amount</li>
                    <li><strong className="text-gray-300">r</strong>: Monthly Interest Rate (Annual% / 12)</li>
                    <li><strong className="text-gray-300">n</strong>: Total Months</li>
                </ul>
            </div>

             {/* Principal First Math */}
             <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-300 border-b border-gray-700 pb-2">Principal First (Deferred)</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                    Prioritizes paying down the principal balance. Interest is calculated but deferred (added to a debt bucket) until principal is zero.
                </p>
                <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-300 overflow-x-auto">
                    <div className="mb-2 text-xs text-gray-500">// Loop Logic</div>
                    Payment = Fixed_Budget<br/>
                    Principal_Paid = Payment<br/>
                    Interest_Debt += Balance × r
                </div>
                <p className="text-xs text-gray-500">
                    *Once Balance is 0, payments go towards Interest_Debt.
                </p>
            </div>

            {/* Future Value Math */}
            <div className="md:col-span-2 space-y-4 border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-green-300">Decision Strategy Math</h4>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Compound Interest (Lump Sum)</p>
                        <div className="bg-gray-900 p-3 rounded border-l-2 border-green-500 font-mono text-sm text-gray-300">
                            FV = PV × (1 + r)ⁿ
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Future Value of SIP (Series)</p>
                        <div className="bg-gray-900 p-3 rounded border-l-2 border-green-500 font-mono text-sm text-gray-300">
                            FV = P × [ (1+r)ⁿ - 1 ] / r × (1+r)
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MathFooter;

