const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");
const Student = require("./models/Student");

const textResult = (value) => ({
  content: [{ type: "text", text: JSON.stringify(value) }],
});

const toolError = (error, operation) => {
  if (error?.name === "StudentNotFoundError") {
    return {
      ...textResult({ error: error.message }),
      isError: true,
    };
  }

  if (error?.name === "InvalidUpdateError") {
    return {
      ...textResult({ error: error.message }),
      isError: true,
    };
  }

  if (error?.code === 11000) {
    return {
      ...textResult({ error: "A student with that student ID already exists" }),
      isError: true,
    };
  }

  if (error?.name === "ValidationError") {
    return {
      ...textResult({ error: error.message }),
      isError: true,
    };
  }

  console.error(`[MCP] ${operation} failed:`, error);
  return {
    ...textResult({ error: "The student operation failed" }),
    isError: true,
  };
};

const runTool = async (operation, callback) => {
  try {
    return textResult(await callback());
  } catch (error) {
    return toolError(error, operation);
  }
};

const requireStudent = (student, studentId) => {
  if (student) return student;

  const error = new Error(`Student '${studentId}' was not found`);
  error.name = "StudentNotFoundError";
  throw error;
};

const createMcpServer = () => {
  const server = new McpServer({
    name: "student-information-system",
    version: "1.0.0",
  });

  server.registerTool(
    "list_students",
    {
      description: "List all student records, newest first.",
      annotations: { readOnlyHint: true },
    },
    () =>
      runTool("list_students", async () =>
        Student.find().sort({ createdAt: -1 }).lean()
      )
  );

  server.registerTool(
    "get_student",
    {
      description: "Get one student record by its student ID.",
      inputSchema: {
        studentId: z.string().trim().min(1).describe("The student's ID"),
      },
      annotations: { readOnlyHint: true },
    },
    ({ studentId }) =>
      runTool("get_student", async () => {
        const student = await Student.findOne({ studentId }).lean();
        return requireStudent(student, studentId);
      })
  );

  server.registerTool(
    "create_student",
    {
      description: "Create a student record.",
      inputSchema: {
        studentId: z.string().trim().min(1),
        name: z.string().trim().min(2),
        email: z.string().trim().email(),
        department: z.string().trim().min(1),
        semester: z.number().int().min(1).max(8),
        contact: z.string().trim().optional(),
      },
      annotations: { destructiveHint: false },
    },
    (input) =>
      runTool("create_student", () => Student.create(input))
  );

  server.registerTool(
    "update_student",
    {
      description:
        "Update a student record by its current student ID. Provide at least one field to update.",
      inputSchema: {
        studentId: z.string().trim().min(1).describe("Current student ID"),
        newStudentId: z.string().trim().min(1).optional(),
        name: z.string().trim().min(2).optional(),
        email: z.string().trim().email().optional(),
        department: z.string().trim().min(1).optional(),
        semester: z.number().int().min(1).max(8).optional(),
        contact: z.string().trim().optional(),
      },
      annotations: { destructiveHint: false },
    },
    ({ studentId, newStudentId, ...fields }) =>
      runTool("update_student", async () => {
        const updates = { ...fields };
        if (newStudentId !== undefined) updates.studentId = newStudentId;
        if (Object.keys(updates).length === 0) {
          const error = new Error("Provide at least one field to update");
          error.name = "InvalidUpdateError";
          throw error;
        }

        const student = await Student.findOneAndUpdate(
          { studentId },
          updates,
          { new: true, runValidators: true }
        );
        return requireStudent(student, studentId);
      })
  );

  server.registerTool(
    "delete_student",
    {
      description: "Permanently delete a student record by its student ID.",
      inputSchema: {
        studentId: z.string().trim().min(1).describe("The student's ID"),
      },
      annotations: { destructiveHint: true },
    },
    ({ studentId }) =>
      runTool("delete_student", async () => {
        const student = await Student.findOneAndDelete({ studentId }).lean();
        return requireStudent(student, studentId);
      })
  );

  return server;
};

const handleMcpRequest = async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.once("close", () => {
    server.close().catch((error) => {
      console.error("[MCP] Failed to close request server:", error);
    });
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("[MCP] Failed to handle request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
};

module.exports = { handleMcpRequest };
