/**
 * SM-2 Algorithm for Spaced Repetition
 * @param {Object} concept - The current state of the concept node
 * @param {number} quality - User recall quality (0-5)
 */
export const updateConceptRetention = (concept, quality) => {
  // Ensure we have defaults if it's the first time
  let repetitions = concept.repetitions || 0;
  let interval = concept.interval || 0;
  let ease = concept.ease || 2.5;

  if (quality >= 3) {
    // Correct Response: Calculate new interval BEFORE incrementing repetitions
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
    
    // Increment repetitions only on success
    repetitions++;

    // Adjust Ease Factor (Standard SM-2 formula)
    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    // Incorrect Response: Reset progress
    repetitions = 0;
    interval = 1;
    // Drop ease slightly to make future reviews more frequent
    ease = Math.max(1.3, ease - 0.2);
  }

  // Safety check for Ease Factor floor
  if (ease < 1.3) ease = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ...concept,
    repetitions: repetitions,
    interval: interval,
    ease: ease,
    nextReview: nextReviewDate.toISOString(),
    lastReviewed: new Date().toISOString(),
    // Logic: Mastered if they know it well (4-5) and have seen it a few times
    status: (quality >= 4 && repetitions > 2) ? 'Mastered' : 'Reviewing'
  };
};