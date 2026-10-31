const crypto = require("node:crypto");

const requireMcpApiKey = (req, res, next) => {
  const expectedKey = process.env.MCP_API_KEY;
  if (!expectedKey || expectedKey.length < 32) {
    return res.status(503).json({
      success: false,
      message: "MCP endpoint requires an MCP_API_KEY of at least 32 characters",
    });
  }

  const match = /^Bearer\s+(.+)$/i.exec(req.get("authorization") || "");
  const providedKey = match ? Buffer.from(match[1]) : Buffer.alloc(0);
  const configuredKey = Buffer.from(expectedKey);

  if (
    providedKey.length !== configuredKey.length ||
    !crypto.timingSafeEqual(providedKey, configuredKey)
  ) {
    res.set("WWW-Authenticate", "Bearer");
    return res.status(401).json({
      success: false,
      message: "A valid bearer token is required",
    });
  }

  next();
};

module.exports = requireMcpApiKey;
