const axios = require("axios");

async function runMLDetection(featureData) {
  let url = process.env.ML_SERVICE_URL;
  if (!url.startsWith("http")) {
    url = `http://${url}/detect`;
  }

  const response = await axios.post(
    url,
    featureData,
    { timeout: 10000 }
  );

  return response.data;
}

module.exports = { runMLDetection };
