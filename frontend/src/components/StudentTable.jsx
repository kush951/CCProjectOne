// frontend/src/components/StudentTable.jsx
import React from "react";

export default function StudentTable({
  students,
  onEdit,
  onDelete,
  loading,
  hasStudents,
  hasFilter,
}) {
  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="table-state">
        <div className="spinner" />
        <p>Loading students…</p>
      </div>
    );
  }

  /* ---------------- Empty (no students at all) ---------------- */
  if (!hasStudents) {
    return (
      <div className="table-state table-state--empty">
        <div className="table-state__icon">📋</div>
        <h3>No students yet</h3>
        <p>Add your first student using the form above.</p>
      </div>
    );
  }

  /* ---------------- Empty (filter matched none) ---------------- */
  if (hasFilter && students.length === 0) {
    return (
      <div className="table-state table-state--empty">
        <div className="table-state__icon">🔍</div>
        <h3>No matching students</h3>
        <p>Try a different search term.</p>
      </div>
    );
  }

  /* ---------------- Table ---------------- */
  return (
    <div className="table-wrapper">
      <table className="student-table">
        <thead>
          <tr>
            <th className="col-id">Student ID</th>
            <th className="col-name">Name</th>
            <th className="col-email">Email</th>
            <th className="col-dept">Department</th>
            <th className="col-sem text-center">Semester</th>
            <th className="col-contact">Contact</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td className="col-id">
                <span className="cell-id">{s.studentId}</span>
              </td>

              <td className="col-name">
                <span className="cell-name" title={s.name}>
                  {s.name}
                </span>
              </td>

              <td className="col-email">
                <a
                  className="cell-email"
                  href={`mailto:${s.email}`}
                  title={s.email}
                >
                  {s.email}
                </a>
              </td>

              <td className="col-dept">
                <span className="cell-dept">{s.department}</span>
              </td>

              <td className="col-sem text-center">
                <span className="cell-sem">{s.semester}</span>
              </td>

              <td className="col-contact">
                {s.contact ? (
                  <span className="cell-contact">{s.contact}</span>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>

              <td className="col-actions">
                <div className="action-links">
                  <button
                    type="button"
                    className="link-btn link-btn--edit"
                    onClick={() => onEdit(s)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="link-btn link-btn--delete"
                    onClick={() => onDelete(s)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}