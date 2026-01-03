
import { NUMEROLOGY_MAP, VOWELS } from '../constants';
import { NumerologyResults } from '../types';

const reduceNumber = (num: number, keepMaster: boolean = true): number => {
  if (keepMaster && [11, 22, 33].includes(num)) return num;
  if (num < 10) return num;
  const sum = String(num).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  return reduceNumber(sum, keepMaster);
};

const getLetterValue = (letter: string): number => {
  const normalized = letter.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Special handling for Ñ as per manual
  if (normalized === 'N' && letter.toUpperCase() === 'Ñ') return 5;
  return NUMEROLOGY_MAP[normalized] || 0;
};

export const calculateNumerology = (fullName: string, birthDate: string): NumerologyResults => {
  const normalizedFullName = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, (match, offset, str) => {
    return str[offset-1] === 'n' || str[offset-1] === 'N' ? match : '';
  });
  
  const letters = normalizedFullName.toUpperCase().replace(/[^A-ZÑ]/g, '').split('');
  
  // Soul: Vowels
  const soulSum = letters
    .filter(l => VOWELS.includes(l))
    .reduce((acc, l) => acc + getLetterValue(l), 0);
  const soul = reduceNumber(soulSum);

  // Personality: Consonants
  const personalitySum = letters
    .filter(l => !VOWELS.includes(l))
    .reduce((acc, l) => acc + getLetterValue(l), 0);
  const personality = reduceNumber(personalitySum);

  // Life Path: Birth Date
  const [yearStr, monthStr, dayStr] = birthDate.split('-');
  const hasYear = yearStr !== '0000' && yearStr !== '';
  const dVal = dayStr ? reduceNumber(parseInt(dayStr)) : 0;
  const mVal = monthStr ? reduceNumber(parseInt(monthStr)) : 0;
  
  let lifePath: number | null = null;
  if (hasYear && yearStr) {
    const yVal = reduceNumber(String(yearStr).split('').reduce((acc, d) => acc + parseInt(d), 0));
    lifePath = reduceNumber(dVal + mVal + yVal);
  }

  // Cosmic Mission: Soul + Personality
  const cosmicMission = reduceNumber(soulSum + personalitySum);

  // Personal Year
  let personalYear: number | null = null;
  if (hasYear) {
    const currentYear = new Date().getFullYear();
    personalYear = reduceNumber(dVal + mVal + reduceNumber(currentYear));
  }

  // Inclusion
  const inclusion: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  letters.forEach(l => {
    const val = getLetterValue(l);
    if (val > 0 && val <= 9) inclusion[val]++;
  });

  const karmicLessons = Object.entries(inclusion)
    .filter(([_, count]) => count === 0)
    .map(([num, _]) => parseInt(num));

  const maxFreq = Math.max(...Object.values(inclusion));
  const majorGifts = Object.entries(inclusion)
    .filter(([_, count]) => count === maxFreq && count > 0)
    .map(([num, _]) => parseInt(num));

  return { soul, personality, lifePath, cosmicMission, personalYear, inclusion, karmicLessons, majorGifts };
};
