function generateReasons({
  amount,
  avg_amount,
  frequency,
  department,
  vendor_name,
  location,
  anomaly_score,
  risk_level
}) {
  const reasons = [];

  if (avg_amount && amount > avg_amount * 4) {
    reasons.push(
      "Transaction amount is more than 4× the vendor's historical average"
    );
  } else if (avg_amount && amount > avg_amount * 2.5) {
    reasons.push(
      "Transaction amount is significantly higher than usual for this vendor"
    );
  }

  if (amount >= 5000000) {
    reasons.push(
      `Very high transaction value detected (₹${Number(amount).toLocaleString()})`
    );
  }

  if (frequency >= 7) {
    reasons.push(
      "Vendor received unusually frequent payments in a short time period"
    );
  } else if (frequency >= 4) {
    reasons.push(
      "Vendor has multiple transactions clustered closely together"
    );
  }

  const highRiskDepartments = [
    "Infrastructure",
    "Health",
    "Public Works",
    "Defense"
  ];

  if (
    department &&
    highRiskDepartments.includes(department) &&
    risk_level !== "LOW"
  ) {
    reasons.push(
      "High-risk government department combined with anomalous spending"
    );
  }

  const sensitiveLocations = ["Delhi", "Noida", "Gurgaon", "Mumbai"];

  if (
    location &&
    sensitiveLocations.includes(location) &&
    risk_level === "HIGH"
  ) {
    reasons.push(
      "High-value transaction detected in a sensitive or high-activity region"
    );
  }

  if (risk_level === "HIGH" && anomaly_score > 0.05) {
    reasons.push(
      "ML model indicates strong deviation from normal transaction behavior"
    );
  }

  if (risk_level === "MEDIUM" && anomaly_score > 0.02) {
    reasons.push(
      "ML model indicates moderate deviation requiring further review"
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "Transaction exhibits uncommon patterns compared to historical data"
    );
  }

  if (risk_level === "HIGH") {
    reasons.push("Recommended for immediate audit review");
  } else if (risk_level === "MEDIUM") {
    reasons.push("Recommended for secondary audit review");
  }

  return reasons;
}

module.exports = { generateReasons };