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