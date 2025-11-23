# Loan Calculator (LCal)

A professional-grade Loan Calculator built with React and Tailwind CSS. This application allows users to calculate loan payments, interest, and amortization schedules with support for both **Standard Amortization** and **Principal First** (Fixed Principal) repayment models.

## Features

-   **Dual Loan Types**:
    -   **Standard**: Traditional annuity loan where monthly payments are fixed.
    -   **Principal First**: Fixed principal payments where total monthly payments decrease over time.
-   **Real-time Calculation**: Instant updates as you modify loan parameters.
-   **Interactive Visualization**: Summary cards for key metrics (Monthly Payment, Total Interest, Total Cost).
-   **Detailed Schedule**: Full amortization table showing the breakdown of every payment.
-   **Export to CSV**: Download the complete amortization schedule for Excel or Google Sheets.
-   **Currency Support**: configured for Indian Rupee (INR).

## Live Demo

You can view the live application here: [https://ishtiaqSamdani.github.io/LCal/](https://ishtiaqSamdani.github.io/LCal/)

## How to Use

1.  **Enter Loan Amount**: Input the total principal amount you wish to borrow.
2.  **Set Interest Rate**: Enter the annual interest rate (APR).
3.  **Set Loan Term**: Enter the duration of the loan in years.
4.  **Select Start Date**: Choose when the loan payments will begin.
5.  **Choose Amortization Type**:
    -   Select **Standard** for fixed monthly payments (e.g., Mortgages, Auto Loans).
    -   Select **Principal First** for faster principal reduction (e.g., Commercial Loans).
6.  **View Results**:
    -   Check the summary cards for your monthly obligation and total costs.
    -   Scroll down to the table to see exactly how much goes to principal vs. interest each month.
7.  **Download**: Click "Download CSV" to save the schedule.

## Mathematical Formulas

Interested in the math behind the numbers? We believe in transparency. You can find a detailed explanation of the formulas used for both **Standard Amortization** (Annuity) and **Principal First** (Fixed Principal) calculations in our [Mathematical Documentation](./MATH.md).

## Development & Contribution

For instructions on how to run this project locally, understand the CI/CD pipeline, or contribute to the codebase, please see our [CONTRIBUTING.md](./CONTRIBUTING.md) guide.
