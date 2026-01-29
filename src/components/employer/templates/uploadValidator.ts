/**
 * Upload Validation Engine
 * 
 * Validates uploaded files against template schemas.
 * Returns structured errors and warnings.
 */

import * as XLSX from 'xlsx';
import { TemplateDefinition, TemplateField } from './templateDefinitions';

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  errorType: 'missing_required' | 'invalid_format' | 'invalid_enum' | 'invalid_type' | 'duplicate' | 'reference_not_found';
  message: string;
  suggestion?: string;
}

export interface ValidationWarning {
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  headers: string[];
  rows: (string | number | boolean)[][];
  errors: ValidationError[];
  warnings: ValidationWarning[];
  mappingSuggestions: Record<string, string>;
  unmappedColumns: string[];
}

// Common field name mappings for auto-detection
const FIELD_ALIASES: Record<string, string[]> = {
  employee_id: ['emp_id', 'employeeid', 'staff_id', 'staffid', 'id', 'employee number', 'emp no'],
  first_name: ['firstname', 'given_name', 'givenname', 'fname'],
  last_name: ['lastname', 'surname', 'family_name', 'familyname', 'lname'],
  email: ['email_address', 'emailaddress', 'work_email', 'workemail', 'e-mail'],
  department_code: ['department', 'dept', 'dept_code', 'deptcode'],
  grade_code: ['grade', 'job_grade', 'jobgrade', 'level'],
  hire_date: ['hiredate', 'start_date', 'startdate', 'join_date', 'joindate', 'date_of_joining'],
  employment_type: ['employmenttype', 'contract_type', 'contracttype', 'emp_type', 'emptype'],
  phone: ['phone_number', 'phonenumber', 'mobile', 'contact', 'telephone'],
  date_of_birth: ['dateofbirth', 'dob', 'birthdate', 'birth_date'],
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
}

function findFieldMatch(header: string, templateFields: TemplateField[]): TemplateField | null {
  const normalizedHeader = normalizeHeader(header);
  
  // Direct match
  const directMatch = templateFields.find(f => normalizeHeader(f.name) === normalizedHeader);
  if (directMatch) return directMatch;
  
  // Alias match
  for (const field of templateFields) {
    const aliases = FIELD_ALIASES[field.name] || [];
    if (aliases.some(alias => normalizeHeader(alias) === normalizedHeader)) {
      return field;
    }
  }
  
  return null;
}

function validateField(value: string | number | boolean | undefined, field: TemplateField, row: number): ValidationError | null {
  const strValue = String(value ?? '').trim();
  
  // Required check
  if (field.required && !strValue) {
    return {
      row,
      column: field.name,
      value: strValue,
      errorType: 'missing_required',
      message: `Required field "${field.name}" is empty`,
      suggestion: `Provide a value for ${field.name}`,
    };
  }
  
  if (!strValue) return null; // Optional empty field is OK
  
  // Type-specific validation
  switch (field.type) {
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
        return {
          row,
          column: field.name,
          value: strValue,
          errorType: 'invalid_format',
          message: `Invalid date format. Expected YYYY-MM-DD, got "${strValue}"`,
          suggestion: 'Format date as YYYY-MM-DD (e.g., 2024-01-15)',
        };
      }
      break;
      
    case 'number':
    case 'currency':
      if (isNaN(Number(strValue.replace(/,/g, '')))) {
        return {
          row,
          column: field.name,
          value: strValue,
          errorType: 'invalid_type',
          message: `Expected numeric value, got "${strValue}"`,
          suggestion: 'Enter a number without currency symbols',
        };
      }
      break;
      
    case 'boolean':
      if (!['true', 'false', '1', '0', 'yes', 'no'].includes(strValue.toLowerCase())) {
        return {
          row,
          column: field.name,
          value: strValue,
          errorType: 'invalid_type',
          message: `Expected true/false, got "${strValue}"`,
          suggestion: 'Use "true" or "false"',
        };
      }
      break;
      
    case 'enum':
      if (field.enumValues && !field.enumValues.includes(strValue)) {
        return {
          row,
          column: field.name,
          value: strValue,
          errorType: 'invalid_enum',
          message: `Invalid value "${strValue}". Allowed: ${field.enumValues.join(', ')}`,
          suggestion: `Use one of: ${field.enumValues.join(', ')}`,
        };
      }
      break;
      
    case 'string':
      if (field.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
        return {
          row,
          column: field.name,
          value: strValue,
          errorType: 'invalid_format',
          message: `Invalid email format: "${strValue}"`,
          suggestion: 'Enter a valid email address',
        };
      }
      break;
  }
  
  return null;
}

