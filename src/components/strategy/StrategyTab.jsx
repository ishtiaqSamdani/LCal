import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { calculateLoanSchedule } from '../../utils/loanMath';
import { usePersistentState } from '../../hooks/usePersistentState';

const StrategyTab = ({ totalLoanAmount, effectiveRate, loanTermYears, loanType, monthlyBudget }) => {
  // Strategy Inputs (Persistent)
  const [assetValue, setAssetValue] = usePersistentState('strategy_assetValue', 5000000);
  const [assetGrowthRate, setAssetGrowthRate] = usePersistentState('strategy_assetGrowthRate', 5.0);
  const [investmentReturnRate, setInvestmentReturnRate] = usePersistentState('strategy_investmentReturnRate', 12.0);
  
  // Results State
  const [result, setResult] = useState(null);

  useEffect(() => {
    calculateStrategy();
  }, [assetValue, assetGrowthRate, investmentReturnRate, totalLoanAmount, effectiveRate, loanTermYears, loanType, monthlyBudget]);

  const calculateStrategy = () => {
    if (!totalLoanAmount) return;

    // 1. Scenario A: Borrow & Hold Asset
    // Future Value of Asset = P * (1 + r)^n
    // Loan Cost is calculated via the existing loan logic
    
    // Get Loan Details from our utility
    const loanData = calculateLoanSchedule(
        totalLoanAmount, 
        effectiveRate, 
        loanTermYears, 
        loanType, 
        new Date(), 
        monthlyBudget
    );
    
    // Determine actual duration in years (could be different from loanTermYears in Budget mode)
    const months = loanData.schedule.length;
    const years = months / 12;

    // Asset FV
    const assetFV_A = assetValue * Math.pow(1 + (assetGrowthRate / 100), years);
    
    // Net Worth A = Asset FV - Remaining Debt (Should be 0 at end of term)
    const netWorthA = assetFV_A; 


    // 2. Scenario B: Sell Asset, Pay Loan, Invest Surplus + EMIs
    // Sell Asset -> Pay Loan
    const surplus = assetValue - totalLoanAmount;
    
    // FV of Surplus (Lump Sum Investment)
    const surplusFV = surplus > 0 
        ? surplus * Math.pow(1 + (investmentReturnRate / 100), years)
        : 0; // If asset < loan, we have debt remaining, logic complicates, assume 0 for simplicity or handle debt

    // Invest the EMI savings
    // Monthly Investment = The EMI we WOULD have paid in Scenario A
    const monthlyInvestment = loanType === 'standard' 
        ? loanData.summary.monthlyPayment
        : monthlyBudget;

    // FV of SIP (Series)
    // FV = P * [ (1+r)^n - 1 ] / r * (1+r)  <-- SIP formula (start of period)
    const r_inv = (investmentReturnRate / 100) / 12;
    const sipFV = monthlyInvestment * ( (Math.pow(1 + r_inv, months) - 1) / r_inv ) * (1 + r_inv);

    const netWorthB = surplusFV + sipFV;

    setResult({
        scenarioA: {
            netWorth: netWorthA,
            assetFV: assetFV_A,
            totalPaid: loanData.summary.totalPayment
        },
        scenarioB: {
            netWorth: netWorthB,
            surplusFV: surplusFV,
            sipFV: sipFV
        },
        difference: netWorthB - netWorthA,
        duration: years.toFixed(1)
    });
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6 bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 h-fit">
             <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                Market Assumptions
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Current Asset Value</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <input
                            type="number"
                            value={assetValue}
                            onChange={(e) => setAssetValue(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Asset Appreciation Rate (%)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={assetGrowthRate}
                        onChange={(e) => setAssetGrowthRate(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Investment Return Rate (%)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={investmentReturnRate}
                        onChange={(e) => setInvestmentReturnRate(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">Return on SIPs/Funds (Scenario B)</p>
                </div>
            </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2 space-y-6">
            {result && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card A */}
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-blue-900/30 hover:border-blue-500/50 transition relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Scenario A: Borrow</h3>
                            <div className="space-y-2 text-sm text-gray-400">
                                <p>Keep Asset & Take Loan</p>
                                <p>Pay Loan over {result.duration} Years</p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <p className="text-xs text-gray-500 uppercase">Projected Net Worth</p>
                                <p className="text-2xl font-bold text-blue-400 mt-1">{formatMoney(result.scenarioA.netWorth)}</p>
                            </div>
                        </div>

                        {/* Card B */}
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-purple-900/30 hover:border-purple-500/50 transition relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Scenario B: Liquidity</h3>
                            <div className="space-y-2 text-sm text-gray-400">
                                <p>Sell Asset & Pay Cash</p>
                                <p>Invest Surplus & EMI Savings</p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-700">
                                <p className="text-xs text-gray-500 uppercase">Projected Net Worth</p>
                                <p className="text-2xl font-bold text-purple-400 mt-1">{formatMoney(result.scenarioB.netWorth)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison */}
                    <div className={`p-6 rounded-xl border ${result.difference > 0 ? 'bg-green-900/10 border-green-800/50' : 'bg-red-900/10 border-red-800/50'} flex items-center justify-between`}>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-200">Recommendation</h4>
                            <p className="text-sm text-gray-400 mt-1">
                                {result.difference > 0 
                                    ? "Scenario B (Selling) yields higher wealth." 
                                    : "Scenario A (Borrowing) yields higher wealth."}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-gray-500 uppercase">Net Difference</p>
                             <p className={`text-2xl font-bold ${result.difference > 0 ? 'text-green-400' : 'text-blue-400'}`}>
                                {formatMoney(Math.abs(result.difference))}
                             </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default StrategyTab;

