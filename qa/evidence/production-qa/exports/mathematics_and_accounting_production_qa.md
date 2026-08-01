# Mathematics and Accounting Production QA
*Deterministic offline and print acceptance fixture*

**Author:** PressCraft QA  
**Publisher:** PressCraft Quality Engineering  
**ISBN:** 978-0-00000-000-0  

---

## Chapter 1 — Mathematics Typesetting
*Sharp, semantic and accessible equations*

### Core equation forms

Inline algebra accompanies the variable equation below without relying on a remote renderer.

$ax^2 + bx + c = 0$

$$
E = mc^2
$$

$$
\frac{1}{1+\frac{1}{1+\frac{1}{x}}}
$$

$$
\sqrt{x^2 + y^2}
$$

$$
a_n = a_1 r^{n-1}
$$

$$
\boxed{x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}}
$$

$$
\begin{aligned} 2x + 7 &= 19 \\ 2x &= 12 \\ x &= 6 \end{aligned}
$$

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

$$
\int_{0}^{\infty} e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}
$$

$$
\begin{bmatrix} 1 & 2 & 3 \\ 0 & 1 & 4 \\ 5 & 6 & 0 \end{bmatrix}
$$

### Long-equation width policy

$$
\displaystyle \frac{\left(x_1+x_2+x_3+x_4+x_5+x_6+x_7+x_8+x_9+x_{10}\right)^2}{\sqrt{a_1^2+a_2^2+a_3^2+a_4^2+a_5^2+a_6^2+a_7^2+a_8^2+a_9^2+a_{10}^2}} = \sum_{k=1}^{10}\frac{x_k^2}{a_k}
$$

Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph. Boundary control paragraph.

Worked example near a page boundary

$$
\frac{3}{4}x - 5 = 16
$$

Step 1 — isolate the variable term

$$
\boxed{x = 28}
$$