export function validateUploadedFile(file: File, template: TemplateDefinition): Promise<ValidationResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1 });
        
        if (jsonData.length < 2) {
          resolve({
            isValid: false,
            totalRows: 0,
            validRows: 0,
            headers: [],
            rows: [],
            errors: [{ row: 0, column: '', value: '', errorType: 'missing_required', message: 'File must contain headers and at least one data row', suggestion: 'Add data rows after the header row' }],
            warnings: [],
            mappingSuggestions: {},
            unmappedColumns: [],
          });
          return;
        }
        
        const rawHeaders = jsonData[0];
        const headers = (Array.isArray(rawHeaders) ? rawHeaders : Object.values(rawHeaders)).map(h => String(h ?? '').trim());
        const rows = jsonData.slice(1).map(row => {
          const rowArray = Array.isArray(row) ? row : Object.values(row);
          return rowArray.map(cell => cell as string | number | boolean);
        });
        
        // Build mapping suggestions
        const mappingSuggestions: Record<string, string> = {};
        const unmappedColumns: string[] = [];
        
        headers.forEach(header => {
          const match = findFieldMatch(header, template.fields);
          if (match) {
            mappingSuggestions[header] = match.name;
          } else {
            unmappedColumns.push(header);
          }
        });
        
        // Validate rows
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const seenIds = new Set<string>();
        
        rows.forEach((row, rowIndex) => {
          const rowNumber = rowIndex + 2; // +2 for header row and 0-index
          
          template.fields.forEach((field) => {
            // Find column index for this field
            const colIndex = headers.findIndex(h => 
              mappingSuggestions[h] === field.name || normalizeHeader(h) === normalizeHeader(field.name)
            );
            
            const value = colIndex >= 0 ? row[colIndex] : undefined;
            const error = validateField(value, field, rowNumber);
            
            if (error) {
              errors.push(error);
            }
            
            // Check for duplicates on ID fields
            if (field.name.includes('_id') && field.required && value) {
              const strValue = String(value);
              if (seenIds.has(strValue)) {
                errors.push({
                  row: rowNumber,
                  column: field.name,
                  value: strValue,
                  errorType: 'duplicate',
                  message: `Duplicate ${field.name}: "${strValue}"`,
                  suggestion: 'Ensure all IDs are unique',
                });
              }
              seenIds.add(strValue);
            }
          });
        });
        
        // Add warnings for unmapped columns
        unmappedColumns.forEach(col => {
          warnings.push({
            row: 0,
            column: col,
            value: '',
            message: `Column "${col}" is not mapped to any field and will be ignored`,
          });
        });
        
        const validRows = rows.length - new Set(errors.map(e => e.row)).size;
        
        resolve({
          isValid: errors.length === 0,
          totalRows: rows.length,
          validRows,
          headers,
          rows,
          errors,
          warnings,
          mappingSuggestions,
          unmappedColumns,
        });
        
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function generateErrorReport(errors: ValidationError[]): void {
  const data = [
    ['Row', 'Column', 'Value', 'Error Type', 'Message', 'Suggestion'],
    ...errors.map(e => [e.row, e.column, e.value, e.errorType, e.message, e.suggestion || '']),
  ];
  
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet['!cols'] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 25 },
    { wch: 18 },
    { wch: 50 },
    { wch: 40 },
  ];
  
  XLSX.utils.book_append_sheet(workbook, sheet, 'Errors');
  XLSX.writeFile(workbook, 'import_errors.xlsx');
}
