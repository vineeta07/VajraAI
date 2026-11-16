const axios = require("axios");

// Accepts "host:8000", "host:8000/detect", "https://name.onrender.com" or a
// full URL, and returns the full address of the /detect endpoint.
function mlDetectUrl() {
  let url = (process.env.ML_SERVICE_URL || "").trim();
  if (!url) return null;

  if (!/^https?:\/\//i.test(url)) {
    const local = /^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(url);
    url = `${local ? "http" : "https"}://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.pathname === "/" || parsed.pathname === "") parsed.pathname = "/detect";
    return parsed.toString();
  } catch {
    return null;
  }
}

// Explains a failed call to the ML service in a sentence a person can act on.
function describeMlError(err, url) {
  if (!url) {
    return "ML_SERVICE_URL is not set on the server, so it does not know where the scoring model is.";
  }
  const host = new URL(url).host;
  const local = /^(localhost|127\.0\.0\.1)/.test(host);

  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "EAI_AGAIN") {
    return local
      ? `Nothing is listening at ${host}. On a hosted server "localhost" is the server itself, not the ML service: set ML_SERVICE_URL to the ML service's public address, for example https://your-ml-service.onrender.com/detect.`
      : `The ML service address ${host} could not be reached (${err.code}). Check that ML_SERVICE_URL is spelled correctly and that the ML service is deployed.`;
  }
  if (err.code === "ECONNABORTED" || /timeout/i.test(err.message || "")) {
    return `The ML service at ${host} did not answer within two minutes. It may still be waking from sleep or may have run out of memory; wait a minute and run the analysis again.`;
  }
  if (err.response) {
    const s = err.response.status;
    if (s === 404) return `The ML service at ${host} answered, but has no ${new URL(url).pathname} endpoint (HTTP 404). ML_SERVICE_URL should end in /detect.`;
    if (s === 502 || s === 503 || s === 504) return `The ML service at ${host} is not running right now (HTTP ${s}). Its deploy may have failed or it may be restarting; check its logs.`;
    if (s === 422) return `The ML service rejected the data it was sent (HTTP 422).`;
    return `The ML service at ${host} returned an error (HTTP ${s}). Check its logs.`;
  }
  return `The ML service at ${host} could not be used: ${err.message}`;
}

async function runMLDetection(featureData) {
  const url = mlDetectUrl();
  try {
    if (!url) throw new Error("ML_SERVICE_URL is not set");
    // Generous timeout: a sleeping free-tier service has to boot and load PyTorch.
    const response = await axios.post(url, featureData, { timeout: 120000 });
    return response.data;
  } catch (err) {
    const wrapped = new Error(describeMlError(err, url));
    wrapped.isMlError = true;
    throw wrapped;
  }
}

module.exports = { runMLDetection, mlDetectUrl };
