import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import LoanControls from './components/calculator/LoanControls';
import LoanSummary from './components/calculator/LoanSummary';
import AmortizationTable from './components/calculator/AmortizationTable';
import StrategyTab from './components/strategy/StrategyTab';
import MathFooter from './components/common/MathFooter';
import Tabs from './components/common/Tabs';
import { calculateWeightedAverageRate, calculateLoanSchedule, generateCSV } from './utils/loanMath';

const App = () => {
  // Global State
  const [activeTab, setActiveTab] = useState('calculator');

  // Loan State
  const [tranches, setTranches] = useState([{ amount: 100000, rate: 5.0 }]);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [loanType, setLoanType] = useState('standard'); 
  const [monthlyBudget, setMonthlyBudget] = useState(2000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

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
    
    const filename = `Loan_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600/20 p-3 rounded-2xl">
                <Calculator className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Financial Decision Engine
            </h1>
          </div>
          <p className="text-gray-400">Analyze loans, optimize repayment, and strategize wealth.</p>
        </div>

        {/* Navigation */}
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <div className="animate-in fade-in duration-500">
            {activeTab === 'calculator' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Controls */}
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

                    {/* Right Column: Results */}
                    <div className="lg:col-span-2 space-y-6">
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
        <MathFooter />

      </div>
    </div>
  );
};

export default App;
