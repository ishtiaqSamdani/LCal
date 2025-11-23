import { useState, useEffect } from 'react';
import { Calculator, Download, Calendar, IndianRupee, Percent, RefreshCw, FileText } from 'lucide-react';

const App = () => {
  // State
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(5.0);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [loanType, setLoanType] = useState('standard'); // 'standard' or 'principalFirst'
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState({ monthlyPayment: 0, totalInterest: 0, totalPayment: 0, payoffDate: '' });

  useEffect(() => {
    const calculateLoan = () => {
      const principal = parseFloat(loanAmount);
      const rate = parseFloat(interestRate) / 100 / 12;
      const months = parseInt(loanTermYears) * 12;
      const start = new Date(startDate);
  
      let newSchedule = [];
      let totalInterest = 0;
      let totalPayment = 0;
  
      if (loanType === 'standard') {
        // Standard Amortization (Annuity)
        const x = Math.pow(1 + rate, months);
        const monthlyPayment = (principal * x * rate) / (x - 1);
  
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
            date: date.toLocaleDateString(),
            payment: monthlyPayment,
            principal: principalPayment,
            interest: interestPayment,
            balance: balance
          });
        }
  
        setSummary({
          monthlyPayment: monthlyPayment,
          totalInterest: totalInterest,
          totalPayment: totalPayment,
          payoffDate: newSchedule[newSchedule.length - 1].date
        });
  
      } else {
        // Principal First / Deferred Interest
        const fixedPrincipalPayment = principal / months;
        let balance = principal;
  
        for (let i = 1; i <= months; i++) {
          const interestPayment = balance * rate;
          const totalMonthPayment = fixedPrincipalPayment + interestPayment;
          
          balance -= fixedPrincipalPayment;
          if (balance < 0) balance = 0;
  
          totalInterest += interestPayment;
          totalPayment += totalMonthPayment;
  
          const date = new Date(start);
          date.setMonth(start.getMonth() + i);
  
          newSchedule.push({
            month: i,
            date: date.toLocaleDateString(),
            payment: totalMonthPayment,
            principal: fixedPrincipalPayment,
            interest: interestPayment,
            balance: balance
          });
        }
  
         setSummary({
          monthlyPayment: newSchedule[0].payment, // Shows initial payment
          totalInterest: totalInterest,
          totalPayment: totalPayment,
          payoffDate: newSchedule[newSchedule.length - 1].date
        });
      }
  
      setSchedule(newSchedule);
    };

    calculateLoan();
  }, [loanAmount, interestRate, loanTermYears, loanType, startDate]);

  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const downloadCSV = () => {
    const headers = ["Month", "Date", "Payment", "Principal", "Interest", "Balance"];
    const rows = schedule.map(row => [
      row.month,
      row.date,
      row.payment.toFixed(2),
      row.principal.toFixed(2),
      row.interest.toFixed(2),
      row.balance.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "loan_schedule.csv");
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

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Loan Term (Years)</label>
                <input
                  type="number"
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

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
                    : 'Fixed principal payments. Total payment decreases over time as interest drops.'}
                </p>
              </div>
            </div>
          </div>

          {/* Results & Visualization */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <p className="text-sm text-gray-400">Monthly Payment {loanType === 'principalFirst' && '(Initial)'}</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {formatMoney(summary.monthlyPayment)}
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <p className="text-sm text-gray-400">Total Interest</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">
                  {formatMoney(summary.totalInterest)}
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <p className="text-sm text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">
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
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
              
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-900/50 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 font-medium text-gray-400">Month</th>
                      <th className="px-6 py-4 font-medium text-gray-400">Date</th>
                      <th className="px-6 py-4 font-medium text-gray-400">Payment</th>
                      <th className="px-6 py-4 font-medium text-gray-400">Principal</th>
                      <th className="px-6 py-4 font-medium text-gray-400">Interest</th>
                      <th className="px-6 py-4 font-medium text-gray-400">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-gray-700/30 transition">
                        <td className="px-6 py-3 text-gray-300">{row.month}</td>
                        <td className="px-6 py-3 text-gray-300">{row.date}</td>
                        <td className="px-6 py-3 font-medium text-green-400">{formatMoney(row.payment)}</td>
                        <td className="px-6 py-3 text-gray-300">{formatMoney(row.principal)}</td>
                        <td className="px-6 py-3 text-gray-300">{formatMoney(row.interest)}</td>
                        <td className="px-6 py-3 text-gray-400">{formatMoney(row.balance)}</td>
                      </tr>
                    ))}
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
