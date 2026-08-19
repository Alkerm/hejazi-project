import crypto from 'node:crypto';
import path from 'node:path';

/**
 * Formats a Date object to YYYYMM string (e.g. "202608")
 */
function getYearMonthString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * Formats a Date object to YYMM string (e.g. "2608")
 */
function getShortYearMonthString(date: Date = new Date()): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

/**
 * Generates a collision-proof, ZATCA-compliant Tax Invoice Number.
 * Format: INV-YYYYMM-XXXXXX (e.g. "INV-202608-A9F2B4")
 */
export function generateInvoiceNumber(date: Date = new Date()): string {
  const ym = getYearMonthString(date);
  const entropy = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INV-${ym}-${entropy}`;
}

/**
 * Generates a collision-proof Credit Note / Refund Document Number.
 * Format: REF-YYYYMM-XXXXXX (e.g. "REF-202608-3C1A7D")
 */
export function generateRefundNoteNumber(date: Date = new Date()): string {
  const ym = getYearMonthString(date);
  const entropy = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `REF-${ym}-${entropy}`;
}

/**
 * Generates a customer-friendly Order Reference Number.
 * Format: ORD-YYMM-XXXX (e.g. "ORD-2608-8F2B")
 */
export function generateOrderNumber(date: Date = new Date()): string {
  const ym = getShortYearMonthString(date);
  const entropy = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${ym}-${entropy}`;
}

/**
 * Generates an OWASP-compliant cryptographically secure random token.
 * Used for Password Reset links, Email verification, and API secrets.
 * Uses 256-bit entropy by default.
 * Example: "rst_8f3d1b99a7c4e201..."
 */
export function generateSecureToken(prefix = 'tok', byteLength = 32): string {
  const randomHex = crypto.randomBytes(byteLength).toString('hex');
  return prefix ? `${prefix}_${randomHex}` : randomHex;
}

/**
 * Generates a cryptographically secure Payment Transaction Reference.
 * Format: txn_timestamp_randomHex (e.g. "txn_1724098123_8f2b1a9c3d4e")
 */
export function generateTransactionReference(prefix = 'txn'): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const entropy = crypto.randomBytes(6).toString('hex');
  return `${prefix}_${timestamp}_${entropy}`;
}

/**
 * Generates a safe, collision-free filename for uploaded images/media.
 * Format: img_timestamp_randomHex.ext (e.g. "img_1724098123_a8b9c0.webp")
 */
export function generateSanitizedFilename(originalName: string, prefix = 'img'): string {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const timestamp = Date.now();
  const entropy = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${timestamp}_${entropy}${ext}`;
}
