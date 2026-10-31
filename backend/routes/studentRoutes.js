const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentController");

// Health check
router.get("/health", controller.health);

// CRUD
router.get("/students", controller.getAllStudents);
router.get("/students/:id", controller.getStudentById);
router.post("/students", controller.createStudent);
router.put("/students/:id", controller.updateStudent);
router.delete("/students/:id", controller.deleteStudent);

module.exports = router;