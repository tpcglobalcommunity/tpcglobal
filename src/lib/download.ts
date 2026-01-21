/**
 * Download Helper Functions
 * Downloads text content as files in the browser
 */

export function downloadTextFile(filename: string, content: string, mime: string = 'text/plain;charset=utf-8'): void {
  // Create blob with content
  const blob = new Blob([content], { type: mime });
  
  // Create download URL
  const url = URL.createObjectURL(blob);
  
  // Create temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to body, click, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke URL to free memory
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, data: any, pretty: boolean = false): void {
  const jsonString = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  downloadTextFile(filename, jsonString, 'application/json;charset=utf-8');
}

export function downloadCSV(filename: string, content: string): void {
  downloadTextFile(filename, content, 'text/csv;charset=utf-8;');
}
