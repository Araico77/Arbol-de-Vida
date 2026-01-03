
import { GoogleGenAI } from "@google/genai";
import { Person, NumerologyResults } from '../types';

export const getGeminiAnalysis = async (user: Person, numerology: NumerologyResults, relatives: Person[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Realiza un análisis EXHAUSTIVO basado en el manual "Árbol de la Vida: Genealogía, Numerología y Estructura Familiar".
    
    PERSONA PRINCIPAL: ${user.firstName} ${user.lastName}
    NACIMIENTO: ${user.birthDate}
    CARACTERÍSTICAS: ${user.characteristics || 'N/A'}
    
    RESULTADOS NUMEROLÓGICOS:
    - Alma: ${numerology.soul}, Personalidad: ${numerology.personality}
    - Camino de Vida: ${numerology.lifePath || 'N/A'} (Ciclos de 9 años: 0-9, 9-18, 18-27, 27-36, 36-45...)
    - Misión Cósmica: ${numerology.cosmicMission}
    - Dones: ${numerology.majorGifts.join(', ')}
    
    SISTEMA FAMILIAR:
    ${relatives.map(r => `- ${r.firstName} [${r.relationshipType}], Nac: ${r.birthDate}, Características: ${r.characteristics || 'N/A'}`).join('\n')}
    
    OBJETIVO DEL ANÁLISIS (Basado en el manual):
    1. Identifica Roles Familiares Arquetípicos (Hijo Parentalizado, Chivo Expiatorio, Favorito, Rebelde, Cuidador) en el consultante o su sistema.
    2. Analiza la Transmisión de Traumas Intergeneracionales (Aprendizaje observacional, Epigenética, Mensajes implícitos).
    3. Vincula el Camino de Vida (${numerology.lifePath}) con la Sefirá correspondiente (Ej: 5 es Gevurah: Disciplina/Rigor).
    4. Proyecta el Ciclo actual de 9 años y las transiciones generacionales.
    
    REGLAS DE FORMATO:
    Usa Markdown estructurado con títulos claros:
    
    ### I. Dinámica de Roles y Legado Ancestral
    Detecta quién ocupa qué rol en el sistema actual.
    
    ### II. Transmisión de Traumas y Sanación
    Analiza patrones de repetición (enfermedades, separaciones, crisis económicas).
    
    ### III. Integración Cabalística (Tikún)
    Cómo la Sefirá activa en su Camino de Vida ayuda a rectificar el linaje.
    
    ### IV. Proyección de Ciclos y Recomendaciones
    Acciones concretas para los próximos 12 meses y Acto de Psicomagia.
    
    Tono: Elevado, profesional, empático y profundamente analítico.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "## Error de Análisis\nOcurrió un error al procesar la sabiduría ancestral. Por favor, verifica tu conexión e intenta de nuevo.";
  }
};
