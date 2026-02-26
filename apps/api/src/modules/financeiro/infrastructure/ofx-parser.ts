/**
 * Simple OFX/QFX parser for bank statement import.
 * Parses OFX XML format (SGML variant) used by Brazilian banks.
 * Extracts STMTTRN entries (statement transactions).
 */

export interface OFXTransaction {
  entryDate: string; // YYYY-MM-DD
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  externalId: string;
}

export function parseOFX(content: string): OFXTransaction[] {
  const transactions: OFXTransaction[] = [];

  // Clean up SGML to make it parseable
  // OFX uses SGML without closing tags sometimes
  const text = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Find all STMTTRN blocks
  const stmtPattern = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>)|(?=<\/BANKTRANLIST))/gi;
  let match;

  while ((match = stmtPattern.exec(text)) !== null) {
    const block = match[1];

    const trnType = extractTag(block, 'TRNTYPE');
    const dtPosted = extractTag(block, 'DTPOSTED');
    const trnAmt = extractTag(block, 'TRNAMT');
    const fitId = extractTag(block, 'FITID');
    const memo = extractTag(block, 'MEMO') || extractTag(block, 'NAME') || '';

    if (dtPosted && trnAmt) {
      const amount = parseFloat(trnAmt.replace(',', '.'));
      const entryDate = parseOFXDate(dtPosted);

      transactions.push({
        entryDate,
        amount: Math.abs(amount),
        type: amount >= 0 ? 'credit' : 'debit',
        description: memo.trim(),
        externalId: fitId || `${entryDate}-${amount}-${memo.substring(0, 20)}`,
      });
    }
  }

  return transactions;
}

function extractTag(block: string, tag: string): string | null {
  // Try XML style first: <TAG>value</TAG>
  const xmlPattern = new RegExp(`<${tag}>([^<]*)<\/${tag}>`, 'i');
  const xmlMatch = block.match(xmlPattern);
  if (xmlMatch) return xmlMatch[1].trim();

  // Try SGML style: <TAG>value\n
  const sgmlPattern = new RegExp(`<${tag}>([^\\n<]+)`, 'i');
  const sgmlMatch = block.match(sgmlPattern);
  if (sgmlMatch) return sgmlMatch[1].trim();

  return null;
}

function parseOFXDate(dateStr: string): string {
  // OFX dates: YYYYMMDD or YYYYMMDDHHMMSS or YYYYMMDD120000[-3:BRT]
  const clean = dateStr.replace(/\[.*\]/, '').trim();
  const year = clean.substring(0, 4);
  const month = clean.substring(4, 6);
  const day = clean.substring(6, 8);
  return `${year}-${month}-${day}`;
}
