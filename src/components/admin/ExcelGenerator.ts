import * as XLSX from 'xlsx';
import { TemplateSection, allTemplates } from './MigrationTemplates';

// Generate sample data for templates
const generateSampleData = (template: TemplateSection): Record<string, any>[] => {
  const samples: Record<string, any>[] = [];
  
  // Create 3 sample rows
  for (let i = 0; i < 3; i++) {
    const row: Record<string, any> = {};
    template.fields.forEach(field => {
      // Use the example value with index suffix for uniqueness
      if (field.example.includes('EMP-') || field.example.includes('VND-') || 
          field.example.includes('OFF-') || field.example.includes('HP-') ||
          field.example.includes('SCH-') || field.example.includes('AREA-')) {
        row[field.name] = field.example.replace(/(\d+)$/, `${parseInt('$1') || 0 + i + 1}`);
      } else if (field.type === 'Email' && i > 0) {
        row[field.name] = field.example.replace('@', `${i + 1}@`);
      } else if (field.type === 'Decimal' || field.type === 'Integer') {
        row[field.name] = field.example;
      } else {
        row[field.name] = field.example;
      }
    });
    samples.push(row);
  }
  
  return samples;
};

// Generate Excel workbook for a single template
export const generateTemplateExcel = (template: TemplateSection): XLSX.WorkBook => {
  const wb = XLSX.utils.book_new();
  
  // Create data sheet with headers and sample data
  const headers = template.fields.map(f => f.name);
  const sampleData = generateSampleData(template);
  const dataRows = sampleData.map(row => headers.map(h => row[h]));
  
  const dataSheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  
  // Set column widths
  const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
  dataSheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, dataSheet, 'Data');
  
  // Create field specifications sheet
  const specHeaders = ['Field Name', 'Type', 'Required', 'Description', 'Example', 'Validation'];
  const specRows = template.fields.map(f => [
    f.name,
    f.type,
    f.required ? 'Yes' : 'No',
    f.description,
    f.example,
    f.validation || ''
  ]);
  
  const specSheet = XLSX.utils.aoa_to_sheet([specHeaders, ...specRows]);
  specSheet['!cols'] = [
    { wch: 30 },
    { wch: 12 },
    { wch: 10 },
    { wch: 50 },
    { wch: 30 },
    { wch: 40 }
  ];
  
  XLSX.utils.book_append_sheet(wb, specSheet, 'Field Specifications');
  
  // Create notes sheet
  if (template.notes && template.notes.length > 0) {
    const notesSheet = XLSX.utils.aoa_to_sheet([
      ['Important Notes'],
      ...template.notes.map(n => [n])
    ]);
    notesSheet['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, notesSheet, 'Notes');
  }
  
  return wb;
};

// Download a single template
export const downloadTemplate = (template: TemplateSection): void => {
  const wb = generateTemplateExcel(template);
  XLSX.writeFile(wb, `${template.id}_template.xlsx`);
};

