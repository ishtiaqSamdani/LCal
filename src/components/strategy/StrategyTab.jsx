import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, ArrowRight, PiggyBank, Briefcase } from 'lucide-react';
import { calculateLoanSchedule } from '../../utils/loanMath';
import { usePersistentState } from '../../hooks/usePersistentState';

const StrategyTab = ({ totalLoanAmount, effectiveRate, loanTermYears, loanType, monthlyBudget }) => {
  // Strategy Inputs (Persistent)
  const [assetValue, setAssetValue] = usePersistentState('strategy_assetValue', 5000000);
  const [assetGrowthRate, setAssetGrowthRate] = usePersistentState('strategy_assetGrowthRate', 5.0);
  const [investmentReturnRate, setInvestmentReturnRate] = usePersistentState('strategy_investmentReturnRate', 12.0);
  
  // Custom Investment Inputs (Persistent)
  const [customMonthlyInv, setCustomMonthlyInv] = usePersistentState('strategy_customMonthlyInv', '');
  const [customLumpSum, setCustomLumpSum] = usePersistentState('strategy_customLumpSum', '');

  // Results State
  const [result, setResult] = useState(null);

  // Calculate Loan Data efficiently
  const loanData = useMemo(() => {
    if (!totalLoanAmount) return null;
    return calculateLoanSchedule(
        totalLoanAmount, 
        effectiveRate, 
        loanTermYears, 
        loanType, 
        new Date(), 
        monthlyBudget
    );
  }, [totalLoanAmount, effectiveRate, loanTermYears, loanType, monthlyBudget]);

  useEffect(() => {
    calculateStrategy();
  }, [assetValue, assetGrowthRate, investmentReturnRate, loanData, customMonthlyInv, customLumpSum]);

  const calculateStrategy = () => {
    if (!loanData || !totalLoanAmount) return;

    // 1. Scenario A: Borrow & Hold Asset
    const months = loanData.schedule.length;
    const years = months / 12;

    // Asset Appreciation Rate is ANNUAL
    // Formula: FV = P * (1 + r)^n where r is Annual Rate, n is Years
    const assetFV_A = assetValue * Math.pow(1 + (assetGrowthRate / 100), years);
    const netWorthA = assetFV_A; 

    // 2. Scenario B: Sell Asset, Pay Loan, Invest Surplus + EMIs
    
    // Max Available Limits
    const maxSurplus = Math.max(0, assetValue - totalLoanAmount);
    const maxMonthly = loanType === 'standard' 
        ? loanData.summary.monthlyPayment
        : monthlyBudget;

    // Effective Investment Amounts (User Custom or Default Max)
    const effectiveLumpSum = customLumpSum === '' 
        ? maxSurplus 
        : Math.min(parseFloat(customLumpSum) || 0, maxSurplus);

    const effectiveMonthly = customMonthlyInv === ''
        ? maxMonthly
        : Math.min(parseFloat(customMonthlyInv) || 0, maxMonthly);

    // FV of Surplus (Lump Sum Investment)
    // Investment Return Rate is ANNUAL
    const surplusFV = effectiveLumpSum * Math.pow(1 + (investmentReturnRate / 100), years);

    // FV of SIP (Series)
    // Investment Return Rate is ANNUAL, convert to Monthly for SIP
    const r_inv = (investmentReturnRate / 100) / 12;
    const sipFV = effectiveMonthly * ( (Math.pow(1 + r_inv, months) - 1) / r_inv ) * (1 + r_inv);

    const netWorthB = surplusFV + sipFV;

    // Also calculate what remains uninvested if user chooses less than max (Cash in hand?)
    // For Net Worth, Cash is Cash. It doesn't grow (0%). 
    // Let's add the uninvested cash to Net Worth B as raw cash.
    const uninvestedLumpSum = maxSurplus - effectiveLumpSum;
    const uninvestedMonthlyTotal = (maxMonthly - effectiveMonthly) * months;
    
    const totalNetWorthB = netWorthB + uninvestedLumpSum + uninvestedMonthlyTotal;

    setResult({
        scenarioA: {
            netWorth: netWorthA,
            assetFV: assetFV_A,
            totalPaid: loanData.summary.totalPayment
        },
        scenarioB: {
            netWorth: totalNetWorthB,
            surplusFV: surplusFV,
            sipFV: sipFV,
            investedLumpSum: effectiveLumpSum,
            investedMonthly: effectiveMonthly,
            cashInHand: uninvestedLumpSum + uninvestedMonthlyTotal
        },
        limits: {
            maxLumpSum: maxSurplus,
            maxMonthly: maxMonthly
        },
        difference: totalNetWorthB - netWorthA,
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
             {/* Market Assumptions */}
             <div>
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

            {/* Investment Allocation (New Section) */}
            <div className="pt-6 border-t border-gray-700">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    Investment Allocation
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                    Customize how much of the available liquidity you invest in Scenario B.
                </p>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-400">Custom Monthly SIP</label>
                            {result && (
                                <span className="text-xs text-blue-400">
                                    Max: {formatMoney(result.limits.maxMonthly)}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <PiggyBank className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                            <input
                                type="number"
                                placeholder={result ? `Max: ${result.limits.maxMonthly}` : "Enter amount"}
                                value={customMonthlyInv}
                                onChange={(e) => setCustomMonthlyInv(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-400">Custom Initial Investment</label>
                            {result && (
                                <span className="text-xs text-blue-400">
                                    Max: {formatMoney(result.limits.maxLumpSum)}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                            <input
                                type="number"
                                placeholder={result ? `Max: ${result.limits.maxLumpSum}` : "Enter amount"}
                                value={customLumpSum}
                                onChange={(e) => setCustomLumpSum(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                    </div>
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
                                {result.scenarioB.cashInHand > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        (+ {formatMoney(result.scenarioB.cashInHand)} held in cash)
                                    </p>
                                )}
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