$$
\frac{1}{
$$

---

## Chapter 2 — Accounting Statements
*Balanced books, warnings, totals and multi-page tables*

### Journal entries

### Balanced General Journal

| Date | Details | Folio | Debit | Credit |
| --- | --- | --- | --- | --- |
| 2025-01-02 | Bank | B1 | R12,500.00 | — |
| 2025-01-02 | Owner capital | C1 | — | R12,500.00 |
|  | Total |  | R12,500.00 | R12,500.00 |

### Unbalanced Journal — Warning Expected

| Date | Details | Folio | Debit | Credit |
| --- | --- | --- | --- | --- |
| 2025-01-05 | Equipment | E1 | R8,500.00 | — |
| 2025-01-05 | Bank | B1 | — | R8,000.00 |
|  | Total — out of balance |  | R8,500.00 | R8,000.00 |

### T-account — Bank

### T-account — Bank

| Date | Account | Debit | Credit | Notes |
| --- | --- | --- | --- | --- |
| 2025-01-02 | Capital | 12,500.00 |  | Opening investment |
| 2025-01-05 | Equipment |  | 8,000.00 | Asset purchase |
| 2025-01-31 | Balance c/d |  | 4,500.00 | Closing balance |

### Trial balances

### Balanced Trial Balance

| Account | Debit balance | Credit balance |
| --- | --- | --- |
| Bank | R4,500.00 | — |
| Equipment | R8,000.00 | — |
| Capital | — | R12,500.00 |
| Total | R12,500.00 | R12,500.00 |

### Unbalanced Trial Balance — Warning Expected

| Account | Debit balance | Credit balance |
| --- | --- | --- |
| Bank | R4,500.00 | — |
| Equipment | R8,000.00 | — |
| Capital | — | R12,000.00 |
| Total — out of balance | R12,500.00 | R12,000.00 |

### Statement of Profit or Loss — Year ended 31 December 2025

| Item | Amount |
| --- | --- |
| Revenue | R187,500.00 |
| Cost of sales | (R121,875.00) |
| Gross profit | R65,625.00 |
| Operating expenses | (R28,750.00) |
| Profit for the year | R36,875.00 |

### Performance Ratios

| Measure | Current year | Prior year |
| --- | --- | --- |
| Gross profit margin | 35.00% | 32.50% |
| Net profit margin | 19.67% | 17.20% |
| Return on assets | 12.40% | 10.90% |

### Statement of Financial Position — Year ended 31 December 2025

| Item | Amount |
| --- | --- |
| Assets |  |
|   Property, plant and equipment | R245,000.00 |
|   Inventory | R87,500.00 |
|     Allowance for obsolete inventory | (R2,500.00) |
| Total assets | R330,000.00 |
| Equity and liabilities |  |
|   Owner equity | R225,000.00 |
|   Trade payables | R105,000.00 |
| Total equity and liabilities | R330,000.00 |

### Multi-page journal continuity

### Multi-page Inventory Journal

| Date | Details | Folio | Debit | Credit |
| --- | --- | --- | --- | --- |
| 2025-12-01 | Inventory batch 01 | INV01 | R107.50 | — |
| 2025-12-01 | Trade payables | PAY01 | — | R107.50 |
| 2025-12-02 | Inventory batch 02 | INV02 | R115.00 | — |
| 2025-12-02 | Trade payables | PAY02 | — | R115.00 |
| 2025-12-03 | Inventory batch 03 | INV03 | R122.50 | — |
| 2025-12-03 | Trade payables | PAY03 | — | R122.50 |
| 2025-12-04 | Inventory batch 04 | INV04 | R130.00 | — |
| 2025-12-04 | Trade payables | PAY04 | — | R130.00 |
| 2025-12-05 | Inventory batch 05 | INV05 | R137.50 | — |
| 2025-12-05 | Trade payables | PAY05 | — | R137.50 |
| 2025-12-06 | Inventory batch 06 | INV06 | R145.00 | — |
| 2025-12-06 | Trade payables | PAY06 | — | R145.00 |
| 2025-12-07 | Inventory batch 07 | INV07 | R152.50 | — |
| 2025-12-07 | Trade payables | PAY07 | — | R152.50 |
| 2025-12-08 | Inventory batch 08 | INV08 | R160.00 | — |
| 2025-12-08 | Trade payables | PAY08 | — | R160.00 |
| 2025-12-09 | Inventory batch 09 | INV09 | R167.50 | — |
| 2025-12-09 | Trade payables | PAY09 | — | R167.50 |
| 2025-12-10 | Inventory batch 10 | INV10 | R175.00 | — |
| 2025-12-10 | Trade payables | PAY10 | — | R175.00 |
| 2025-12-11 | Inventory batch 11 | INV11 | R182.50 | — |
| 2025-12-11 | Trade payables | PAY11 | — | R182.50 |
| 2025-12-12 | Inventory batch 12 | INV12 | R190.00 | — |
| 2025-12-12 | Trade payables | PAY12 | — | R190.00 |
| 2025-12-13 | Inventory batch 13 | INV13 | R197.50 | — |
| 2025-12-13 | Trade payables | PAY13 | — | R197.50 |
| 2025-12-14 | Inventory batch 14 | INV14 | R205.00 | — |
| 2025-12-14 | Trade payables | PAY14 | — | R205.00 |
| 2025-12-15 | Inventory batch 15 | INV15 | R212.50 | — |
| 2025-12-15 | Trade payables | PAY15 | — | R212.50 |
| 2025-12-16 | Inventory batch 16 | INV16 | R220.00 | — |
| 2025-12-16 | Trade payables | PAY16 | — | R220.00 |
| 2025-12-17 | Inventory batch 17 | INV17 | R227.50 | — |
| 2025-12-17 | Trade payables | PAY17 | — | R227.50 |
| 2025-12-18 | Inventory batch 18 | INV18 | R235.00 | — |
| 2025-12-18 | Trade payables | PAY18 | — | R235.00 |
| 2025-12-19 | Inventory batch 19 | INV19 | R242.50 | — |
| 2025-12-19 | Trade payables | PAY19 | — | R242.50 |
| 2025-12-20 | Inventory batch 20 | INV20 | R250.00 | — |
| 2025-12-20 | Trade payables | PAY20 | — | R250.00 |
| 2025-12-21 | Inventory batch 21 | INV21 | R257.50 | — |
| 2025-12-21 | Trade payables | PAY21 | — | R257.50 |
| 2025-12-22 | Inventory batch 22 | INV22 | R265.00 | — |
| 2025-12-22 | Trade payables | PAY22 | — | R265.00 |
| 2025-12-23 | Inventory batch 23 | INV23 | R272.50 | — |
| 2025-12-23 | Trade payables | PAY23 | — | R272.50 |
| 2025-12-24 | Inventory batch 24 | INV24 | R280.00 | — |
| 2025-12-24 | Trade payables | PAY24 | — | R280.00 |
| 2025-12-25 | Inventory batch 25 | INV25 | R287.50 | — |
| 2025-12-25 | Trade payables | PAY25 | — | R287.50 |
| 2025-12-26 | Inventory batch 26 | INV26 | R295.00 | — |
| 2025-12-26 | Trade payables | PAY26 | — | R295.00 |
| 2025-12-27 | Inventory batch 27 | INV27 | R302.50 | — |
| 2025-12-27 | Trade payables | PAY27 | — | R302.50 |
| 2025-12-28 | Inventory batch 28 | INV28 | R310.00 | — |
| 2025-12-28 | Trade payables | PAY28 | — | R310.00 |
| 2025-12-01 | Inventory batch 29 | INV29 | R317.50 | — |
| 2025-12-01 | Trade payables | PAY29 | — | R317.50 |
| 2025-12-02 | Inventory batch 30 | INV30 | R325.00 | — |
| 2025-12-02 | Trade payables | PAY30 | — | R325.00 |
| 2025-12-03 | Inventory batch 31 | INV31 | R332.50 | — |
| 2025-12-03 | Trade payables | PAY31 | — | R332.50 |
| 2025-12-04 | Inventory batch 32 | INV32 | R340.00 | — |
| 2025-12-04 | Trade payables | PAY32 | — | R340.00 |
|  | Total |  | R7,160.00 | R7,160.00 |

---

## Chapter 3 — Offline Reader Checks
*Navigation, search, reload and missing assets*

### Offline navigation target

Quasar reconciliation is the deterministic search phrase for the offline data-pack acceptance test.

Every representative equation in this fixture includes an accessibility description.

![Missing asset fallback fixture](/qa-assets/intentionally-missing-diagram.png)
*Missing asset fallback fixture*

---

