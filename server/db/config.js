// Connection settings shared by the pool and the setup script.
function connectionOptions() {
  const connectionString = process.env.DB_CONNECTION_STRING;
  let ssl = false;

  // Hosted databases reached over the public internet (a full domain name such
  // as *.render.com) require TLS. Local databases and Render's internal
  // hostnames (no dots) do not offer it.
  try {
    const { hostname } = new URL(connectionString);
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    if (!isLocal && hostname.includes(".") && process.env.DB_SSL !== "false") {
      ssl = { rejectUnauthorized: false };
    }
  } catch {
    // Missing or malformed connection string: let pg report it on first query.
  }

  return { connectionString, ssl };
}

module.exports = { connectionOptions };
