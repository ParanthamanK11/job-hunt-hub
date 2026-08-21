import { useState, useEffect } from "react";

export default function InterviewTracker() {
  const [companies, setCompanies] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [newCompany, setNewCompany] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("it_companies");
    if (saved) setCompanies(JSON.parse(saved));
    setLoaded(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (loaded) localStorage.setItem("it_companies", JSON.stringify(companies));
  }, [companies, loaded]);

  // Add new company
  const addCompany = () => {
    if (!newCompany.trim()) return;
    const company = {
      id: Date.now(),
      name: newCompany,
      addedDate: new Date().toLocaleDateString("en-IN"),
      rounds: {
        l1: { status: "scheduled", date: "", time: "", attended: "", notes: "" },
        l2: { status: "pending", date: "", time: "", attended: "", notes: "" },
        l3: { status: "pending", date: "", time: "", attended: "", notes: "" },
      },
    };
    setCompanies([company, ...companies]);
    setNewCompany("");
  };

  // Update round info
  const updateRound = (companyId, round, field, value) => {
    setCompanies(
      companies.map((c) =>
        c.id === companyId
          ? { ...c, rounds: { ...c.rounds, [round]: { ...c.rounds[round], [field]: value } } }
          : c
      )
    );
  };

  // Delete company
  const deleteCompany = (companyId) => {
    if (window.confirm("Delete this company?")) {
      setCompanies(companies.filter((c) => c.id !== companyId));
    }
  };

  // Get progress percentage
  const getProgress = (rounds) => {
    const completed = Object.values(rounds).filter((r) => r.attended === "yes").length;
    return Math.round((completed / 3) * 100);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      scheduled: "#FFD166",
      pending: "#96C5F7",
      completed: "#00D4AA",
      rejected: "#FF6B9D",
    };
    return colors[status] || "#5a7a9a";
  };

  // Get attended badge
  const getAttendedBadge = (value) => {
    if (value === "yes") return { label: "✓ Attended", color: "#00D4AA", bg: "#0a1a0a" };
    if (value === "no") return { label: "✗ Not Attended", color: "#FF6B9D", bg: "#0a0a0a" };
    if (value === "rescheduled") return { label: "⟳ Rescheduled", color: "#FFD166", bg: "#0a0a08" };
    return { label: "—", color: "#2a3a4a", bg: "transparent" };
  };

  return (
    <div style={{
      fontFamily: "'DM Mono','Courier New',monospace",
      background: "#080C10",
      color: "#DDE4EE",
      minHeight: "100vh",
      padding: "20px 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        
        .it-header {
          max-width: 1200px;
          margin: 0 auto 24px;
        }
        .it-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          letter-spacing: 0.04em;
          color: #FFD166;
          margin-bottom: 4px;
        }
        .it-subtitle {
          font-size: 11px;
          color: #1e3040;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .it-add-box {
          max-width: 1200px;
          margin: 0 auto 20px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .it-input {
          flex: 1;
          min-width: 200px;
          background: #0c1018;
          border: 1px solid #1e2a3a;
          border-radius: 6px;
          padding: 10px 12px;
          color: #DDE4EE;
          font-family: inherit;
          font-size: 12px;
          outline: none;
        }
        .it-input:focus {
          border-color: #FFD166;
        }
        .it-btn-add {
          background: #FFD166;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          color: #080C10;
          font-weight: bold;
          cursor: pointer;
          font-size: 12px;
        }
        .it-btn-add:hover {
          opacity: 0.9;
        }

        .it-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 14px;
        }

        .it-card {
          background: #0c1018;
          border: 1px solid #111820;
          border-radius: 8px;
          overflow: hidden;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .it-card-header {
          background: #0f1620;
          padding: 12px 14px;
          border-bottom: 1px solid #111820;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .it-company-name {
          font-size: 14px;
          font-weight: 600;
          color: #ccd4e0;
          flex: 1;
        }
        .it-company-date {
          font-size: 9px;
          color: #1e3040;
        }

        .it-progress-bar {
          margin: 8px 14px 0;
          height: 4px;
          background: #111820;
          border-radius: 2px;
          overflow: hidden;
        }
        .it-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FFD166 0%, #00D4AA 100%);
          transition: width 0.3s ease;
        }
        .it-progress-text {
          font-size: 9px;
          color: #1e3040;
          padding: 0 14px 8px;
          text-align: right;
        }

        .it-rounds {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .it-round {
          background: #080C10;
          border: 1px solid #111820;
          border-radius: 6px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .it-round-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .it-round-label-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 600;
        }

        .it-round-fields {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .it-field-group {
          display: flex;
          gap: 6px;
          font-size: 10px;
        }

        .it-input-small {
          flex: 1;
          background: #0c1018;
          border: 1px solid #111820;
          border-radius: 4px;
          padding: 6px 8px;
          color: #9ababe;
          font-family: inherit;
          font-size: 10px;
          outline: none;
        }
        .it-input-small:focus {
          border-color: #FFD166;
          color: #ccd4e0;
        }

        .it-select-small {
          flex: 1;
          background: #0c1018;
          border: 1px solid #111820;
          border-radius: 4px;
          padding: 6px 8px;
          color: #9ababe;
          font-family: inherit;
          font-size: 10px;
          outline: none;
          cursor: pointer;
        }
        .it-select-small:focus {
          border-color: #FFD166;
          color: #ccd4e0;
        }

        .it-notes-area {
          background: #0c1018;
          border: 1px solid #111820;
          border-radius: 4px;
          padding: 6px 8px;
          color: #9ababe;
          font-family: inherit;
          font-size: 10px;
          min-height: 50px;
          max-height: 80px;
          overflow-y: auto;
          outline: none;
          resize: none;
        }
        .it-notes-area:focus {
          border-color: #FFD166;
          color: #ccd4e0;
        }

        .it-attended-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: 600;
          white-space: nowrap;
          margin-top: 4px;
        }

        .it-card-footer {
          padding: 10px 14px;
          border-top: 1px solid #111820;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .it-btn-small {
          background: none;
          border: 1px solid #1e2a3a;
          border-radius: 4px;
          padding: 5px 10px;
          color: #2a3a4a;
          font-size: 9px;
          cursor: pointer;
          font-family: inherit;
        }
        .it-btn-small:hover {
          border-color: #2a3a4a;
          color: #3a4a5a;
        }

        .it-btn-delete {
          background: none;
          border: 1px solid #3a1a1a;
          color: #6a3a3a;
        }
        .it-btn-delete:hover {
          border-color: #6a3a3a;
          color: #9a5a5a;
        }

        .it-empty {
          max-width: 1200px;
          margin: 60px auto;
          text-align: center;
          padding: 40px 20px;
        }
        .it-empty-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .it-empty-text {
          font-size: 14px;
          color: #4a6a8a;
          line-height: 1.6;
        }
      `}</style>

      {/* Header */}
      <div className="it-header">
        <div className="it-title">🎯 Interview Tracker</div>
        <div className="it-subtitle">Track company interviews (L1, L2, L3) with dates, times & progress</div>
      </div>

      {/* Add company */}
      <div className="it-add-box">
        <input
          className="it-input"
          placeholder="Enter company name..."
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") addCompany();
          }}
        />
        <button className="it-btn-add" onClick={addCompany}>
          + Add Company
        </button>
      </div>

      {/* Company cards grid */}
      {companies.length === 0 ? (
        <div className="it-empty">
          <div className="it-empty-icon">📋</div>
          <div className="it-empty-text">
            No companies yet. <br />
            Add your first company to start tracking interviews.
          </div>
        </div>
      ) : (
        <div className="it-grid">
          {companies.map((company) => {
            const progress = getProgress(company.rounds);
            return (
              <div key={company.id} className="it-card">
                {/* Card header */}
                <div className="it-card-header">
                  <div>
                    <div className="it-company-name">{company.name}</div>
                    <div className="it-company-date">Added: {company.addedDate}</div>
                  </div>
                  <button
                    className="it-btn-small it-btn-delete"
                    onClick={() => deleteCompany(company.id)}
                    title="Delete company"
                  >
                    ×
                  </button>
                </div>

                {/* Progress bar */}
                <div className="it-progress-bar">
                  <div
                    className="it-progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="it-progress-text">{progress}% complete</div>

                {/* Rounds */}
                <div className="it-rounds">
                  {["l1", "l2", "l3"].map((round, idx) => {
                    const roundData = company.rounds[round];
                    const attendedBadge = getAttendedBadge(roundData.attended);
                    const statusColor = getStatusColor(roundData.status);

                    return (
                      <div key={round} className="it-round">
                        {/* Round label & status */}
                        <div className="it-round-label">
                          <span style={{ color: "#ccd4e0" }}>
                            L{idx + 1}
                          </span>
                          <div
                            className="it-round-label-badge"
                            style={{
                              background: `${statusColor}15`,
                              color: statusColor,
                              border: `1px solid ${statusColor}30`,
                            }}
                          >
                            {roundData.status}
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="it-field-group">
                          <input
                            type="date"
                            className="it-input-small"
                            value={roundData.date}
                            onChange={(e) => updateRound(company.id, round, "date", e.target.value)}
                            placeholder="Date"
                          />
                          <input
                            type="time"
                            className="it-input-small"
                            value={roundData.time}
                            onChange={(e) => updateRound(company.id, round, "time", e.target.value)}
                            placeholder="Time"
                          />
                        </div>

                        {/* Status & Attended */}
                        <div className="it-field-group">
                          <select
                            className="it-select-small"
                            value={roundData.status}
                            onChange={(e) => updateRound(company.id, round, "status", e.target.value)}
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <select
                            className="it-select-small"
                            value={roundData.attended}
                            onChange={(e) => updateRound(company.id, round, "attended", e.target.value)}
                          >
                            <option value="">Not Set</option>
                            <option value="yes">Attended</option>
                            <option value="no">Not Attended</option>
                            <option value="rescheduled">Rescheduled</option>
                          </select>
                        </div>

                        {/* Attended badge */}
                        {roundData.attended && (
                          <div
                            className="it-attended-badge"
                            style={{
                              background: attendedBadge.bg,
                              color: attendedBadge.color,
                              border: `1px solid ${attendedBadge.color}40`,
                            }}
                          >
                            {attendedBadge.label}
                          </div>
                        )}

                        {/* Notes */}
                        <textarea
                          className="it-notes-area"
                          placeholder="Interview notes..."
                          value={roundData.notes}
                          onChange={(e) => updateRound(company.id, round, "notes", e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Card footer */}
                <div className="it-card-footer">
                  <span style={{ fontSize: "9px", color: "#1e3040", flex: 1 }}>
                    {Object.values(company.rounds).filter((r) => r.attended).length} of 3 rounds tracked
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
