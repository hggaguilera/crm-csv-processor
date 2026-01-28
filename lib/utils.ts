import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InputRow, OutputRow } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stageToStatusMap(stage: string): string {
  const mapping: { [key: string]: string } = {
    Lead: 'New',
    'Is Agent': 'Non-Client',
    'Hot Prospect': 'Engaged',
    'Short Nurture': 'In Contact',
    'Long Nurture': 'Nurture',
    Pending: 'In Contract',
    'Past Client': 'Closed',
    'Not Interested': 'Inactive',
  };
  return mapping[stage] || 'Unknown';
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function formatShortUSDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const matchShortFormat = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  const matchLongFormat = trimmed.match(/^(\d{4})\-(\d{1,2})\-(\d{1,2})$/);
  // console.log('Date match result:', match);
  // if (!matchShortFormat || !matchLongFormat) return '';

  if (matchShortFormat) {
    let [, month, day, year] = matchShortFormat;
    // Pad month/day
    month = month.padStart(2, '0');
    day = day.padStart(2, '0');

    // Convert yy → yyyy
    const fullYear = Number(year) >= 50 ? `19${year}` : `20${year}`;

    return `${month}/${day}/${fullYear}`;
  }

  if (matchLongFormat) {
    let [, year, month, day] = matchLongFormat;

    month = month.padStart(2, '0');
    day = day.padStart(2, '0');

    return `${month}/${day}/${year}`;
  }
  return '';
}

export function getRelationshipIndexes(headers: string[]): number[] {
  const indexes = new Set<number>();

  headers.forEach((h) => {
    const match = h.match(/^Relationship (\d+)\s+/);
    if (match) {
      indexes.add(Number(match[1]));
    }
  });

  return Array.from(indexes).sort((a, b) => a - b);
}

export function buildRelationshipContacts(
  row: InputRow,
  index: number,
): OutputRow | null {
  const prefix = `Relationship ${index}`;

  const first = (row[`${prefix} First Name`] || '').trim();
  const last = (row[`${prefix} Last Name`] || '').trim();
  const email = (row[`${prefix} Email 1`] || '').trim();
  const phone = (row[`${prefix} Phone 1`] || '').trim();

  if (!first && !last && !email && !phone) return null;

  const contact: OutputRow = {};

  if (first) contact['First Name'] = first;
  if (last) contact['Last Name'] = last;
  if (first || last) {
    contact['Full Name'] = [first, last].filter(Boolean).join(' ');
  }
  if (phone) contact['Phone'] = phone;
  if (email) contact['Email'] = email;

  return contact;
}

export function normalizeEncoding(row: InputRow): InputRow {
  const normalizedRow: InputRow = {};

  for (const key in row) {
    const normalizedValue = row[key]
      .normalize('NFC')
      .replace(/‚Äôs/g, '’s')
      .replace(/‚Äô/g, '’')
      .replace(/‚Ä“/g, '“')
      .replace(/‚Ä�/g, '”')
      .replace(/â€”/g, '—')
      .replace(/â€“/g, '–')
      .replace(/â€¦/g, '…');

    normalizedRow[key] = normalizedValue;
  }

  return normalizedRow;
}
