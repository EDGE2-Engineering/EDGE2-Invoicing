/**
 * Document type code mapping and ID generation utility.
 *
 * Format: EESIPL/{YYYY}/{MM}/{CODE}/{NNN}
 *   - YYYY  = current 4-digit year
 *   - MM    = current 2-digit month (01–12)
 *   - CODE  = 2-letter document type code
 *   - NNN   = 3-digit sequential number (random, zero-padded)
 */

const DOC_TYPE_CODES = {
    'Quotation': 'QN',
    'Tax Invoice': 'TI',
    'Proforma Invoice': 'PI',
    'Purchase Order': 'PO',
    'Delivery Challan': 'DC',
};

/**
 * Generate a document ID based on the given document type.
 *
 * @param {string} docType – One of: Quotation, Tax Invoice, Proforma Invoice,
 *                           Purchase Order, Delivery Challan
 * @returns {string} e.g. "EESIPL/2026/02/QN/001"
 */
export const generateDocIDByDocType = (docType = 'Quotation') => {
    const code = DOC_TYPE_CODES[docType] || 'QN';
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `EESIPL/${yyyy}/${mm}/${code}/${seq}`;
};
