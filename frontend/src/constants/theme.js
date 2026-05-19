// ─────────────────────────────────────────────────────────────────────────────
// CardioGuard — Design System
// Cream + lime aesthetic inspired by modern wellness apps
// ─────────────────────────────────────────────────────────────────────────────

export const COLORS = {
  // Surfaces
  cream:       '#f5f1ea',  // main background — warm beige
  creamSoft:   '#faf7f1',  // elevated surface
  white:       '#ffffff',  // cards
  black:       '#1a1a1a',  // deepest

  // Brand accent
  lime:        '#d4f04a',  // primary accent — bright lime
  limeDark:    '#b8d837',  // pressed state
  limeSoft:    '#eaf69d',  // light tint for backgrounds

  // Ink (text)
  ink:         '#1a1a1a',
  inkMuted:    '#6b6b6b',
  inkFaint:    '#a8a8a8',
  inkLine:     '#e8e3d8',  // subtle borders matching cream

  // Risk levels — softer, organic palette
  riskLow:     '#86c34c',
  riskMed:     '#f4a93a',
  riskHigh:    '#e85a4f',

  // Vital sign colors (for charts)
  hrColor:     '#1a1a1a',  // heart rate line — black
  spo2Color:   '#5b8def',  // SpO2 line — soft blue
  bpColor:     '#e85a4f',  // blood pressure — coral
};

// ─────────────────────────────────────────────────────────────────────────────
// Risk thresholds — match notebook's predict_cardiovascular_risk logic
// ─────────────────────────────────────────────────────────────────────────────
export const RISK_THRESHOLDS = {
  LOW_MAX:  0.35,
  MED_MAX:  0.65,
};

export const getRiskLevel = (probability) => {
  if (probability < RISK_THRESHOLDS.LOW_MAX) {
    return {
      level: 'LOW',
      emoji: '🟢',
      color: COLORS.riskLow,
      bgColor: '#eaf3dc',
      label: 'Low Risk',
      shortLabel: 'Normal',
      recommendation: 'Your readings look healthy. Keep up the good work — exercise, sleep, and balanced meals.',
    };
  }
  if (probability < RISK_THRESHOLDS.MED_MAX) {
    return {
      level: 'MEDIUM',
      emoji: '🟡',
      color: COLORS.riskMed,
      bgColor: '#fdeed2',
      label: 'Medium Risk',
      shortLabel: 'Watch',
      recommendation: 'A few markers are elevated. Schedule a check-up and monitor your vitals daily.',
    };
  }
  return {
    level: 'HIGH',
    emoji: '🔴',
    color: COLORS.riskHigh,
    bgColor: '#fad9d6',
    label: 'High Risk',
    shortLabel: 'Alert',
    recommendation: 'Please consult a doctor soon. Several factors indicate elevated cardiovascular risk.',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Vital sign normal ranges — for color-coding values
// ─────────────────────────────────────────────────────────────────────────────
export const isNormal = {
  hr:    (v) => v >= 60 && v <= 100,
  spo2:  (v) => v >= 95,
  sysBp: (v) => v >= 90 && v < 130,
  diaBp: (v) => v >= 60 && v < 85,
  bmi:   (v) => v >= 18.5 && v < 25,
};

export const APP_INFO = {
  name: 'CardioGuard',
  tagline: 'Your heart, monitored.',
  author: 'Ange Cabrel',
};

// Storage keys (single source of truth)
export const STORAGE = {
  ONBOARDED:   '@cg_onboarded',
  PROFILE:     '@cg_profile',
  HISTORY:     '@cg_history',
  LATEST_RISK: '@cg_latest_risk',
};
