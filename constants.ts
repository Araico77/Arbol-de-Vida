
import { Sefira } from './types';

export const NUMEROLOGY_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
  'Ñ': 5
};

export const VOWELS = ['A', 'E', 'I', 'O', 'U'];

export const SEFIROT: Sefira[] = [
  { id: 1, name: 'Kether', hebrewName: 'כתר', translation: 'La Corona', description: 'Puerta de entrada a la manifestación divina, pura potencialidad.', energy: 'Voluntad absoluta', color: 'Blanco', associations: 'Blanco, punto', planet: 'Primum Mobile', divineName: 'Eheyeh ("Yo Soy")', arcana: '0 (El Loco)', dominion: 'Divinidad' },
  { id: 2, name: 'Chockmah', hebrewName: 'חכמה', translation: 'La Sabiduría', description: 'Potencia masculina activa y creativa, el "Padre".', energy: 'Sabiduría primordial', color: 'Azul', associations: 'Zodiaco', planet: 'Zodiaco', divineName: 'Jah', arcana: 'II (La Sacerdotisa)', dominion: 'Inspiración' },
  { id: 3, name: 'Binah', hebrewName: 'בינה', translation: 'La Inteligencia', description: 'Potencia femenina pasiva, la "Madre" que da forma.', energy: 'Entendimiento', color: 'Rojo negro', associations: 'Saturno', planet: 'Saturno', divineName: 'Jehovah Elohim', arcana: 'III (La Emperatriz)', dominion: 'Estructura' },
  { id: 4, name: 'Jesed', hebrewName: 'חסد', translation: 'La Misericordia', description: 'Benevolencia, Abundancia, inicio de manifestación en planos inferiores.', energy: 'Bondad expansiva', color: 'Púrpura', associations: 'Júpiter', planet: 'Júpiter', divineName: 'El', arcana: 'IV (El Emperador)', dominion: 'Expansión' },
  { id: 5, name: 'Gevurah', hebrewName: 'גבורה', translation: 'Fortaleza/Rigor', description: 'Disciplina, justicia, coraje. Equilibra la misericordia.', energy: 'Cirugía espiritual', color: 'Rojo', associations: 'Marte', planet: 'Marte', divineName: 'Elohim Gibor', arcana: 'V (El Hierofante)', dominion: 'Disciplina' },
  { id: 6, name: 'Tiferet', hebrewName: 'תפארת', translation: 'La Belleza', description: 'Corazón del árbol, centro de convergencia de senderos.', energy: 'Armonía, Yo Superior', color: 'Oro/Amarillo', associations: 'Sol', planet: 'Sol', divineName: 'Jehovah Aloah Vedaath', arcana: 'VI (Los Enamorados)', dominion: 'Consciencia elevada' },
  { id: 7, name: 'Netzah', hebrewName: 'נצח', translation: 'La Victoria', description: 'Dominio de la emoción, arte, deseo y creatividad.', energy: 'Instinto creativo', color: 'Verde', associations: 'Venus', planet: 'Venus', divineName: 'Jehovah Tzabaoth', arcana: 'VII (El Carro)', dominion: 'Pasión' },
  { id: 8, name: 'Hod', hebrewName: 'הוד', translation: 'El Esplendor', description: 'Pensamiento lógico, comunicación, análisis racional.', energy: 'Mente lógica', color: 'Naranja/Amarillo', associations: 'Mercurio', planet: 'Mercurio', divineName: 'Elohim Tzabaoth', arcana: 'VIII (La Justicia)', dominion: 'Razón' },
  { id: 9, name: 'Yesod', hebrewName: 'יסוד', translation: 'El Fundamento', description: 'Reino de los sueños, inconsciente, sustrato astral.', energy: 'Imaginación psíquica', color: 'Violeta', associations: 'Luna', planet: 'Luna', divineName: 'Elohim Tzabaoth', arcana: 'IX (El Ermitaño)', dominion: 'Sustrato Astral' },
  { id: 10, name: 'Malkuth', hebrewName: 'מלכות', translation: 'El Reino', description: 'Mundo físico donde se materializan todas las influencias.', energy: 'Realidad concreta', color: 'Multicolor', associations: 'Tierra', planet: 'Tierra', divineName: 'Adonai Melekh', arcana: 'X (La Rueda de la Fortuna)', dominion: 'Materia' }
];

export const EVENT_SYMBOLS: Record<string, string> = {
  'Matrimonio': '♥',
  'Divorcio': '✕',
  'Muerte': '†',
  'Nacimiento': '👶',
  'Migración': '→',
  'Trauma': '⚡',
  'Adopción': '◆',
  'Relación no resuelta': '∞',
  'Logro': '🏆'
};
