// frontend/src/components/SearchBar.jsx
import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search by ID or name…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search students"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}