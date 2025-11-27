export const calculateWeightedAverageRate = (tranches) => {
  const totalAmount = tranches.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  if (totalAmount === 0) return 0;

  const weightedSum = tranches.reduce((sum, t) => {
    return sum + ((parseFloat(t.amount) || 0) * (parseFloat(t.rate) || 0));
  }, 0);

  return weightedSum / totalAmount;
};

export const calculateLoanSchedule = (loanAmount, interestRate, loanTermYears, loanType, startDate, monthlyBudget) => {
  const principal = parseFloat(loanAmount) || 0;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  const start = new Date(startDate);

  let newSchedule = [];
  let totalInterest = 0;
  let totalPayment = 0;

  if (loanType === 'standard') {
    // Standard Amortization (Annuity)
    const months = (parseInt(loanTermYears) || 1) * 12;
    
    let monthlyPayment = 0;
    if (rate === 0) {
        monthlyPayment = principal / months;
    } else {
        const x = Math.pow(1 + rate, months);
        monthlyPayment = (principal * x * rate) / (x - 1);
    }

    let balance = principal;

    for (let i = 1; i <= months; i++) {
      const interestPayment = balance * rate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
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
        accumulatedInterest: 0
      });
    }

    return {
      schedule: newSchedule,
      summary: {
        monthlyPayment: monthlyPayment,
        totalInterest: totalInterest,
        totalPayment: totalPayment,
        payoffDate: newSchedule.length > 0 ? newSchedule[newSchedule.length - 1].date : '',
        totalDuration: `${months} Months (${(months/12).toFixed(1)} Years)`
      }
    };

  } else {
    // Principal First (Deferred Interest)
    const budget = parseFloat(monthlyBudget) || 0;
    let balance = principal;
    let accumulatedInterest = 0;
    let i = 0;
    const MAX_MONTHS = 1200; 

    // Check if budget covers at least the first month's interest is NOT required here because
    // in this specific "Principal First" logic (Deferred Interest), we pay Principal FIRST.
    // Interest is deferred. So as long as Budget > 0, we make progress on principal.

    // Phase 1: Principal Paydown
    while (balance > 0.01 && i < MAX_MONTHS) {
      i++;
      const interestAccrued = balance * rate;
      accumulatedInterest += interestAccrued;

      let principalPayment = budget;
      let payment = budget;

      if (principalPayment > balance) {
         principalPayment = balance;
         payment = balance; 
      }

      balance -= principalPayment;
      if (balance < 0) balance = 0;

      totalPayment += payment;

      const date = new Date(start);
      date.setMonth(start.getMonth() + i);

      newSchedule.push({
        month: i,
        phase: 'Prin. Paydown',
        date: date.toLocaleDateString(),
        payment: payment,
        principal: principalPayment,
        interest: interestAccrued, // Accrued
        balance: balance,
        accumulatedInterest: accumulatedInterest
      });
    }

    // Phase 2: Interest Paydown
    while (accumulatedInterest > 0.01 && i < MAX_MONTHS) {
      i++;
      let payment = budget;
      if (payment > accumulatedInterest) {
          payment = accumulatedInterest;
      }

      accumulatedInterest -= payment;
      totalPayment += payment;
      totalInterest += payment; // Paid

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

    return {
      schedule: newSchedule,
      summary: {
        monthlyPayment: budget, 
        totalInterest: totalInterest,
        totalPayment: totalPayment,
        payoffDate: newSchedule.length > 0 ? newSchedule[newSchedule.length - 1].date : '',
        totalDuration: `${i} Months (${(i/12).toFixed(1)} Years)`
      }
    };
  }
};

export const generateCSV = (schedule, summary, loanType, loanAmount, interestRate, loanTermYears, monthlyBudget) => {
    // Summary Header Rows
    const summaryRows = [
        ["Loan Summary Report"],
        ["Total Loan Amount", loanAmount],
        ["Effective Interest Rate", `${interestRate}%`],
        ["Strategy", loanType === 'standard' ? 'Standard Amortization' : 'Principal First (Deferred Interest)'],
        ["Total Interest Cost", summary.totalInterest.toFixed(2)],
        ["Total Duration", summary.totalDuration],
        [], // Empty row
        // Table Headers
        ["Month", "Phase", "Payment", "Interest (Paid/Accrued)", "Principal Paid", "Principal Balance", "Accumulated Interest Debt"]
    ];

    const dataRows = schedule.map(row => [
      row.month,
      row.phase,
      row.payment.toFixed(2),
      row.interest.toFixed(2),
      row.principal.toFixed(2),
      row.balance.toFixed(2),
      row.accumulatedInterest.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + summaryRows.map(e => e.join(",")).join("\n") + "\n"
      + dataRows.map(e => e.join(",")).join("\n");

    return csvContent;
};

