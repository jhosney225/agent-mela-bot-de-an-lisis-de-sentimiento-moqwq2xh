```javascript
// Bot de análisis de sentimiento de texto - Node.js
// Ejecutable con: node index.js

const readline = require('readline');

// Palabras positivas en español
const POSITIVE_WORDS = {
  'excelente': 2, 'increíble': 2, 'maravilloso': 2, 'fantástico': 2,
  'perfecto': 2, 'genial': 2, 'hermoso': 2, 'feliz': 2, 'alegre': 2,
  'amor': 2, 'amable': 2, 'brillante': 2, 'bueno': 1.5, 'bien': 1,
  'gusta': 1.5, 'me encanta': 2, 'adorable': 2, 'magnífico': 2,
  'sensacional': 2, 'espléndido': 2, 'prodigioso': 2, 'divino': 2,
  'éxito': 2, 'ganador': 2, 'campeón': 2, 'victoria': 2, 'triunfo': 2
};

// Palabras negativas en español
const NEGATIVE_WORDS = {
  'odio': -2, 'horrible': -2, 'terrible': -2, 'peor': -2, 'asqueroso': -2,
  'desastre': -2, 'fracaso': -2, 'mal': -1.5, 'malo': -1.5, 'triste': -2,
  'depresión': -2, 'miedo': -1.5, 'angustia': -1.5, 'dolor': -1.5,
  'infeliz': -2, 'desdicha': -2, 'pésimo': -2, 'detestable': -2,
  'abominable': -2, 'repugnante': -2, 'vomitivo': -2, 'asco': -2,
  'decepcionar': -2, 'decepción': -2, 'desilusión': -2, 'frustración': -1.5
};

// Intensificadores (palabras que aumentan la intensidad del sentimiento)
const INTENSIFIERS = {
  'muy': 1.5, 'extremadamente': 2, 'sumamente': 1.8, 'demasiado': 1.5,
  'increíblemente': 2, 'enormemente': 1.8, 'terriblemente': 1.8
};

// Negaciones que invierten el sentimiento
const NEGATIONS = ['no', 'ni', 'nunca', 'jamás', 'nada'];

/**
 * Análisis de sentimiento del texto
 * @param {string} text - Texto a analizar
 * @returns {object} - Resultado del análisis con puntuación y clasificación
 */
function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return {
      score: 0,
      sentiment: 'neutral',
      confidence: 0,
      details: 'Texto inválido'
    };
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let score = 0;
  let posCount = 0;
  let negCount = 0;
  let matches = [];

  // Análisis palabra por palabra
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,!?;:\-]/g, '');
    let wordScore = 0;
    
    // Verificar intensificadores
    let intensifier = 1;
    if (i > 0) {
      const prevWord = words[i - 1].replace(/[.,!?;:\-]/g, '');
      intensifier = INTENSIFIERS[prevWord] || 1;
    }
    
    // Verificar negaciones
    let isNegated = false;
    if (i > 0) {
      const prevWord = words[i - 1].replace(/[.,!?;:\-]/g, '');
      isNegated = NEGATIONS.includes(prevWord);
    }
    
    // Buscar palabra en diccionarios
    if (POSITIVE_WORDS[word]) {
      wordScore = POSITIVE_WORDS[word] * intensifier;
      if (isNegated) {
        wordScore = -wordScore;
      }
      posCount++;
      matches.push({ word, score: wordScore, type: 'positivo' });
    } else if (NEGATIVE_WORDS[word]) {
      wordScore = NEGATIVE_WORDS[word] * intensifier;
      if (isNegated) {
        wordScore = -wordScore;
      }
      negCount++;
      matches.push({ word, score: wordScore, type: 'negativo' });
    }
    
    score += wordScore;
  }

  // Normalizar puntuación
  const normalizedScore = Math.max(-1, Math.min(1, score / 10));
  
  // Determinar sentimiento
  let sentiment = 'neutral';
  let confidence = 0;

  if (normalizedScore > 0.3) {
    sentiment = 'positivo';
    confidence = Math.min(100, ((posCount / (posCount + negCount + 1)) * 100));
  } else if (normalizedScore < -0.3) {
    sentiment = 'negativo';
    confidence = Math.min(100, ((negCount / (posCount + negCount + 1)) * 100));
  } else {
    sentiment = 'neutral';
    confidence = 50;
  }

  return {
    score: parseFloat(normalizedScore.toFixed(3)),
    sentiment,
    confidence: parseInt(confidence),
    wordCount: words.length,
    positiveWords