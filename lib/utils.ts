import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (!match) return '';

  let [, month, day, year] = match;

  // Pad month/day
  month = month.padStart(2, '0');
  day = day.padStart(2, '0');

  // Convert yy → yyyy
  const fullYear = Number(year) >= 50 ? `19${year}` : `20${year}`;

  return `${month}/${day}/${fullYear}`;
}
