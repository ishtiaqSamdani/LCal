import { useState, useEffect } from 'react';
import { Calculator, Download, Calendar, IndianRupee, Percent, RefreshCw, FileText, Wallet, Clock } from 'lucide-react';

const App = () => {
  // State
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(5.0);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [monthlyBudget, setMonthlyBudget] = useState(2000); // For Principal First mode
  const [loanType, setLoanType] = useState('standard'); // 'standard' or 'principalFirst'
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState({ monthlyPayment: 0, totalInterest: 0, totalPayment: 0, payoffDate: '', totalDuration: '' });

  // Calculation Logic
  const calculateLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const start = new Date(startDate);

    let newSchedule = [];
    let totalInterest = 0;
    let totalPayment = 0;

    if (loanType === 'standard') {
      // Standard Amortization (Annuity)
      const months = (parseInt(loanTermYears) || 1) * 12;
      const x = Math.pow(1 + rate, months);
      // Handle 0 rate case or x=1
      const monthlyPayment = rate === 0 
        ? principal / months 
        : (principal * x * rate) / (x - 1);

      let balance = principal;

      for (let i = 1; i <= months; i++) {
        const interestPayment = balance * rate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        // Handle last month rounding
        if (balance < 0) balance = 0;

        totalInterest += interestPayment;
        totalPayment += monthlyPayment;

        const date = new Date(start);
        date.setMonth(start.getMonth() + i);

        newSchedule.push({
          month: i,
          phase: 'Standard',
          date: date.toLocaleDateString(),
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: balance,
          accumulatedInterest: 0 // Standard loan doesn't accumulate unpaid interest
        });
      }

      setSummary({
        monthlyPayment: monthlyPayment,
        totalInterest: totalInterest,
        totalPayment: totalPayment,
        payoffDate: newSchedule.length > 0 ? newSchedule[newSchedule.length - 1].date : '',
        totalDuration: `${months} Months (${(months/12).toFixed(1)} Years)`
      });

    } else {
      // Principal First (Deferred Interest / Risky)
      // Logic:
      // Phase 1 (Principal Paydown):
      //   - Payment = monthlyBudget
      //   - Interest Accrues on Balance (is NOT paid)
      //   - Principal Payment = monthlyBudget (100% of payment)
      //   - Balance reduces faster
      // Phase 2 (Interest Paydown):
      //   - Once Principal is 0, start paying off Accumulated Interest Debt
      
      const budget = parseFloat(monthlyBudget) || 0;
      let balance = principal;
      let accumulatedInterest = 0;
      let i = 0;
      const MAX_MONTHS = 1200; // Safety cap

      // Phase 1: Principal Paydown
      while (balance > 0.01 && i < MAX_MONTHS) {
        i++;
        const interestAccrued = balance * rate;
        accumulatedInterest += interestAccrued; // Defer interest

        let principalPayment = budget;
        let payment = budget;

        // Cap payment if it exceeds remaining balance
        if (principalPayment > balance) {
           principalPayment = balance;
           payment = balance; 
        }

        balance -= principalPayment;
        if (balance < 0) balance = 0;

        totalPayment += payment;
        // Note: totalInterest isn't "paid" yet, but it exists as debt. 
        // We usually count "Total Interest Paid" when money leaves hand.
        // In this phase, 0 interest is paid.

        const date = new Date(start);
        date.setMonth(start.getMonth() + i);

        newSchedule.push({
          month: i,
          phase: 'Prin. Paydown',
          date: date.toLocaleDateString(),
          payment: payment,
          principal: principalPayment,
          interest: interestAccrued, // Accrued, not paid
          balance: balance,
          accumulatedInterest: accumulatedInterest
        });
      }

      // Phase 2: Interest Paydown
      while (accumulatedInterest > 0.01 && i < MAX_MONTHS) {
        i++;
        // Does interest accrue on the interest debt? Usually yes (Compounding), 
        // but simplified Deferred Interest often just pays off the bucket.
        // Let's assume simple payoff for now to match the screenshot style "Accumulated Interest Debt".
        
        let payment = budget;
        if (payment > accumulatedInterest) {
            payment = accumulatedInterest;
        }

        accumulatedInterest -= payment;
        totalPayment += payment;
        totalInterest += payment; // NOW we are paying interest

        const date = new Date(start);
        date.setMonth(start.getMonth() + i);

        newSchedule.push({
          month: i,
          phase: 'Int. Paydown',
          date: date.toLocaleDateString(),
          payment: payment,
          principal: 0,
          interest: payment, // Paid
          balance: 0,
          accumulatedInterest: accumulatedInterest
        });
      }

       setSummary({
        monthlyPayment: budget, 
        totalInterest: totalInterest, // Actual interest PAID
        totalPayment: totalPayment,
        payoffDate: newSchedule.length > 0 ? newSchedule[newSchedule.length - 1].date : '',
        totalDuration: `${i} Months (${(i/12).toFixed(1)} Years)`
      });
    }

    setSchedule(newSchedule);
  };

  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTermYears, loanType, startDate, monthlyBudget]);

  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const downloadCSV = () => {
    // Headers: Month, Phase, Payment, Interest (Paid/Accrued), Principal Paid, Principal Balance, Accumulated Interest Debt
    const headers = ["Month", "Phase", "Payment", "Interest (Paid/Accrued)", "Principal Paid", "Principal Balance", "Accumulated Interest Debt"];
    const rows = schedule.map(row => [
      row.month,
      row.phase,
      row.payment.toFixed(2),
      row.interest.toFixed(2),
      row.principal.toFixed(2),
      row.balance.toFixed(2),
      row.accumulatedInterest.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    // Generate dynamic filename
    let filename = `Loan_${loanType === 'standard' ? 'Standard' : 'PrincipalFirst'}_${loanAmount}_${interestRate}%`;
    if (loanType === 'standard') {
      filename += `_${loanTermYears}yr`;
    } else {
      filename += `_Budget${monthlyBudget}`;
    }
    filename += ".csv";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="w-10 h-10 text-blue-500" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Loan Calculator
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6 bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-gray-400" />
              Loan Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Loan Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Interest Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Conditional Input based on Loan Type */}
              {loanType === 'standard' ? (
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Loan Term (Years)</label>
                    <input
                      type="number"
                      value={loanTermYears}
                      onChange={(e) => setLoanTermYears(Number(e.target.value))}
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
                        onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Set how much you want to pay monthly.</p>
                 </div>
              )}

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
                <p className="text-xs text-gray-500 mt-2">
                  {loanType === 'standard' 
                    ? 'Fixed monthly payments. Interest decreases over time.' 
                    : 'Pay 100% principal first, interest accumulates to end.'}
                </p>
              </div>
            </div>
          </div>

          {/* Results & Visualization */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                <p className="text-sm text-gray-400">
                    {loanType === 'standard' ? 'Monthly Payment' : 'Fixed Payment'}
                </p>
                <p className="text-xl font-bold text-green-400 mt-1">
                  {formatMoney(summary.monthlyPayment)}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                <p className="text-sm text-gray-400">Total Duration</p>
                <p className="text-xl font-bold text-yellow-400 mt-1 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {summary.totalDuration}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                <p className="text-sm text-gray-400">Total Interest</p>
                <p className="text-xl font-bold text-blue-400 mt-1">
                  {formatMoney(summary.totalInterest)}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                <p className="text-sm text-gray-400">Total Cost</p>
                <p className="text-xl font-bold text-purple-400 mt-1">
                  {formatMoney(summary.totalPayment)}
                </p>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Amortization Schedule
                </h3>
                <button 
                  onClick={downloadCSV}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm transition"
                  disabled={schedule.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
              
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-900/50 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-4 font-medium text-gray-400">Mo</th>
                      <th className="px-4 py-4 font-medium text-gray-400">Phase</th>
                      <th className="px-4 py-4 font-medium text-gray-400">Payment</th>
                      <th className="px-4 py-4 font-medium text-gray-400">Interest</th>
                      <th className="px-4 py-4 font-medium text-gray-400">Principal</th>
                      <th className="px-4 py-4 font-medium text-gray-400">Balance</th>
                      <th className="px-4 py-4 font-medium text-orange-400">Int. Debt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {schedule.length > 0 ? schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-gray-700/30 transition">
                        <td className="px-4 py-3 text-gray-300">{row.month}</td>
                        <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                row.phase === 'Standard' ? 'bg-blue-900/50 text-blue-300' :
                                row.phase === 'Prin. Paydown' ? 'bg-green-900/50 text-green-300' :
                                'bg-orange-900/50 text-orange-300'
                            }`}>
                                {row.phase}
                            </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-200">{formatMoney(row.payment)}</td>
                        <td className="px-4 py-3 text-red-300">{formatMoney(row.interest)}</td>
                        <td className="px-4 py-3 text-green-300">{formatMoney(row.principal)}</td>
                        <td className="px-4 py-3 text-gray-300">{formatMoney(row.balance)}</td>
                        <td className="px-4 py-3 text-orange-300 font-medium">{formatMoney(row.accumulatedInterest)}</td>
                      </tr>
                    )) : (
                        <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                No schedule data available.
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
