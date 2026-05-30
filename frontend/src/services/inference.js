

import modelData from '../../assets/model/cvd_model_mobile.json';
import modelMeta from '../../assets/model/model_metadata.json';

let _trees = null;
let _baseScore = 0;
let _featureColumns = [];
let _ready = false;


export const initInference = () => {
  if (_ready) return;

  const learner = modelData.learner;
  const trees   = learner.gradient_booster.model.trees;
  const lmp     = learner.learner_model_param;

  // Parser base_score (format XGBoost 2.0+ : "[5E-1]")
  let baseScoreRaw = lmp?.base_score;
  if (typeof baseScoreRaw === 'string') {
    baseScoreRaw = baseScoreRaw.replace(/[\[\]]/g, '').trim();
  }
  let baseScoreProba = parseFloat(baseScoreRaw);
  if (isNaN(baseScoreProba)) baseScoreProba = 0.5;

  // Convertir probabilité → log-odds (XGBoost travaille en log-odds en interne)
  const objectiveName = learner.objective?.name || '';
  const isBinaryLogistic = objectiveName.includes('binary:logistic');

  if (isBinaryLogistic) {
    _baseScore = Math.abs(baseScoreProba - 0.5) < 1e-9
      ? 0
      : Math.log(baseScoreProba / (1 - baseScoreProba));
  } else {
    _baseScore = baseScoreProba;
  }

  _featureColumns = modelMeta.feature_columns;

  _trees = trees.map((tree) => ({
    splitIndices:    tree.split_indices,
    splitConditions: tree.split_conditions,
    leftChildren:    tree.left_children,
    rightChildren:   tree.right_children,
    defaultLeft:     tree.default_left,
    baseWeights:     tree.base_weights,
  }));

  _ready = true;
  console.log(`✓ CardioGuard inference engine ready: ${_trees.length} trees`);
};

// ─── Helpers internes ────────────────────────────────────────────────────

const walkTree = (tree, features) => {
  let nodeIdx = 0;
  while (tree.leftChildren[nodeIdx] !== -1) {
    const featureIdx = tree.splitIndices[nodeIdx];
    const threshold  = tree.splitConditions[nodeIdx];
    const value      = features[featureIdx];

    if (value === null || value === undefined || isNaN(value)) {
      nodeIdx = tree.defaultLeft[nodeIdx]
        ? tree.leftChildren[nodeIdx]
        : tree.rightChildren[nodeIdx];
    } else if (value < threshold) {
      nodeIdx = tree.leftChildren[nodeIdx];
    } else {
      nodeIdx = tree.rightChildren[nodeIdx];
    }
  }
  return tree.baseWeights[nodeIdx];
};

const sigmoid = (x) => 1 / (1 + Math.exp(-x));

const encodeValue = (col, value) => {
  if (value === null || value === undefined) return NaN;
  if (col === 'Gender')        return value === 'Male' ? 1 : 0;
  if (col === 'Smoking')       return value === 'Yes'  ? 1 : 0;
  if (col === 'FamilyHistory') return value === 'Yes'  ? 1 : 0;
  if (col === 'Alcohol') {
    return { 'No': 0, 'Moderate': 1, 'Heavy': 2 }[value] ?? 0;
  }
  return Number(value);
};

const mapToModelKey = (modelCol) => {
  const map = {
    'Age':              'age',
    'Gender':           'gender',
    'BMI':              'bmi',
    'Smoking':          'smoking',
    'Alcohol':          'alcohol',
    'FamilyHistory':    'family_history',
    'SystolicBP':       'systolic_bp',
    'DiastolicBP':      'diastolic_bp',
    'HeartRate':        'heart_rate',
    'OxygenSaturation': 'oxygen_saturation',
    'PulsePressure':    'pulse_pressure',
    'MAP':              'map',
  };
  return map[modelCol] || modelCol;
};

// ─── API publique ────────────────────────────────────────────────────────

/**
 * Prédit le risque cardiovasculaire à partir d'un input utilisateur.
 *
 * @param {Object} userInput
 * @returns {Object} { probability, cvd_detected, ... }
 */
export const predictLocal = (userInput) => {
  if (!_ready) initInference();

  const features = _featureColumns.map((col) =>
    encodeValue(col, userInput[mapToModelKey(col)])
  );

  // ─── DEBUG TEMPORAIRE ────────────────────────────────────────
  console.log('🔍 INFERENCE DEBUG');
  console.log('  Input reçu  :', JSON.stringify(userInput, null, 2));
  console.log('  Features encodées (ordre du modèle) :');
  _featureColumns.forEach((col, i) => {
    console.log(`    ${col.padEnd(20)} = ${features[i]}`);
  });
  // ─────────────────────────────────────────────────────────────

  let rawScore = _baseScore;
  for (const tree of _trees) {
    rawScore += walkTree(tree, features);
  }

  const probability = sigmoid(rawScore);

  console.log(`  Score brut  : ${rawScore.toFixed(6)}`);
  console.log(`  Probabilité : ${probability.toFixed(6)}`);

  const detected = probability >= modelMeta.optimal_threshold;

  return {
    probability,
    probability_pct: `${(probability * 100).toFixed(1)} %`,
    cvd_detected: detected,
    threshold_used: modelMeta.optimal_threshold,
    model_version:  modelMeta.version,
    inference_mode: 'local',
  };
};

/**
 * Wrapper : calcule automatiquement PulsePressure et MAP depuis la TA.
 * C'est la fonction à appeler depuis l'app (l'utilisateur ne donne que
 * systolic_bp et diastolic_bp ; les features dérivées sont calculées ici).
 */
export const predictWithDerivedFeatures = (userInput) => {
  const sys = Number(userInput.systolic_bp);
  const dia = Number(userInput.diastolic_bp);

  const enriched = {
    ...userInput,
    pulse_pressure: sys - dia,
    map: dia + (sys - dia) / 3,
  };

  return predictLocal(enriched);
};

export const getModelInfo = () => ({
  version: modelMeta.version,
  features: modelMeta.feature_columns,
  threshold: modelMeta.optimal_threshold,
  ready: _ready,
});