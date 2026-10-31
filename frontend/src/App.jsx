// frontend/src/App.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import StudentForm from "./components/StudentForm";
import StudentTable from "./components/StudentTable";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "./services/studentService";

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllStudents();
      setStudents(res.data || []);
    } catch (err) {
      showToast("error", err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingStudent) {
        const res = await updateStudent(editingStudent._id, payload);
        setStudents((prev) =>
          prev.map((s) => (s._id === editingStudent._id ? res.data : s))
        );
        showToast("success", "Student updated successfully");
        setEditingStudent(null);
      } else {
        const res = await createStudent(payload);
        setStudents((prev) => [res.data, ...prev]);
        showToast("success", "Student added successfully");
      }
      return true;
    } catch (err) {
      showToast("error", err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Delete student "${student.name}" (${student.studentId})?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteStudent(student._id);
      setStudents((prev) => prev.filter((s) => s._id !== student._id));
      if (editingStudent && editingStudent._id === student._id) {
        setEditingStudent(null);
      }
      showToast("success", "Student deleted successfully");
    } catch (err) {
      showToast("error", err.message);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.studentId?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <div className="app">
      <Navbar />

      {toast && (
        <div className={`toast toast--${toast.type}`} role="alert">
          <span className="toast__icon">
            {toast.type === "success" ? "✓" : "⚠"}
          </span>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <main className="container">
        {/* ---------- Hero ---------- */}
        <section className="hero">
          <p className="hero__eyebrow">Student Directory</p>
          <h2 className="hero__title">Manage student records.</h2>
          <p className="hero__subtitle">
            Add, find, update, and remove student information from one secure
            dashboard.
          </p>
        </section>

        {/* ---------- Add / Edit form ---------- */}
        <StudentForm
          onSubmit={handleSubmit}
          editingStudent={editingStudent}
          onCancelEdit={() => setEditingStudent(null)}
          submitting={submitting}
        />

  {/* ---------- List ---------- */}
<section className="card">
  <div className="card__header card__header--split">
    <div className="card__heading">
      <p className="card__eyebrow">Student List</p>
      <div className="card__title-row">
        <h3 className="card__title">All students</h3>
        <span className="count-badge">{students.length}</span>
      </div>
    </div>

    <SearchBar value={search} onChange={setSearch} />
  </div>

  <StudentTable
    students={filteredStudents}
    onEdit={setEditingStudent}
    onDelete={handleDelete}
    loading={loading}
    hasStudents={students.length > 0}
    hasFilter={search.trim().length > 0}
  />
</section>
      </main>

      <footer className="footer">
        <p>
          BIT Student Information Management System 
        </p>
      </footer>
    </div>
  );
}