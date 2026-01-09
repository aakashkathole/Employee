// src/utils/salaryUtils.js

// Utility functions for salary slip
export const INR = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;

export const monthName = (m) =>
  new Date(2025, m - 1).toLocaleString("en-IN", { month: "long" });

/* ---- Number to Words (INR) ---- */
const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six",
  "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
  "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"
];

const tens = [
  "", "", "Twenty", "Thirty", "Forty",
  "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
];

const belowThousand = (n) => {
  let str = "";
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + " ";
    n %= 10;
  }
  if (n > 0) str += ones[n] + " ";
  return str.trim();
};

export const numberToWordsINR = (num) => {
  if (!num) return "Zero Rupees Only";

  let n = Math.floor(num);
  let crore = Math.floor(n / 10000000);
  n %= 10000000;
  let lakh = Math.floor(n / 100000);
  n %= 100000;
  let thousand = Math.floor(n / 1000);
  n %= 1000;

  let words = "";
  if (crore) words += belowThousand(crore) + " Crore ";
  if (lakh) words += belowThousand(lakh) + " Lakh ";
  if (thousand) words += belowThousand(thousand) + " Thousand ";
  if (n) words += belowThousand(n);

  return words.trim() + " Rupees Only";
};

export const imageUrlToBase64 = async (url) => {
  // For React Native, return the URL directly as react-native-print can handle it
  return url;
};

export const generateHTML = (salary, branch, logoBase64) => {
  const earnings = [
    ["Basic Salary", salary.basicSalary],
    ["HRA Allowance", salary.hraAllowance],
    ["TA Allowance", salary.taAllowance],
    ["Incentive", salary.incentive],
    ["SPI", salary.spi],
    ["Medical Allowance", salary.medicalAllowance],
  ].filter(([, v]) => v > 0);

  const deductions = [
    ["PF", salary.pf],
    ["ESIC", salary.esic],
    ["Professional Tax", salary.professionalTax],
    ["Income Tax", salary.incomeTax],
    ["Penalty", salary.penalty],
  ].filter(([, v]) => v > 0);

  const totalEarnings = earnings.reduce((a, [, v]) => a + v, 0);
  const totalDeductions = deductions.reduce((a, [, v]) => a + v, 0);

  const html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .container { padding: 16px; }
        .header { border: 1px solid #90caf9; margin-bottom: 16px; background-color: #e3f2fd; padding: 8px; display: flex; align-items: center; }
        .logo { flex: 0 0 20%; text-align: left; }
        .company { flex: 0 0 60%; text-align: center; }
        .spacer { flex: 0 0 20%; }
        .title { text-align: center; padding: 4px; font-weight: 600; color: #1976d2; }
        .details { border: 1px solid #ccc; margin-bottom: 16px; background-color: #f9fbff; padding: 8px; }
        .details-grid { display: flex; }
        .details-left, .details-right { flex: 1; }
        .bank { border: 1px solid #ccc; margin-bottom: 16px; background-color: #fafafa; padding: 8px; display: flex; }
        .bank-left, .bank-right { flex: 1; }
        table { border: 1px solid #999; width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #999; padding: 4px; }
        .earnings-header { background-color: #e3f2fd; }
        .total { background-color: #f5f5f5; }
        .net { background-color: #bbdefb; }
        .words { margin-top: 8px; }
        .footer { text-align: center; margin-top: 16px; border-top: 1px solid #ccc; padding-top: 8px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            ${logoBase64 ? `<img src="${logoBase64}" style="height: 60px; max-width: 100%; object-fit: contain;" />` : ''}
          </div>
          <div class="company">
            <div style="font-weight: 700; font-size: 18px;">${branch?.branchName || ''}</div>
            <div>${branch?.address || ''}, ${branch?.city || ''}, ${branch?.district || ''}, ${branch?.state || ''} - ${branch?.pincode || ''}</div>
            <div>Email: ${branch?.branchEmail || ''} | Contact: ${branch?.contact || ''}</div>
          </div>
          <div class="spacer"></div>
        </div>
        <div class="title">Salary Slip for ${monthName(salary.month)} ${salary.year}</div>
        <div class="details">
          <div class="details-grid">
            <div class="details-left">
              <div><b>Name:</b> ${salary.fullName || ''}</div>
              <div><b>Employee ID:</b> ${salary.empId || ''}</div>
              <div><b>Designation:</b> ${salary.designation || ''}</div>
              <div><b>Department:</b> ${salary.department || ''}</div>
              <div><b>Category:</b> ${salary.employeecategory || ''}</div>
            </div>
            <div class="details-right">
              <div><b>DOB:</b> ${salary.dob || '—'}</div>
              <div><b>Mobile:</b> ${salary.mobileNo || '—'}</div>
              <div><b>Email:</b> ${salary.empEmail || '—'}</div>
              <div><b>Aadhaar No:</b> ${salary.adharNo || '—'}</div>
              <div><b>PAN No:</b> ${salary.panNo || '—'}</div>
              <div><b>CPF No:</b> ${salary.cpfNo || '—'}</div>
            </div>
          </div>
        </div>
        <div class="bank">
          <div class="bank-left">
            <div><b>Bank Name:</b> ${salary.bankName || '—'}</div>
            <div><b>Account Number:</b> ${salary.accountNumber || '—'}</div>
          </div>
          <div class="bank-right">
            <div><b>Transaction ID:</b> ${salary.transactionId || ''}</div>
            <div><b>Payment Date:</b> ${salary.paymentDate || ''}</div>
            <div><b>Status:</b> ${salary.status || ''}</div>
          </div>
        </div>
        <table>
          <tbody>
            <tr class="earnings-header">
              <td><b>Earnings</b></td>
              <td style="text-align: right;"><b>Amount</b></td>
              <td><b>Deductions</b></td>
              <td style="text-align: right;"><b>Amount</b></td>
            </tr>
            ${Array.from({ length: Math.max(earnings.length, deductions.length) }).map((_, i) => `
              <tr>
                <td>${earnings[i]?.[0] || ''}</td>
                <td style="text-align: right;">${earnings[i] ? INR(earnings[i][1]) : ''}</td>
                <td>${deductions[i]?.[0] || ''}</td>
                <td style="text-align: right;">${deductions[i] ? INR(deductions[i][1]) : ''}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td><b>Total Earnings</b></td>
              <td style="text-align: right;"><b>${INR(totalEarnings)}</b></td>
              <td><b>Total Deductions</b></td>
              <td style="text-align: right;"><b>${INR(totalDeductions)}</b></td>
            </tr>
            <tr class="net">
              <td colspan="3"><b>Net Pay</b></td>
              <td style="text-align: right;"><b>${INR(salary.finalNetSalary)}</b></td>
            </tr>
          </tbody>
        </table>
        <div class="words">
          <b>Net Pay (in words):</b> ${numberToWordsINR(salary.finalNetSalary)}
        </div>
        <div class="footer">
          This is a computer generated salary slip and does not require a signature.
        </div>
      </div>
    </body>
    </html>
  `;
  return html;
};