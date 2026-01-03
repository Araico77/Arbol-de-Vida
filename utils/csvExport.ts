
import { Person, RelationshipType, Gender, MaritalStatus } from '../types';

export const exportToCSV = (user: Person, family: Person[]) => {
  const headers = [
    'id', 'firstName', 'lastName', 'nicknames', 'birthDay', 'birthMonth', 'birthYear', 
    'gender', 'relationshipType', 'profession', 'formation', 'characteristics'
  ];

  const rows = [user, ...family].map(p => [
    p.id, p.firstName, p.lastName, p.nicknames || '', p.birthDay || '', p.birthMonth || '', p.birthYear || '',
    p.gender, p.relationshipType || 'SELF', p.profession || '', p.formation || '', p.characteristics || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `datos_arbol_vida_${user.firstName || 'export'}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importFromCSV = (csvText: string): { user: Person; family: Person[] } | null => {
  try {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return null;

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const dataRows = lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let char of line) {
        if (char === '"' && !inQuotes) inQuotes = true;
        else if (char === '"' && inQuotes) inQuotes = false;
        else if (char === ',' && !inQuotes) {
          values.push(current);
          current = '';
        } else current += char;
      }
      values.push(current);
      return values.map(v => v.replace(/"/g, '').trim());
    });

    const people: Person[] = dataRows.map(row => {
      const p: any = { events: [] };
      headers.forEach((header, index) => {
        p[header] = row[index];
      });
      return p as Person;
    });

    // Fix: cast p.relationshipType to unknown and then string to allow comparison with 'SELF', 
    // which is the special marker string for the primary user in the exported CSV format.
    const user = people.find(p => (p.relationshipType as unknown as string) === 'SELF') || people[0];
    const family = people.filter(p => p.id !== user.id);

    return { user, family };
  } catch (e) {
    console.error('Error parsing CSV', e);
    return null;
  }
};
