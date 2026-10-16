# Bullseye — Manual Testing Report

This document contains a comprehensive manual testing suite for the Bullseye Intelligent Equity Analysis Platform. It is designed to be executed directly in the browser. 

## Known Limitations (UI-Only Features)
Based on the code inspection, the following features are present in the interface but are currently unimplemented (UI-only) and should not be tested for functionality:
- **Global Search**: The search bar in the top navigation header is a visual placeholder.
- **Pattern Scanner 'Learn More'**: The "Learn More" buttons on the pattern cards do not trigger any navigation or modal.
- **Watchlist Persistence**: The Watchlist resets upon page reload because it uses local React state rather than `localStorage` or a database.

---

## Recommended Demonstration Order
For a smooth 3–5 minute college assignment demonstration, follow this sequence:
1. **Market Overview**: Show the dashboard, highlight the NIFTY 50 chart, and point out the "DEMO DATA" label.
2. **Stock Screener**: Search for "TCS", apply the "Large Cap" filter, set P/E to "< 20", and sort the results.
3. **Technical Analysis**: Select a stock, change the timeframe to 1M, and toggle the SMA 50 and MACD indicators to show live chart updates.
4. **Fundamental Analysis**: Switch to the "Growth" tab, highlighting the computed PEG Ratio and Revenue CAGR metrics.
5. **Pattern Scanner**: Briefly show the educational pattern cards.
6. **Watchlist**: Search for "ITC", add it to the watchlist, and then remove it.
7. **About / Methodology**: Conclude the demo on the methodology page to emphasize the educational scope.

---

## Manual Execution Checklist
Use this checklist while executing the test cases below:
- [ ] Passed
- [ ] Failed
- [ ] Blocked / not implemented

*Note: If a test fails, carefully record the observed result and any console error messages in the Actual Result column before marking it as Failed.*

---

## Manual Test Cases

