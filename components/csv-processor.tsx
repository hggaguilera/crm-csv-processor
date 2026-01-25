'use client';

import React from 'react';

import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
} from 'lucide-react';

// utils
import { stageToStatusMap, titleCase } from '@/lib/utils';
import {
  BACKGROUND_FIELDS,
  WEBSITE_FIELDS,
  EMAIL_FIELDS,
} from '@/lib/constants';

interface InputRow {
  [key: string]: string;
}

interface OutputRow {
  [key: string]: string;
}

/**
 * Transform function that maps input rows to output rows.
 * Customize this function to define your CSV transformation logic.
 *
 * Example transformation:
 * - Concatenates firstName + lastName into fullName
 * - Concatenates city + state + zip into fullAddress
 * - Preserves email as-is
 */
function transformRow(row: InputRow, headers: string[]): OutputRow | null {
  // Skip empty rows (all values are empty or whitespace)
  const hasContent = Object.values(row).some((val) => val && val.trim() !== '');
  if (!hasContent) return null;

  const output: OutputRow = {};

  // if ('Date Added' in row) {
  //   output['Date Created'] = (row['Date Added'] || '').trim();
  // }

  if ('Name' in row) {
    output['Full Name'] = (row['Name'] || '').trim();
  }

  if ('First Name' in row || 'Last Name' in row) {
    output['First Name'] = (row['First Name'] || '').trim();
    output['Last Name'] = (row['Last Name'] || '').trim();
  }

  if ('Stage' in row) {
    output['Status'] = stageToStatusMap((row['Stage'] || '').trim());
  }

  if ('Phone 1' in row) {
    output['Phone'] = (row['Phone 1'] || '').trim();
  }

  // if ('Lead Source' in row) {
  //   output['Source'] = (row['Lead Source'] || '').trim();
  // }

  // if ('Assigned To' in row) {
  //   output['Assigned Agent'] = (row['Assigned To'] || '').trim();
  // }

  if ('Tags' in row) {
    output['Tags'] = (row['Tags'] || '').trim();
  }

  if ('Calls' in row) {
    output['Calls'] = (row['Calls'] || '').trim();
  }

  if ('Texts' in row) {
    output['Texts'] = (row['Texts'] || '').trim();
  }

  if (
    'Address 1 - City' in row ||
    'Address 1 - Country' in row ||
    'Address 1 - Street' in row ||
    'Address 1 - State' in row ||
    'Address 1 - Zip' in row
  ) {
    output['Home Address City'] = (row['Address 1 - City'] || '').trim();
    output['Home Address Country'] = (row['Address 1 - Country'] || '').trim();
    output['Home Address Line 1'] = (row['Address 1 - Street'] || '').trim();
    output['Home Address State'] = (row['Address 1 - State'] || '').trim();
    output['Home Address Zip'] = (row['Address 1 - Zip'] || '').trim();
  }

  if (
    'Address 2 - City' in row ||
    'Address 2 - Country' in row ||
    'Address 2 - Street' in row ||
    'Address 2 - State' in row ||
    'Address 2 - Zip' in row
  ) {
    output['Work Address City'] = (row['Address 2 - City'] || '').trim();
    output['Work Address Country'] = (row['Address 2 - Country'] || '').trim();
    output['Work Address Line 1'] = (row['Address 2 - Street'] || '').trim();
    output['Work Address State'] = (row['Address 2 - State'] || '').trim();
    output['Work Address Zip'] = (row['Address 2 - Zip'] || '').trim();
  }

  if ('Notes' in row) {
    output['Note'] = (row['Notes'] || '').trim();
  }

  // if ('Anniversary' in row) {
  //   output['Important Occasion'] = (row['Anniversary'] || '').trim();
  // }

  if ('Birthday' in row) {
    output['Birthday'] = (row['Birthday'] || '').trim();
  }

  if ('Deal Close Date' in row) {
    output['Home Anniversary'] = (row['Deal Close Date'] || '').trim();
  }

  // Background fields concatenation
  const backgroundLines: string[] = [];

  for (const field of BACKGROUND_FIELDS) {
    const rawValue = row[field.key];

    if (rawValue && rawValue.trim() !== '') {
      backgroundLines.push(`${field.label}: ${rawValue.trim()}`);
    }
  }

  if (backgroundLines.length > 0) {
    output['Key Background Info'] = backgroundLines.join('\n');
  }

  // Website fields concatenation
  const websiteLines: string[] = [];

  for (const field of WEBSITE_FIELDS) {
    const rawValue = row[field.key];

    if (rawValue && rawValue.trim() !== '') {
      websiteLines.push(`${field.label}: ${rawValue.trim()}`);
    }
  }

  if (websiteLines.length > 0) {
    output['Website'] = websiteLines.join('\n');
  }

  // Email fields concatenation
  const emailLines: string[] = [];
  const emailTypesLines: string[] = [];

  for (const field of EMAIL_FIELDS) {
    const emailValue = row[field.key];
    const typeValue = row[field.label];

    if (emailValue && emailValue.trim() !== '') {
      emailLines.push(emailValue.trim());
    }

    if (typeValue && typeValue.trim() !== '') {
      emailTypesLines.push(typeValue.trim());
    }
  }

  if (emailLines.length > 0) {
    output['Email'] = emailLines.join(', ');
  }

  return output;
}

export function CsvProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<InputRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<OutputRow[]>([]);
  const [isProcessed, setIsProcessed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null);
    setIsProcessed(false);
    setProcessedData([]);

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);

    Papa.parse<InputRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Parse error: ${results.errors[0].message}`);
          return;
        }
        setHeaders(results.meta.fields || []);
        setParsedData(results.data);
      },
      error: (err) => {
        setError(`Failed to parse file: ${err.message}`);
      },
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processFile = () => {
    if (parsedData.length === 0) {
      setError('No data to process');
      return;
    }

    const transformed = parsedData
      .map((row) => transformRow(row, headers))
      .filter((row): row is OutputRow => row !== null);

    setProcessedData(transformed);
    setIsProcessed(true);
  };

  const downloadCsv = () => {
    if (processedData.length === 0) return;

    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `processed_${file?.name || 'output.csv'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setProcessedData([]);
    setIsProcessed(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          CSV Processor
        </CardTitle>
        <CardDescription>
          Upload a CSV file, process it, and download the transformed result
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Drag and drop a CSV file here, or click to browse
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {/* File Info */}
        {file && !error && (
          <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({parsedData.length} rows, {headers.length} columns)
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Processed Status */}
        {isProcessed && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Processed {processedData.length} rows successfully
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={processFile}
            disabled={!file || parsedData.length === 0}
            className="flex-1"
          >
            Process File
          </Button>
          <Button
            onClick={downloadCsv}
            disabled={!isProcessed || processedData.length === 0}
            variant="secondary"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>

        {/* Preview Section */}
        {isProcessed && processedData.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Preview (first 5 rows)</h3>
            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    {Object.keys(processedData[0]).map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left font-medium"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedData.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t">
                      {Object.values(row).map((value, j) => (
                        <td
                          key={j}
                          className="px-3 py-2 max-w-[200px] truncate"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
