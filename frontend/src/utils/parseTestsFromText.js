export function parseTestsFromText(text = "") {
  const tests = [];

  const regex =
    /([A-Za-z][A-Za-z\s\/()%\-]+?)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg\/dL|g\/dL|mmol\/L|mEq\/L|\/mm3|cells\/mm3|%)?/gi;

  let match;
  while ((match = regex.exec(text)) !== null) {
    tests.push({
      name: match[1].trim(),
      value: match[2],
      unit: match[3] || "",
    });
  }

  return tests;
}
