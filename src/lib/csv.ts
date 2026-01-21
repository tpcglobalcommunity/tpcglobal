/**
 * CSV Helper Functions
 * Converts arrays of objects to CSV format with proper escaping
 */

export function toCSV(rows: any[], headers?: string[]): string {
  if (!rows || rows.length === 0) {
    return headers?.join(',') || '';
  }

  // Use provided headers or extract from first row
  const csvHeaders = headers || Object.keys(rows[0]);
  
  // Escape CSV values (handle quotes, commas, newlines)
  const escapeValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };

  // Convert each row to CSV line
  const csvLines = [
    csvHeaders.join(','),
    ...rows.map(row => 
      csvHeaders.map(header => escapeValue(row[header])).join(',')
    )
  ];

  return csvLines.join('\n');
}

export function downloadCSV(filename: string, rows: any[], headers?: string[]): void {
  const csvContent = toCSV(rows, headers);
  downloadTextFile(filename, csvContent, 'text/csv;charset=utf-8;');
}

/**
 * Format date for filename (YYYYMMDD-HHMM)
 */
export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}-${hours}${minutes}`;
}
