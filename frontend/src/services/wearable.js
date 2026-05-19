// ─────────────────────────────────────────────────────────────────────────────
// Wearable Service — produces real-time HR + SpO₂ readings
//
// Today: simulated stream (mock mode) so the demo works without hardware.
// Later: replace `startStream` with react-native-ble-plx subscription
//        to a real wearable (Polar, Galaxy Watch, etc.) — the rest of the
//        app reads from the same callback signature, so nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────

let intervalId = null;
let baselineHR = 72;
let baselineSpO2 = 97;

/**
 * Start streaming vitals to a callback.
 *
 * @param {(reading: {hr:number, spo2:number, ts:number}) => void} onReading
 * @param {Object} [opts]
 * @param {number} [opts.intervalMs=800]   how often to emit a reading
 * @param {Object} [opts.baseline]         baseline HR + SpO2 (e.g. user profile)
 * @returns {() => void} stop function
 */
export const startStream = (onReading, opts = {}) => {
  const { intervalMs = 800, baseline = {} } = opts;
  baselineHR   = baseline.hr   ?? 72;
  baselineSpO2 = baseline.spo2 ?? 97;

  // Walk parameters — gentle drift around baseline
  let hr   = baselineHR;
  let spo2 = baselineSpO2;

  intervalId = setInterval(() => {
    // HR: random walk ± 2 bpm, occasionally a small spike, gentle pull-back to baseline
    const drift = (Math.random() - 0.5) * 4;
    const pullToBaseline = (baselineHR - hr) * 0.08;
    hr = Math.round(Math.max(50, Math.min(120, hr + drift + pullToBaseline)));

    // Rare anomaly — once every ~100 readings, simulate a spike
    if (Math.random() < 0.01) {
      hr += Math.round((Math.random() - 0.3) * 20);
    }

    // SpO₂: stays much steadier, tiny fluctuations
    const sDrift = (Math.random() - 0.5) * 0.6;
    spo2 = Math.max(92, Math.min(100, spo2 + sDrift + (baselineSpO2 - spo2) * 0.1));

    onReading({
      hr,
      spo2: Math.round(spo2 * 10) / 10,  // one decimal
      ts: Date.now(),
    });
  }, intervalMs);

  return () => stopStream();
};

export const stopStream = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

/**
 * Mock device-pairing flow used during onboarding.
 * Resolves after a short delay to feel like a real BLE handshake.
 */
export const pairDevice = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        connected: true,
        deviceName: 'CardioBand Pro',
        battery: 87,
        signalStrength: 'Excellent',
      });
    }, 2400);
  });
};
