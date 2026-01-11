const axios = require("axios");

async function runMLDetection(featureData) {
  const response = await axios.post(
    process.env.ML_SERVICE_URL,
    featureData,
    { timeout: 10000 }
  );

  return response.data;
}

module.exports = { runMLDetection };
