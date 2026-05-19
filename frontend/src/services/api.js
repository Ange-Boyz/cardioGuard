// ─────────────────────────────────────────────────────────────────────────
// API service — Inférence locale (edge-first)
//
// Toutes les prédictions sont calculées sur le téléphone via inference.js.
// Pas de réseau, pas de latence, fonctionne offline.
// La synchronisation backend (historique) est gérée séparément dans sync.js.
// ─────────────────────────────────────────────────────────────────────────

import { predictWithDerivedFeatures, getModelInfo } from './inference';

/**
 * Prédiction principale — toujours locale, instantanée, fonctionne offline.
 *
 * @param {Object} userInput — { age, gender, bmi, smoking, alcohol,
 *                               family_history, systolic_bp, diastolic_bp,
 *                               heart_rate, oxygen_saturation }
 * @returns {Promise<Object>} { probability, cvd_detected, ... }
 */
export const predictRisk = async (userInput) => {
  return predictWithDerivedFeatures(userInput);
};

/**
 * Helper — calcule le BMI depuis la taille (cm) et le poids (kg).
 */
export const computeBMI = (heightCm, weightKg) => {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w) return 0;
  const meters = h / 100;
  return Math.round((w / (meters * meters)) * 10) / 10;
};

/**
 * Pour l'écran "À propos" / debug.
 */
export const getInferenceInfo = () => getModelInfo();