import { MEDICAL_RANGES } from "./medicalRanges";

export function getTestStatus(test) {
  const key = test.name.toLowerCase();
  const rangeKey = Object.keys(MEDICAL_RANGES).find(k =>
    key.includes(k)
  );

  if (!rangeKey) return "unknown";

  const range = MEDICAL_RANGES[rangeKey];
  const value = parseFloat(test.value);

  if (range.min && value < range.min) return "low";
  if (range.max && value > range.max) return "high";

  return "normal";
}
