export function parseSummary(summary = "") {
  const text = summary.toLowerCase();

  return {
    cholesterol: text.includes("cholesterol") && text.includes("high")
      ? "high"
      : text.includes("cholesterol") && text.includes("low")
      ? "low"
      : "normal",

    hemoglobin: text.includes("hemoglobin") && text.includes("low")
      ? "low"
      : "normal",

    sugar: text.includes("sugar") && text.includes("high")
      ? "high"
      : "normal",
  };
}
