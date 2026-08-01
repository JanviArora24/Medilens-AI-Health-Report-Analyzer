// Medical direction rules
const IMPROVEMENT_RULES = {
 // Better when HIGHER
  "Hemoglobin": "up",
  "Vitamin D (25-OH)": "up",
  "Vitamin B12": "up",
  "HDL Cholesterol": "up",
  "Platelet Count": "up",
  "Total Leukocyte Count": "up",
  "Calcium": "up",
  "Ferritin": "up",

  // Better when LOWER
  "Fasting Blood Sugar": "down",
  "Post Prandial Sugar": "down",
  "HbA1c": "down",
  "LDL Cholesterol": "down",
  "Triglycerides": "down",
  "Cholesterol - Total": "down",
  "Creatinine": "down",
  "Urea": "down",
  "Uric Acid": "down",
  "Urine Protein": "down",
  "Urine Sugar": "down",
  "VLDL Cholesterol": "down",
  "Insulin (Fasting)": "down",
  "Bilirubin (Total)": "down"
};

export function generateTrendInsight(testName, data) {
  if (!data || data.length === 0) {
    return "No trend data available for this test.";
  }

  // 🔹 Single report
  if (data.length === 1) {
    return "Only one report is available. Upload more reports to understand long-term health trends.";
  }

  const first = data[0].value;
  const last = data[data.length - 1].value;

  if (first === last) {
    return "Values have remained stable across reports, indicating no major change over time.";
  }

  const trend = last > first ? "up" : "down";
  const expected = IMPROVEMENT_RULES[testName];

  // 🔹 If medical meaning is known
  if (expected) {
    if (trend === expected) {
      return `This trend indicates improvement in ${testName}, which is generally a positive sign.`;
    } else {
      return `This trend suggests deterioration in ${testName}. Medical or lifestyle attention may be needed.`;
    }
  }

  // 🔹 Fallback (unknown test)
  return `A ${trend === "up" ? "rise" : "drop"} in values was observed over time. Consult a healthcare professional to understand its significance.`;
}
