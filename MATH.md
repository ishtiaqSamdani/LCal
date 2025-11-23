# Mathematical Documentation

This document provides a formal definition of the amortization models implemented in the **Loan Calculator**.

## Nomenclature

| Symbol | Definition | Unit |
| :--- | :--- | :--- |
| $P_0$ | Initial Principal Loan Amount | Currency (₹) |
| $r$ | Monthly Interest Rate ($\frac{\text{Annual Rate}}{12 \times 100}$) | Decimal |
| $n$ | Total Loan Term (Years $\times$ 12) | Months |
| $M$ | Fixed Monthly Payment (EMI) | Currency (₹) |
| $B_t$ | Outstanding Principal Balance at month $t$ | Currency (₹) |
| $I_t$ | Interest Payment at month $t$ | Currency (₹) |
| $P_t$ | Principal Repayment at month $t$ | Currency (₹) |

---

## 1. Standard Amortization (Annuity Model)

In the Standard Amortization model, the borrower makes a fixed monthly payment $M$ such that the loan is fully paid off after $n$ periods.

### 1.1 Monthly Payment Formula (EMI)
The fixed monthly payment $M$ is derived from the geometric series of the present value of an annuity:

$$
M = P_0 \cdot \frac{r(1+r)^n}{(1+r)^n - 1}
$$

### 1.2 Schedule Calculation
For any given period $t$ (where $t = 1, 2, ..., n$), the components of the payment are calculated as follows:

**Interest Component:**
The interest for the current period is calculated on the remaining balance from the previous period ($B_{t-1}$):
$$
I_t = B_{t-1} \cdot r
$$

**Principal Component:**
The portion of the payment that reduces the principal balance:
$$
P_t = M - I_t
$$

**Remaining Balance:**
The new balance after the payment:
$$
B_t = B_{t-1} - P_t
$$

---

## 2. Principal First (Deferred Interest Model)

This is a **non-standard** repayment strategy where the borrower defines a fixed monthly budget $M_{budget}$. The strategy prioritizes eliminating the principal $P_0$ before paying any interest.

**Constraint:**
For this model to function, the monthly budget must exceed the initial interest accrual:
$$
M_{budget} > P_0 \cdot r
$$

### 2.1 Phase 1: Principal Paydown
In this phase, 100% of the monthly budget is applied to the principal. Interest still accrues but is **deferred** (added to a separate debt bucket) rather than paid immediately.

For each month $t$ while $B_{t-1} > 0$:

**Interest Accrued (Deferred):**
$$
I_{accrued, t} = B_{t-1} \cdot r
$$
$$
\text{Total Debt}_{interest} = \sum_{i=1}^{t} I_{accrued, i}
$$

**Principal Repayment:**
$$
P_t = \min(M_{budget}, B_{t-1})
$$

**Remaining Balance:**
$$
B_t = B_{t-1} - P_t
$$

### 2.2 Phase 2: Interest Repayment
Once the Principal Balance $B_t$ reaches 0, the borrower continues making payments of $M_{budget}$ to pay off the accumulated interest debt.

For each month $t$ while $\text{Total Debt}_{interest} > 0$:

$$
\text{Payment}_t = \min(M_{budget}, \text{Total Debt}_{interest})
$$
$$
\text{Total Debt}_{interest} \leftarrow \text{Total Debt}_{interest} - \text{Payment}_t
$$
