
export enum Gender {
  MALE = 'Masculino',
  FEMALE = 'Femenino',
  OTHER = 'Otro'
}

export enum MaritalStatus {
  SINGLE = 'Soltero/a',
  MARRIED = 'Casado/a',
  DIVORCED = 'Divorciado/a',
  WIDOWED = 'Viudo/a'
}

export enum RelationshipType {
  PARENT = 'Padre/Madre',
  GRANDPARENT = 'Abuelo/a',
  GREAT_GRANDPARENT = 'Bisabuelo/a',
  SIBLING = 'Hermano/a',
  CHILD = 'Hijo/a',
  PARTNER = 'Pareja',
  UNCLE_AUNT = 'Tío/a',
  COUSIN = 'Primo/a',
  GODCHILD = 'Ahijada/o',
  FRIEND = 'Amigo/a',
  MENTOR = 'Mentor/Guía',
  OTHER = 'Otro'
}

export type EventType = 'Nacimiento' | 'Matrimonio' | 'Divorcio' | 'Muerte' | 'Migración' | 'Trauma' | 'Logro' | 'Adopción' | 'Relación no resuelta';

export interface LifeEvent {
  id: string;
  type: EventType;
  date: string;
  location?: string;
  description: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  nicknames?: string;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  maritalStatus?: MaritalStatus;
  religion?: string;
  profession?: string;
  formation?: string;
  characteristics?: string;
  gender: Gender;
  relationshipType?: RelationshipType;
  events: LifeEvent[];
  notes?: string;
  parentId?: string;
  partnerId?: string;
}

export interface NumerologyResults {
  soul: number;
  personality: number;
  lifePath: number | null;
  cosmicMission: number;
  personalYear: number | null;
  inclusion: Record<number, number>;
  karmicLessons: number[];
  majorGifts: number[];
}

export interface Sefira {
  id: number;
  name: string;
  hebrewName: string;
  translation: string;
  description: string;
  energy: string;
  color: string;
  associations: string;
  planet?: string;
  divineName?: string;
  arcana?: string;
  dominion?: string;
}