| Test Case ID | Feature | Preconditions | Exact Manual Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-001 | App Launch | Development server is running | 1. Navigate to `http://localhost:5173` (or active port). | Dashboard loads. "Market Intelligence" heading is visible. "DEMO DATA" badge is in the header. | Not tested | Pending manual execution |
| TC-002 | Sidebar Navigation | Dashboard is loaded | 1. Click "Stock Screener" in the sidebar. | URL changes to `/screener` and Screener page loads. | Not tested | Pending manual execution |
| TC-003 | Market Overview Chart | Dashboard is loaded | 1. Click "1M" on the NIFTY 50 chart.<br>2. Click "6M". | The area chart smoothly updates its data points to reflect the new timeframe. | Not tested | Pending manual execution |
| TC-004 | Sector Heatmap | Dashboard is loaded | 1. Scroll down to "Sector Performance".<br>2. Hover over a green sector tile (e.g., Automobile). | The tile scales up slightly (hover effect) and shows a positive percentage. | Not tested | Pending manual execution |
| TC-005 | Screener Search | On `/screener` | 1. Type "TCS" into the search bar. | Table filters to show only Tata Consultancy Services. | Not tested | Pending manual execution |
| TC-006 | Screener Filters (Dropdowns) | On `/screener` | 1. Clear search.<br>2. Select "Banking" from Sector dropdown. | Table filters to show only HDFC Bank and ICICI Bank. | Not tested | Pending manual execution |
| TC-007 | Screener Filters (Numerical) | On `/screener` | 1. Select "< 20" from P/E Ratio dropdown. | Table filters out stocks with P/E >= 20. HDFC Bank and ICICI Bank remain visible. | Not tested | Pending manual execution |
| TC-008 | Screener Empty State | On `/screener` | 1. Type "INVALID_STOCK" into the search bar. | Table disappears and an empty state message ("No stocks found matching your criteria") is displayed. | Not tested | Pending manual execution |
| TC-009 | Screener Reset | On `/screener` | 1. Apply multiple filters (e.g., Banking, < 20 PE).<br>2. Click the "Reset Filters" button. | All dropdowns reset to "All" and the full list of sample stocks reappears. | Not tested | Pending manual execution |
| TC-010 | Screener Sorting | On `/screener` | 1. Click the "Price (₹)" column header.<br>2. Click it again. | First click sorts ascending (lowest price first). Second click sorts descending (highest price first). | Not tested | Pending manual execution |
| TC-011 | Technical Chart Timeframe | On `/technical` | 1. Select "RELIANCE" from the dropdown.<br>2. Click "1M" timeframe. | The LineChart re-renders to show exactly 30 data points on the X-axis. | Not tested | Pending manual execution |
| TC-012 | Technical Indicators (SMA) | On `/technical` | 1. Check "SMA (50)" checkbox.<br>2. Uncheck it. | An orange line appears on the price chart tracking the 50-period average, then disappears. | Not tested | Pending manual execution |
| TC-013 | Technical Indicators (MACD) | On `/technical` | 1. Check "MACD (12, 26, 9)" checkbox. | A new sub-chart panel appears below the price chart displaying a Red/Green histogram. | Not tested | Pending manual execution |
| TC-014 | Fundamental Stock Select | On `/fundamental` | 1. Select "ITC" from the top dropdown. | The financial performance chart and ratio table update to reflect ITC's data. | Not tested | Pending manual execution |
| TC-015 | Fundamental Tabs | On `/fundamental` | 1. Click the "Profitability" tab.<br>2. Click the "Growth" tab. | The active tab styling updates (blue underline). | Not tested | Pending manual execution |
| TC-016 | Fundamental Ratio Edge Cases | On `/fundamental` | 1. Look at the "Key Financial Ratios" table for TCS. | The "Debt to Equity" row safely displays "0.00" without throwing a division error. | Not tested | Pending manual execution |
| TC-017 | Fundamental PEG & CAGR | On `/fundamental` | 1. Look at the ratios table. | "PEG Ratio" and "Revenue CAGR (4Y)" rows are present and populated with numbers, not "NaN". | Not tested | Pending manual execution |
| TC-018 | Pattern Scanner Display | On `/patterns` | 1. Scroll through the pattern cards. | Badges display correct sentiment colors (e.g., Green for Bullish Engulfing, Red for Bearish Engulfing). | Not tested | Pending manual execution |
| TC-019 | Watchlist Search & Add | On `/watchlist` | 1. Type "INFY" into the search bar.<br>2. Click the "+" button next to Infosys in the dropdown. | Infosys is added to the watchlist list below. The search bar clears. | Not tested | Pending manual execution |
| TC-020 | Watchlist Remove | On `/watchlist` | 1. Click the red trash-can icon next to "RELIANCE" in the watchlist. | Reliance is immediately removed from the list. | Not tested | Pending manual execution |
| TC-021 | Watchlist Empty State | On `/watchlist` | 1. Remove all remaining stocks from the watchlist. | A dashed-border empty state box appears with the message "Your watchlist is empty". | Not tested | Pending manual execution |
| TC-022 | Responsive Sidebar | Dashboard is loaded | 1. Resize browser window to mobile width (<768px).<br>2. Click the hamburger menu icon. | The sidebar collapses behind a hamburger menu. Clicking the menu icon slides the sidebar open. | Not tested | Pending manual execution |

---

## Bug Report Template

If you encounter an issue during manual testing, copy and fill out this template:

**Test Case ID:** [e.g., TC-005]  
**Page or Feature:** [e.g., Stock Screener]  
**Steps to Reproduce:**  
1. 
2. 
3. 

**Expected Behavior:** [What should have happened]  
**Actual Behavior:** [What actually happened]  
**Screenshot / Error Message:** [Paste console error or UI observation]  
**Severity:** [Critical / Major / Minor]  
**Notes:** [Any context, like browser version or screen size]
