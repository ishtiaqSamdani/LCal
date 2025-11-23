# Mathematical Formulas

This document details the financial mathematics used in the Loan Calculator to determine monthly payments, interest, and principal allocation for both supported amortization methods.

## 1. Standard Amortization (Annuity Loan)

In a standard amortization schedule, the borrower makes **equal monthly payments** throughout the loan term. Since the principal balance decreases over time, the interest portion of each payment decreases, while the principal portion increases.

### Variables
- \( P \): Principal Loan Amount
- \( r \): Monthly Interest Rate (Annual Rate / 12)
- \( n \): Total Number of Payments (Loan Term in Years $\times$ 12)

### Formula: Monthly Payment (EMI)
The fixed monthly payment \( M \) is calculated using the annuity formula:

\[
M = P \cdot \frac{r(1+r)^n}{(1+r)^n - 1}
\]

### Breakdown per Month
For any given month \( i \):
1.  **Interest Payment** (\( I_i \)):
    \[
    I_i = B_{i-1} \cdot r
    \]
    Where \( B_{i-1} \) is the remaining balance from the previous month.
2.  **Principal Payment** (\( P_i \)):
    \[
    P_i = M - I_i
    \]
3.  **New Balance** (\( B_i \)):
    \[
    B_i = B_{i-1} - P_i
    \]

---

## 2. Principal First (Fixed Principal / CAM)

In the "Principal First" model (often called Constant Amortization Mortgage or CAM), the **principal portion of the payment is fixed** for every month. The total monthly payment decreases over time because the interest portion (calculated on the remaining balance) shrinks.

### Variables
- \( P \): Principal Loan Amount
- \( r \): Monthly Interest Rate
- \( n \): Total Number of Payments

### Formula: Fixed Principal Component
The principal portion paid every month is constant:

\[
P_{fixed} = \frac{P}{n}
\]

### Breakdown per Month
For any given month \( i \):
1.  **Interest Payment** (\( I_i \)):
    \[
    I_i = B_{i-1} \cdot r
    \]
2.  **Total Monthly Payment** (\( M_i \)):
    \[
    M_i = P_{fixed} + I_i
    \]
    *(Note: \( M_i \) is higher at the start of the loan and decreases every month)*
3.  **New Balance** (\( B_i \)):
    \[
    B_i = B_{i-1} - P_{fixed}
    \]

