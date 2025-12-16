export function normalizeStatus(status = "") {
  const s = status.toLowerCase().trim();

  if (["normal", "सामान्य"].includes(s)) return "Normal";
  if (["low", "कम"].includes(s)) return "Low";
  if (["high", "ज्यादा", "उच्च"].includes(s)) return "High";
  if (["borderline", "सीमावर्ती"].includes(s)) return "Borderline";

  return "Unknown";
}
