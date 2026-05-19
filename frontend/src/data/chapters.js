// ─────────────────────────────────────────────────────────────────────────────
// Learn CVD — chapter content
// Sources adapted from WHO, AHA, and CDC public materials.
// Always cite professional medical advice as definitive.
// ─────────────────────────────────────────────────────────────────────────────

export const CHAPTERS = [
  {
    id: 'what-is-cvd',
    number: '01',
    title: 'What is Cardiovascular Disease?',
    duration: '4 min read',
    icon: '🫀',
    summary: 'A foundational overview of the conditions that make up CVD.',
    sections: [
      {
        heading: 'The big picture',
        body: 'Cardiovascular disease (CVD) is an umbrella term covering disorders of the heart and blood vessels. It includes coronary artery disease, stroke, heart failure, arrhythmias, and peripheral artery disease. Globally, CVD remains the leading cause of death — responsible for roughly one in three deaths each year.',
      },
      {
        heading: 'Why it matters in Africa',
        body: 'Once thought to be a "Western" disease, CVD is rising sharply in sub-Saharan Africa. Cameroon and neighbouring countries are seeing increased rates of hypertension and stroke, often striking adults much earlier than in high-income countries. Awareness and early detection are therefore more important than ever.',
      },
      {
        heading: 'The good news',
        body: 'Up to 80% of premature heart disease and stroke is preventable. Daily habits — diet, movement, sleep, and stress management — have an outsized impact on heart health. Knowing your numbers (blood pressure, heart rate, BMI) is the first step.',
      },
    ],
  },
  {
    id: 'causes',
    number: '02',
    title: 'Causes & Risk Factors',
    duration: '5 min read',
    icon: '⚠️',
    summary: 'What raises your risk — and what you can do about each factor.',
    sections: [
      {
        heading: 'Modifiable risk factors',
        body: 'These are within your control. High blood pressure, high cholesterol, smoking, excess alcohol, physical inactivity, unhealthy diet, obesity, and uncontrolled diabetes all raise your risk significantly. Even small improvements compound: lowering systolic blood pressure by 10 mmHg can reduce stroke risk by 27%.',
      },
      {
        heading: 'Non-modifiable risk factors',
        body: 'Age, sex assigned at birth, family history, and ethnicity all play a role. Risk climbs notably after 45 in men and 55 in women. If a parent or sibling had heart disease before 55 (men) or 65 (women), your inherited risk is higher — meaning your modifiable factors deserve extra attention.',
      },
      {
        heading: 'The silent ones',
        body: 'Hypertension is called the silent killer because most people feel nothing while it damages their arteries for years. Sleep apnea, chronic stress, and depression are also under-recognized contributors. This is why regular monitoring beats waiting for symptoms.',
      },
    ],
  },
  {
    id: 'symptoms',
    number: '03',
    title: 'Symptoms to Watch',
    duration: '3 min read',
    icon: '🩺',
    summary: 'Know the warning signs — for yourself and the people you love.',
    sections: [
      {
        heading: 'Heart attack signs',
        body: 'Chest pressure or squeezing that lasts more than a few minutes; pain radiating to the arm, jaw, or back; shortness of breath; cold sweat; nausea; lightheadedness. Symptoms in women can be subtler — fatigue, indigestion-like discomfort, or upper-back pain. If you suspect a heart attack, get to a hospital immediately.',
      },
      {
        heading: 'Stroke — F.A.S.T.',
        body: 'Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Every minute matters. Other signs: sudden severe headache, vision loss, confusion, numbness on one side of the body.',
      },
      {
        heading: 'Things to flag at a check-up',
        body: 'Persistent fatigue, unexplained shortness of breath during normal activities, swelling in legs or ankles, racing or irregular heartbeat, fainting spells. These can indicate heart failure or arrhythmia and shouldn\'t be brushed off.',
      },
    ],
  },
  {
    id: 'prevention',
    number: '04',
    title: 'Prevention & Lifestyle',
    duration: '6 min read',
    icon: '🌱',
    summary: 'Practical, evidence-based habits that protect your heart.',
    sections: [
      {
        heading: 'Move daily',
        body: 'Aim for 150 minutes of moderate activity per week (brisk walking, swimming, cycling). Even 10-minute sessions count. Add two strength sessions weekly. Prolonged sitting is independently harmful — break it up every hour.',
      },
      {
        heading: 'Eat for your heart',
        body: 'Mediterranean-style eating consistently outperforms other diets in cardiovascular trials: vegetables, fruits, whole grains, legumes, fish, olive oil; limited red meat and ultra-processed foods. Locally, that translates to ndolé without excess oil, plenty of plantain and beans, fish over fried meat, and fresh fruit instead of sugary drinks.',
      },
      {
        heading: 'Sleep, stress, smoke',
        body: 'Adults need 7–9 hours of sleep. Chronic poor sleep raises blood pressure and inflammation. Manage stress with whatever genuinely works for you — prayer, walking, music, time with people you love. And if you smoke: quitting is the single most powerful thing you can do for your heart, at any age.',
      },
    ],
  },
  {
    id: 'treatment',
    number: '05',
    title: 'Treatments & Solutions',
    duration: '4 min read',
    icon: '💊',
    summary: 'How modern medicine treats heart disease — and when to seek it.',
    sections: [
      {
        heading: 'Medications',
        body: 'Common classes include statins (lower cholesterol), antihypertensives (lower blood pressure), antiplatelets like aspirin (prevent clots), and beta-blockers (reduce heart workload). Take them exactly as prescribed — many CVD medications work cumulatively over months.',
      },
      {
        heading: 'Procedures',
        body: 'Angioplasty with stenting opens blocked arteries. Bypass surgery reroutes blood around blockages. Pacemakers and defibrillators manage rhythm problems. These are not last resorts — when indicated, they can dramatically extend healthy life.',
      },
      {
        heading: 'Working with your doctor',
        body: 'Bring your CardioGuard history to appointments — trends matter more than single readings. Ask about your 10-year CVD risk score, what your target blood pressure should be, and what side effects to expect from any new medication. You are a partner in your own care.',
      },
    ],
  },
  {
    id: 'wearables',
    number: '06',
    title: 'Wearables & Self-Monitoring',
    duration: '3 min read',
    icon: '⌚',
    summary: 'How devices like CardioGuard fit into a healthy life.',
    sections: [
      {
        heading: 'What they\'re great at',
        body: 'Continuous heart rate monitoring catches resting HR trends and arrhythmias that intermittent visits miss. SpO₂ tracking can flag breathing issues during sleep. Daily activity counts gently nudge you to move more.',
      },
      {
        heading: 'What to watch for',
        body: 'Resting HR consistently above 100 or below 50 (when you\'re not athletic), SpO₂ regularly under 95% at rest, irregular rhythm warnings, or sudden changes from your personal baseline. Bring these patterns to a clinician — don\'t self-diagnose.',
      },
      {
        heading: 'A tool, not a doctor',
        body: 'CardioGuard\'s AI-powered risk score is informational and educational. It augments — but does not replace — professional medical advice. If something feels wrong, trust your body and seek care.',
      },
    ],
  },
];