// Generate complete migration package with all templates
export const generateCompleteMigrationPackage = (): XLSX.WorkBook => {
  const wb = XLSX.utils.book_new();
  
  // Add index sheet
  const indexHeaders = ['Template Name', 'Sheet Name', 'Description', 'Fields Count', 'Required Fields'];
  const indexRows = allTemplates.map(t => [
    t.title,
    t.id,
    t.description,
    t.fields.length,
    t.fields.filter(f => f.required).length
  ]);
  
  const indexSheet = XLSX.utils.aoa_to_sheet([indexHeaders, ...indexRows]);
  indexSheet['!cols'] = [
    { wch: 30 },
    { wch: 25 },
    { wch: 50 },
    { wch: 12 },
    { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(wb, indexSheet, 'Index');
  
  // Add each template as a separate sheet
  allTemplates.forEach(template => {
    const headers = template.fields.map(f => f.name);
    const sampleData = generateSampleData(template);
    const dataRows = sampleData.map(row => headers.map(h => row[h]));
    
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    sheet['!cols'] = headers.map(h => ({ wch: Math.max(h.length, 15) }));
    
    // Truncate sheet name if too long (Excel limit is 31 chars)
    const sheetName = template.id.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
  });
  
  // Add comprehensive field reference sheet
  const refHeaders = ['Template', 'Field Name', 'Type', 'Required', 'Description', 'Example', 'Validation'];
  const refRows: (string | number)[][] = [];
  
  allTemplates.forEach(template => {
    template.fields.forEach(field => {
      refRows.push([
        template.title,
        field.name,
        field.type,
        field.required ? 'Yes' : 'No',
        field.description,
        field.example,
        field.validation || ''
      ]);
    });
  });
  
  const refSheet = XLSX.utils.aoa_to_sheet([refHeaders, ...refRows]);
  refSheet['!cols'] = [
    { wch: 25 },
    { wch: 30 },
    { wch: 12 },
    { wch: 10 },
    { wch: 50 },
    { wch: 30 },
    { wch: 40 }
  ];
  XLSX.utils.book_append_sheet(wb, refSheet, 'Field Reference');
  
  return wb;
};

// Download complete migration package
export const downloadCompleteMigrationPackage = (): void => {
  const wb = generateCompleteMigrationPackage();
  XLSX.writeFile(wb, 'complete_migration_package.xlsx');
};

// Parse uploaded Excel file
export const parseExcelFile = async (file: File): Promise<{
  sheets: { [name: string]: Record<string, any>[] };
  errors: string[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const sheets: { [name: string]: Record<string, any>[] } = {};
        const errors: string[] = [];
        
        workbook.SheetNames.forEach(sheetName => {
          try {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            sheets[sheetName] = jsonData as Record<string, any>[];
          } catch (err) {
            errors.push(`Error parsing sheet "${sheetName}": ${err}`);
          }
        });
        
        resolve({ sheets, errors });
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

// Validate data against template
export const validateData = (
  data: Record<string, any>[],
  template: TemplateSection
): { valid: boolean; errors: { row: number; field: string; message: string }[] } => {
  const errors: { row: number; field: string; message: string }[] = [];
  
  data.forEach((row, index) => {
    template.fields.forEach(field => {
      const value = row[field.name];
      
      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          row: index + 2, // +2 for 1-indexed and header row
          field: field.name,
          message: `Required field "${field.name}" is missing`
        });
        return;
      }
      
      // Skip validation for empty optional fields
      if (!field.required && (value === undefined || value === null || value === '')) {
        return;
      }
      
      // Type-specific validation
      switch (field.type) {
        case 'Email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
            errors.push({
              row: index + 2,
              field: field.name,
              message: `Invalid email format for "${field.name}"`
            });
          }
          break;
          
        case 'Date':
          if (value && isNaN(Date.parse(String(value)))) {
            errors.push({
              row: index + 2,
              field: field.name,
              message: `Invalid date format for "${field.name}". Expected YYYY-MM-DD`
            });
          }
          break;
          
        case 'Decimal':
        case 'Integer':
          if (value && isNaN(Number(value))) {
            errors.push({
              row: index + 2,
              field: field.name,
              message: `Invalid number format for "${field.name}"`
            });
          }
          break;
          
        case 'Boolean':
          const boolValue = String(value).toLowerCase();
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(boolValue)) {
            errors.push({
              row: index + 2,
              field: field.name,
              message: `Invalid boolean value for "${field.name}". Expected true/false`
            });
          }
          break;
          
        case 'URL':
          if (value && !/^https?:\/\/.+/.test(String(value))) {
            errors.push({
              row: index + 2,
              field: field.name,
              message: `Invalid URL format for "${field.name}"`
            });
          }
          break;
          
        case 'Enum':
          if (field.validation && value) {
            const validValues = field.validation.split(',').map(v => v.trim().toLowerCase());
            if (!validValues.includes(String(value).toLowerCase())) {
              errors.push({
                row: index + 2,
                field: field.name,
                message: `Invalid value for "${field.name}". Expected one of: ${field.validation}`
              });
            }
          }
          break;
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};
