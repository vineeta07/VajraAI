import Papa from 'papaparse';

export const COLUMNS = [
  { key: 'vendor_id', required: true, aliases: ['vendorid', 'vendor_code', 'supplier_id'], note: 'Stable identifier for the payee' },
  { key: 'vendor_name', required: true, aliases: ['vendorname', 'vendor', 'supplier', 'supplier_name', 'payee'], note: 'Name of the payee' },
  { key: 'department', required: true, aliases: ['dept', 'ministry', 'office'], note: 'Spending department' },
  { key: 'amount', required: true, aliases: ['value', 'paid', 'amount_paid', 'payment'], note: 'Amount paid, in rupees' },
  { key: 'transaction_date', required: true, aliases: ['date', 'txn_date', 'payment_date'], note: 'YYYY-MM-DD' },
  { key: 'location', required: false, aliases: ['city', 'district', 'place'], note: 'City or district — used by the risk map' },
  { key: 'estimated_cost', required: false, aliases: ['estimatedcost', 'estimate', 'budget'], note: 'Sanctioned estimate — enables cost-overrun checks' },
  { key: 'num_bidders', required: false, aliases: ['bidders', 'numbidders', 'bids'], note: 'Bids received — enables single-bidder checks' },
];

const norm = (s) => String(s).trim().toLowerCase().replace(/[\s-]+/g, '_');

function readText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('The browser could not read this file.'));
    r.readAsText(file);
  });
}

const toNumber = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  const n = Number(String(v).replace(/[₹,\s]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

const toDate = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  const d = dmy ? new Date(Date.UTC(+dmy[3], +dmy[2] - 1, +dmy[1])) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

/**
 * Reads a CSV or JSON file and returns
 *   { rows, skipped: [{ line, reason }], mapping: { key: sourceHeader|null }, missing: [key], total }
 * or throws an Error whose message can be shown as-is.
 */
export async function parseUpload(file) {
  const name = file.name.toLowerCase();
  const text = await readText(file);
  if (!text.trim()) throw new Error('This file is empty.');

  let records;
  if (name.endsWith('.json')) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error(`This isn’t valid JSON (${e.message}).`);
    }
    if (!Array.isArray(parsed)) throw new Error('The JSON file must contain an array of transaction objects at the top level.');
    records = parsed;
  } else if (name.endsWith('.csv')) {
    const out = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
    records = out.data;
  } else {
    throw new Error('Only .csv and .json files are supported.');
  }
  if (records.length === 0) throw new Error('The file has a header but no rows.');

  const headers = Object.keys(records[0] || {});
  const byNorm = Object.fromEntries(headers.map((h) => [norm(h), h]));
  const mapping = {};
  COLUMNS.forEach((c) => {
    const hit = [c.key, ...c.aliases].find((a) => byNorm[norm(a)] !== undefined);
    mapping[c.key] = hit ? byNorm[norm(hit)] : null;
  });
  const missing = COLUMNS.filter((c) => c.required && !mapping[c.key]).map((c) => c.key);

  const rows = [];
  const skipped = [];
  if (missing.length === 0) {
    records.forEach((rec, i) => {
      const line = name.endsWith('.csv') ? i + 2 : i + 1;
      const pick = (k) => (mapping[k] ? rec[mapping[k]] : undefined);
      const text = (k) => String(pick(k) ?? '').trim();

      const amount = toNumber(pick('amount'));
      const date = toDate(pick('transaction_date'));
      const est = toNumber(pick('estimated_cost'));
      const bidders = toNumber(pick('num_bidders'));

      let reason = null;
      if (!text('vendor_id')) reason = 'vendor_id is blank';
      else if (!text('vendor_name')) reason = 'vendor_name is blank';
      else if (!text('department')) reason = 'department is blank';
      else if (amount === null) reason = 'amount is blank';
      else if (Number.isNaN(amount)) reason = `amount “${pick('amount')}” is not a number`;
      else if (amount < 0) reason = 'amount is negative';
      else if (!date) reason = text('transaction_date') ? `date “${text('transaction_date')}” is not recognised` : 'transaction_date is blank';

      if (reason) return skipped.push({ line, reason });
      rows.push({
        vendor_id: text('vendor_id').slice(0, 50),
        vendor_name: text('vendor_name').slice(0, 100),
        department: text('department').slice(0, 100),
        amount,
        location: text('location').slice(0, 100) || null,
        transaction_date: date,
        estimated_cost: est !== null && !Number.isNaN(est) && est >= 0 ? est : null,
        num_bidders: bidders !== null && !Number.isNaN(bidders) ? Math.round(bidders) : null,
      });
    });
  }

  return { rows, skipped, mapping, missing, total: records.length, headers };
}

export const SAMPLE_CSV = `vendor_id,vendor_name,department,amount,location,transaction_date,estimated_cost,num_bidders
V001,ABC Infra Pvt Ltd,Health,420000,Delhi,2025-01-01,400000,4
V001,ABC Infra Pvt Ltd,Health,430000,Delhi,2025-01-02,420000,5
V002,Sunrise Medical Supplies,Health,185000,Jaipur,2025-01-03,180000,3
V003,TechNova Systems,IT,9800000,Mumbai,2025-01-04,4200000,1
V004,Rapid Logistics,Transport,76000,Patna,2025-01-05,80000,6
V005,GreenBuild Contractors,Public Works,2350000,Noida,2025-01-06,2300000,4
`;
