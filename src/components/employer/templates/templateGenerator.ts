/**
 * XLSX Template Generator
 * 
 * Generates enterprise-grade Excel templates with:
 * - Data sheet with headers and example rows
 * - Instructions sheet with field definitions
 * - Validation notes
 */

import * as XLSX from 'xlsx';
import { TemplateDefinition } from './templateDefinitions';

export function generateXLSXTemplate(template: TemplateDefinition): void {
  const workbook = XLSX.utils.book_new();

  // =========================================
  // Sheet 1: Data (main import sheet)
  // =========================================
  
  // Create headers with required field markers
  const headers = template.fields.map(f => 
    f.required ? `${f.name} *` : f.name
  );
  
  // Create example data rows
  const dataRows = template.exampleRows.map(row => 
    template.fields.map(f => row[f.name] ?? '')
  );
  
  const dataSheet = XLSX.utils.aoa_to_sheet([
    headers,
    ...dataRows,
  ]);
  
  // Set column widths
  const colWidths = template.fields.map(f => ({
    wch: Math.max(f.name.length + 3, f.example.length + 2, 15)
  }));
  dataSheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data');

  // =========================================
  // Sheet 2: Instructions
  // =========================================
  
  const instructionsData: (string | number)[][] = [
    [`${template.name} - Import Instructions`],
    [''],
    ['FIELD REFERENCE'],
    ['Field Name', 'Required', 'Type', 'Format/Values', 'Description', 'Example'],
  ];
  
  template.fields.forEach(field => {
    let formatInfo = field.format || '';
    if (field.type === 'enum' && field.enumValues) {
      formatInfo = field.enumValues.join(', ');
    } else if (field.type === 'boolean') {
      formatInfo = 'true, false';
    } else if (field.type === 'currency') {
      formatInfo = 'Numeric (AED)';
    }
    
    instructionsData.push([
      field.name,
      field.required ? 'YES' : 'No',
      field.type,
      formatInfo,
      field.description,
      field.example,
    ]);
  });
  
  instructionsData.push(['']);
  instructionsData.push(['IMPORTANT NOTES']);
  
  template.notes.forEach((note, i) => {
    instructionsData.push([`${i + 1}. ${note}`]);
  });
  
  instructionsData.push(['']);
  instructionsData.push(['ENUM VALUES REFERENCE']);
  
  template.fields.filter(f => f.type === 'enum' && f.enumValues).forEach(field => {
    instructionsData.push([`${field.name}:`, ...field.enumValues!]);
  });
  
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  
  // Style the instructions sheet with column widths
  instructionsSheet['!cols'] = [
    { wch: 25 }, // Field name
    { wch: 10 }, // Required
    { wch: 12 }, // Type
    { wch: 35 }, // Format
    { wch: 45 }, // Description
    { wch: 25 }, // Example
  ];
  
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

  // =========================================
  // Sheet 3: Validation Rules
  // =========================================
  
  const validationData: string[][] = [
    ['Validation Rules'],
    [''],
    ['Rule', 'Description'],
    ['Required Fields', 'Fields marked with * are mandatory and cannot be empty'],
    ['Date Format', 'All dates must be in YYYY-MM-DD format (e.g., 2024-01-15)'],
    ['Currency Values', 'Numeric values only, no currency symbols. All amounts in AED'],
    ['Boolean Values', 'Use "true" or "false" (lowercase)'],
    ['Enum Fields', 'Must match one of the allowed values listed in Instructions'],
    ['Unique Fields', 'Employee ID and other identifiers must be unique'],
    ['References', 'Referenced IDs (department_code, grade_code) must exist in your org'],
    [''],
    ['COMMON ERRORS AND FIXES'],
    ['Error', 'Cause', 'Fix'],
    ['Invalid date format', 'Date not in YYYY-MM-DD', 'Reformat dates using YYYY-MM-DD'],
    ['Missing required field', 'Required column is empty', 'Fill in all required (*) fields'],
    ['Invalid enum value', 'Value not in allowed list', 'Check Instructions sheet for valid values'],
    ['Duplicate ID', 'Same ID appears multiple times', 'Ensure all IDs are unique'],
    ['Reference not found', 'Code doesn\'t exist in system', 'Verify codes match your org structure'],
  ];
  
  const validationSheet = XLSX.utils.aoa_to_sheet(validationData);
  validationSheet['!cols'] = [
    { wch: 25 },
    { wch: 40 },
    { wch: 45 },
  ];
  
  XLSX.utils.book_append_sheet(workbook, validationSheet, 'Validation Rules');

  // =========================================
  // Download the file
  // =========================================
  
  const fileName = `${template.id}_template.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function generateCSVTemplate(template: TemplateDefinition): void {
  const workbook = XLSX.utils.book_new();
  
  const headers = template.fields.map(f => f.name);
  const dataRows = template.exampleRows.map(row => 
    template.fields.map(f => row[f.name] ?? '')
  );
  
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Data');
  
  const fileName = `${template.id}_template.csv`;
  XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
}
