const express = require("express");
const requireMcpApiKey = require("../middleware/mcpApiKey");
const { handleMcpRequest } = require("../mcpServer");

const router = express.Router();

router.use(requireMcpApiKey);
router.post("/", handleMcpRequest);

const methodNotAllowed = (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed" },
    id: null,
  });
};

router.get("/", methodNotAllowed);
router.delete("/", methodNotAllowed);

module.exports = router;
