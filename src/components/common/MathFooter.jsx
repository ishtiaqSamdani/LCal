import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Calculator } from 'lucide-react';

const MathFooter = ({ currentLoanAmount, currentRate, currentBudget, loanType, assetValue, growthRate, returnRate }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ensure we have valid numbers for the examples, falling back to defaults if inputs are cleared
  const P = currentLoanAmount || 100000;
  // currentRate is Annual Rate % (e.g., 5.5)
  const ratePercent = currentRate || 12; 
  // Convert to Monthly Rate Decimal
  const r = ratePercent / 12 / 100; 
  const budget = currentBudget || 10000;
  
  // Strategy Defaults (Live if provided, else hardcoded for demo)
  const AV = assetValue || 5000000;
  const GR = growthRate || 5;
  const RR = returnRate || 12;

  const formatMoney = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // --- Standard Calc for Example ---
  const n = 12;
  const emiNumerator = P * r * Math.pow(1 + r, n);
  const emiDenominator = Math.pow(1 + r, n) - 1;
  const emi = emiDenominator !== 0 ? emiNumerator / emiDenominator : 0;
  
  const stdInterest = P * r;
  const stdPrincipal = emi - stdInterest;
  const stdBalance = P - stdPrincipal;

  // --- Principal First Calc for Example ---
  const pfPayment = budget;
  const pfDeferredInterest = P * r;
  const pfPrincipalPaid = Math.min(budget, P);
  const pfBalance = P - pfPrincipalPaid;
  const pfAccumulatedInterest = pfDeferredInterest;

  // --- Strategy Calc for Example (Scenario A) ---
  const years = 10;
  const fvAsset = AV * Math.pow(1 + GR/100, years);
  const netWorthA = fvAsset; 

  // --- Strategy Calc for Example (Scenario B) ---
  const surplus = AV - P;
  const fvSurplus = surplus > 0 ? surplus * Math.pow(1 + RR/100, years) : 0;
  
  // For the example, we need a Monthly Investment amount.
  // In the real calculation, this comes from (Standard EMI) or (Budget).
  // Let's use the Standard EMI for the full loan term (which we don't have exactly here, so we estimate).
  // To make the example match the main calculation logic, let's estimate a 10-year EMI for the example.
  const n_months_ex = years * 12;
  const emi_ex_num = P * r * Math.pow(1 + r, n_months_ex);
  const emi_ex_den = Math.pow(1 + r, n_months_ex) - 1;
  const monthlyInvest = emi_ex_den !== 0 ? emi_ex_num / emi_ex_den : 0;
  
  const r_inv = (RR / 100) / 12;
  const fvSIP = monthlyInvest * ( (Math.pow(1 + r_inv, n_months_ex) - 1) / r_inv ) * (1 + r_inv);
  
  const netWorthB = fvSurplus + fvSIP;

  return (
    <div className="mt-12 border-t border-gray-800 pt-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition mb-4 mx-auto group"
      >
        <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">How the Math Works (Live Examples)</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Standard Amortization Column */}
            <div className={`space-y-6 ${loanType !== 'standard' ? 'opacity-50' : ''}`}>
                <div className="border-b border-gray-700 pb-2">
                    <h4 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                        1. Standard Amortization
                        <span className="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded-full border border-blue-800">Annuity</span>
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">Calculates a fixed "EMI" so you pay off the loan exactly on time.</p>
                </div>

                {/* Formula Block */}
                <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-300 border-l-2 border-blue-500">
                    <div className="mb-2 text-xs text-gray-500 uppercase tracking-wider">Formula</div>
                    EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ - 1)
                </div>

                {/* Example Scenario */}
                <div className="bg-blue-900/10 rounded-lg p-5 border border-blue-900/30">
                    <h5 className="text-sm font-semibold text-blue-200 mb-3 flex items-center gap-2">
                        <Calculator className="w-3 h-3" /> Live Example (Using Your Numbers)
                    </h5>
                    <p className="text-sm text-gray-300 mb-2">
                        Loan: <strong className="text-white">{formatMoney(P)}</strong> | Rate: <strong className="text-white">{ratePercent}%</strong> ({(r*100).toFixed(2)}%/mo)
                    </p>
                    
                    <div className="space-y-3 mt-4 text-sm">
                        <div>
                            <p className="text-gray-400 text-xs uppercase mb-1">Step 1: Monthly Interest</p>
                            <p className="font-mono text-blue-300">
                                {formatMoney(P)} × {(r).toFixed(4)} = <span className="text-red-300">{formatMoney(stdInterest)}</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase mb-1">Step 2: Calculate EMI (for 12mo term ex)</p>
                            <p className="font-mono text-gray-300">
                                EMI ≈ <span className="text-green-400 font-bold">{formatMoney(emi)}</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase mb-1">Step 3: Month 1 Split</p>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                <li>You Pay: <span className="text-white">{formatMoney(emi)}</span></li>
                                <li>Interest Takes: <span className="text-red-300">-{formatMoney(stdInterest)}</span></li>
                                <li>Principal Gets: <span className="text-green-300">{formatMoney(stdPrincipal)}</span></li>
                                <li>New Balance: {formatMoney(P)} - {formatMoney(stdPrincipal)} = <strong>{formatMoney(stdBalance)}</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

             {/* Principal First Column */}
             <div className={`space-y-6 ${loanType === 'standard' ? 'opacity-50' : ''}`}>
                <div className="border-b border-gray-700 pb-2">
                    <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                        2. Principal First
                        <span className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full border border-purple-800">Deferred Interest</span>
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">You pay a fixed budget. 100% reduces principal. Interest is added to a separate debt pile.</p>
                </div>

                {/* Formula Block */}
                <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-300 border-l-2 border-purple-500">
                    <div className="mb-2 text-xs text-gray-500 uppercase tracking-wider">Logic</div>
                    1. Pay Budget -> Reduces Principal<br/>
                    2. Calculate Interest -> Add to Debt Bucket
                </div>

                {/* Example Scenario */}
                <div className="bg-purple-900/10 rounded-lg p-5 border border-purple-900/30">
                    <h5 className="text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
                        <Calculator className="w-3 h-3" /> Live Example (Using Your Numbers)
                    </h5>
                    <p className="text-sm text-gray-300 mb-2">
                         Loan: <strong className="text-white">{formatMoney(P)}</strong> | Budget: <strong className="text-white">{formatMoney(budget)}</strong>
                    </p>
                    
                    <div className="space-y-3 mt-4 text-sm">
                        <div>
                            <p className="text-gray-400 text-xs uppercase mb-1">Step 1: Your Payment</p>
                            <p className="text-gray-300">
                                You pay <strong>{formatMoney(pfPayment)}</strong>. <span className="text-green-300">100% goes to Principal.</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase mb-1">Step 2: Deferred Interest</p>
                            <p className="font-mono text-gray-300">
                                Interest = {formatMoney(P)} × {(r).toFixed(4)} = <span className="text-orange-300">{formatMoney(pfDeferredInterest)}</span>
                            </p>
                            <p className="text-xs text-orange-400/80 mt-1">This is NOT paid yet. It's added to a debt bucket.</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs uppercase mb-1">Step 3: End of Month 1</p>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                <li>New Principal = {formatMoney(P)} - {formatMoney(pfPrincipalPaid)} = <strong className="text-white">{formatMoney(pfBalance)}</strong></li>
                                <li>Interest Debt = <strong className="text-orange-300">{formatMoney(pfAccumulatedInterest)}</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategy Math Row */}
            <div className="md:col-span-2 space-y-6 border-t border-gray-700 pt-8">
                <div className="border-b border-gray-700 pb-2">
                    <h4 className="text-lg font-semibold text-green-300">3. Decision Strategy (Buy vs Borrow)</h4>
                    <p className="text-sm text-gray-400 mt-1">Comparing your projected Net Worth after <strong className="text-white">10 Years</strong> (Example Term).</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-green-900/10 rounded-lg p-5 border border-green-900/30">
                        <h5 className="text-sm font-semibold text-green-200 mb-3 flex items-center gap-2">
                            <Calculator className="w-3 h-3" /> Scenario A: Keep Asset
                        </h5>
                        <p className="text-sm text-gray-300 mb-2">
                           You take the loan and keep the asset. It grows at {GR}%.
                        </p>
                        <div className="font-mono text-sm text-gray-300 mb-3 bg-gray-900 p-2 rounded">
                            Net Worth = Future Value of Asset
                        </div>
                        <div className="space-y-2 text-sm border-t border-green-800/30 pt-3 mt-2">
                            <p className="text-gray-400 text-xs uppercase">Calculation</p>
                            <p className="text-gray-300">
                                {formatMoney(AV)} × (1 + {GR/100})¹⁰
                            </p>
                            <p className="text-green-300 font-bold">
                                = {formatMoney(netWorthA)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-green-900/10 rounded-lg p-5 border border-green-900/30">
                        <h5 className="text-sm font-semibold text-green-200 mb-3">Scenario B: Sell & Invest</h5>
                        <p className="text-sm text-gray-300 mb-2">
                           Sell asset ({formatMoney(AV)}), pay loan ({formatMoney(P)}).
                           <br/>Surplus = <strong>{formatMoney(surplus)}</strong>
                           <br/>Invest Surplus + Monthly Savings ({formatMoney(monthlyInvest)}).
                        </p>
                        <div className="font-mono text-sm text-gray-300 mb-3 bg-gray-900 p-2 rounded">
                            Net Worth = FV(Surplus) + FV(EMI SIP)
                        </div>
                        <div className="space-y-2 text-sm border-t border-green-800/30 pt-3 mt-2">
                            <p className="text-gray-400 text-xs uppercase">Calculation Breakdown (10 Yrs @ {RR}%)</p>
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                <li>Surplus Growth: {formatMoney(surplus)} → <strong>{formatMoney(fvSurplus)}</strong></li>
                                <li>SIP Growth: {formatMoney(monthlyInvest)}/mo → <strong>{formatMoney(fvSIP)}</strong></li>
                            </ul>
                            <p className="text-green-300 font-bold mt-2 border-t border-green-800/30 pt-2">
                                Total = {formatMoney(netWorthB)}
                            </p>
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
