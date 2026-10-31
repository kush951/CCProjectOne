// frontend/src/components/StudentForm.jsx
import React, { useEffect, useState } from "react";

const EMPTY_FORM = {
  studentId: "",
  name: "",
  email: "",
  department: "",
  semester: "",
  contact: "",
};

const DEPARTMENTS = [
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "BEST",
];

export default function StudentForm({
  onSubmit,
  editingStudent,
  onCancelEdit,
  submitting,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingStudent) {
      setForm({
        studentId: editingStudent.studentId || "",
        name: editingStudent.name || "",
        email: editingStudent.email || "",
        department: editingStudent.department || "",
        semester: editingStudent.semester ?? "",
        contact: editingStudent.contact || "",
      });
      setErrors({});
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};

    if (!form.studentId.trim()) next.studentId = "Student ID is required";

    if (!form.name.trim()) next.name = "Name is required";
    else if (form.name.trim().length < 2)
      next.name = "Name must be at least 2 characters";

    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address";

    if (!form.department.trim()) next.department = "Please select a department";

    if (form.semester === "" || form.semester === null)
      next.semester = "Semester is required";
    else {
      const sem = Number(form.semester);
      if (Number.isNaN(sem) || sem < 1 || sem > 8)
        next.semester = "Semester must be between 1 and 8";
    }

    if (form.contact && !/^[\d+\-\s()]{6,20}$/.test(form.contact.trim()))
      next.contact = "Contact must be 6–20 digits (spaces, +, -, () allowed)";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      studentId: form.studentId.trim(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      department: form.department.trim(),
      semester: Number(form.semester),
      contact: form.contact.trim(),
    };

    const ok = await onSubmit(payload);
    if (ok && !editingStudent) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onCancelEdit();
  };

  return (
    <section className="card">
      <div className="card__header">
        <p className="card__eyebrow">
          {editingStudent ? "Edit Record" : "New Record"}
        </p>
        <h3 className="card__title">
          {editingStudent ? "Update a student" : "Add a student"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="student-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="studentId">Student ID</label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              value={form.studentId}
              onChange={handleChange}
              placeholder="Enter student id"
              className={errors.studentId ? "input input--error" : "input"}
              disabled={submitting}
            />
            {errors.studentId && (
              <span className="error-text">{errors.studentId}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className={errors.name ? "input input--error" : "input"}
              disabled={submitting}
            />
            {errors.name && (
              <span className="error-text">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className={errors.email ? "input input--error" : "input"}
              disabled={submitting}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              className={
                errors.department
                  ? "input select input--error"
                  : "input select"
              }
              disabled={submitting}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.department && (
              <span className="error-text">{errors.department}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <input
              id="semester"
              name="semester"
              type="number"
              min="1"
              max="8"
              value={form.semester}
              onChange={handleChange}
              placeholder="Enter semester"
              className={errors.semester ? "input input--error" : "input"}
              disabled={submitting}
            />
            {errors.semester && (
              <span className="error-text">{errors.semester}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Number</label>
            <input
              id="contact"
              name="contact"
              type="tel"
              value={form.contact}
              onChange={handleChange}
              placeholder="Enter contact number"
              className={errors.contact ? "input input--error" : "input"}
              disabled={submitting}
            />
            {errors.contact && (
              <span className="error-text">{errors.contact}</span>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={submitting}
          >
            {submitting
              ? "Saving…"
              : editingStudent
              ? "Update Student"
              : "Add Student"}
          </button>

          {editingStudent && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}