// RevisionEngine.js

/**
 * Basic SM-2 Algorithm Implementation
 * @param {number} quality - User rating of recall (0-5)
 * @param {number} repetitions - How many times they've studied this
 * @param {number} previousInterval - Days since last revision
 * @param {number} previousEase - The "Ease Factor" (default 2.5)
 */
export const calculateNextRevision = (quality, repetitions, previousInterval, previousEase) => {
  let interval;
  let ease = previousEase;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * ease);
    }
    // Update Ease Factor: EF' = f(EF, q)
    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    // If forgotten, reset repetitions but keep a lower ease
    repetitions = 0;
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return { interval, ease, nextDate, repetitions: repetitions + 1 };
};

/**
 * Knowledge Graph Structure
 * Representing how JEE/NEET/UPSC topics link together.
 */
export const initialKnowledgeGraph = {
  nodes: [
    { id: 'electrostatics', label: 'Electrostatics', status: 'mastered' },
    { id: 'capacitance', label: 'Capacitance', status: 'review-due' },
    { id: 'current-elec', label: 'Current Electricity', status: 'locked' },
  ],
  edges: [
    { from: 'electrostatics', to: 'capacitance', type: 'prerequisite' },
    { from: 'capacitance', to: 'current-elec', type: 'prerequisite' },
  ]
};