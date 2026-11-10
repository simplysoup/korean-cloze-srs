/** Four required teaching moves per grammar point.
 * No technical terms without a plain-English explanation.
 */
export interface TeachingGuide {
  /** What a learner can express with this grammar. */
  meaning: string;
  /** Instructions for constructing the form from a dictionary form or noun. */
  formation: string;
  /** Reasoning through a real sentence using the form. */
  worked: string;
  /** A common mistake or a nearby, easily confused construction. */
  trap: string;
}
