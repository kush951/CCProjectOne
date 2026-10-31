
const mongoose = require("mongoose");
const Student = require("../models/Student");


const toApiShape = (doc) => ({
  _id: doc._id,
  studentId: doc.studentId,
  name: doc.name,
  email: doc.email,
  department: doc.department,
  semester: doc.semester,
  contact: doc.contact,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});


exports.health = (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "Student API is running",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
};


exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students.map(toApiShape),
    });
  } catch (err) {
    next(err);
  }
};


exports.getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({ success: true, data: toApiShape(student) });
  } catch (err) {
    next(err);
  }
};


exports.createStudent = async (req, res, next) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    // Manual presence check (Mongoose also validates, but gives clearer 400s)
    if (!studentId || !name || !email || !department || semester === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, name, email, department and semester are required",
      });
    }

    const semesterNum = Number(semester);
    if (Number.isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) {
      return res.status(400).json({
        success: false,
        message: "Semester must be a number between 1 and 8",
      });
    }

    const existing = await Student.findOne({ studentId: studentId.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Student with ID '${studentId}' already exists`,
      });
    }

    const student = await Student.create({
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      semester: semesterNum,
      contact: contact ? String(contact).trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: toApiShape(student),
    });
  } catch (err) {
    next(err);
  }
};


exports.updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    const updates = {};
    const allowed = [
      "studentId",
      "name",
      "email",
      "department",
      "semester",
      "contact",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.semester !== undefined) {
      const sem = Number(updates.semester);
      if (Number.isNaN(sem) || sem < 1 || sem > 8) {
        return res.status(400).json({
          success: false,
          message: "Semester must be a number between 1 and 8",
        });
      }
      updates.semester = sem;
    }

    if (updates.email) updates.email = updates.email.trim().toLowerCase();
    if (updates.studentId) updates.studentId = updates.studentId.trim();
    if (updates.name) updates.name = updates.name.trim();
    if (updates.department) updates.department = updates.department.trim();

    // Duplicate studentId check
    if (updates.studentId) {
      const dup = await Student.findOne({
        studentId: updates.studentId,
        _id: { $ne: id },
      });
      if (dup) {
        return res.status(409).json({
          success: false,
          message: `Student with ID '${updates.studentId}' already exists`,
        });
      }
    }

    const student = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: toApiShape(student),
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: toApiShape(student),
    });
  } catch (err) {
    next(err);
  }
};