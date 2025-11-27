import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import LoanControls from './components/calculator/LoanControls';
import LoanSummary from './components/calculator/LoanSummary';
import AmortizationTable from './components/calculator/AmortizationTable';
import StrategyTab from './components/strategy/StrategyTab';
import MathFooter from './components/common/MathFooter';
import Tabs from './components/common/Tabs';
import { calculateWeightedAverageRate, calculateLoanSchedule, generateCSV } from './utils/loanMath';
import { usePersistentState } from './hooks/usePersistentState';

const App = () => {
  // Global State
  const [activeTab, setActiveTab] = usePersistentState('activeTab', 'calculator');

  // Loan State (Persistent)
  const [tranches, setTranches] = usePersistentState('tranches', [{ amount: 100000, rate: 5.0 }]);
  const [loanTermYears, setLoanTermYears] = usePersistentState('loanTermYears', 30);
  const [loanType, setLoanType] = usePersistentState('loanType', 'standard'); 
  const [monthlyBudget, setMonthlyBudget] = usePersistentState('monthlyBudget', 2000);
  const [startDate, setStartDate] = usePersistentState('startDate', new Date().toISOString().split('T')[0]);

  // Computed State
  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState({ monthlyPayment: 0, totalInterest: 0, totalPayment: 0, totalDuration: '' });
  
  // Derived Values
  const totalLoanAmount = tranches.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const effectiveRate = calculateWeightedAverageRate(tranches);

  // Calculation Effect
  useEffect(() => {
    const { schedule: newSchedule, summary: newSummary } = calculateLoanSchedule(
        totalLoanAmount,
        effectiveRate,
        loanTermYears,
        loanType,
        startDate,
        monthlyBudget
    );
    setSchedule(newSchedule);
    setSummary(newSummary);
  }, [tranches, totalLoanAmount, effectiveRate, loanTermYears, loanType, startDate, monthlyBudget]);

  // Handlers
  const handleDownload = () => {
    const csvContent = generateCSV(
        schedule, 
        summary, 
        loanType, 
        totalLoanAmount, 
        effectiveRate, 
        loanTermYears, 
        monthlyBudget
    );
    
    // Generate dynamic filename based on inputs
    let filename = '';
    
    if (loanType === 'standard') {
        filename = `StandardLoan_${totalLoanAmount}_${effectiveRate.toFixed(1)}pc_${loanTermYears}yr`;
    } else {
        filename = `PrincipalFirst_${totalLoanAmount}_${effectiveRate.toFixed(1)}pc_Budget${monthlyBudget}`;
    }
    
    // Sanitize filename (remove potential issues) and add date
    filename = filename.replace(/[^\w\d_\-]/g, '') + `_${new Date().toISOString().split('T')[0]}.csv`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 lg:p-12 font-sans flex justify-center">
      <div className="w-full max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600/20 p-3 rounded-2xl">
                <Calculator className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Financial Decision Engine
            </h1>
          </div>
          <p className="text-gray-400">Analyze loans, optimize repayment, and strategize wealth.</p>
        </div>

        {/* Navigation */}
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <div className="animate-in fade-in duration-500 w-full">
            {activeTab === 'calculator' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                    {/* Left Column: Controls */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <LoanControls 
                            tranches={tranches}
                            setTranches={setTranches}
                            loanTermYears={loanTermYears}
                            setLoanTermYears={setLoanTermYears}
                            startDate={startDate}
                            setStartDate={setStartDate}
                            loanType={loanType}
                            setLoanType={setLoanType}
                            monthlyBudget={monthlyBudget}
                            setMonthlyBudget={setMonthlyBudget}
                        />
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        <LoanSummary summary={summary} loanType={loanType} />
                        <AmortizationTable schedule={schedule} onDownload={handleDownload} />
                    </div>
                </div>
            ) : (
                <StrategyTab 
                    totalLoanAmount={totalLoanAmount}
                    effectiveRate={effectiveRate}
                    loanTermYears={loanTermYears}
                    loanType={loanType}
                    monthlyBudget={monthlyBudget}
                />
            )}
        </div>

        {/* Educational Footer */}
        <MathFooter 
            currentLoanAmount={totalLoanAmount} 
            currentRate={effectiveRate} 
            currentBudget={monthlyBudget}
            loanType={loanType}
            // For now, we'll use default values for the footer example if the state isn't fully lifted
            // Ideally, lift the StrategyTab state to App to pass live values here
            assetValue={5000000} 
            growthRate={5}
            returnRate={12}
        />

      </div>
    </div>
  );
};

export default App;
