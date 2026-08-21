import { useState, useEffect } from "react";
import JobTracker from './JobTracker';
import InterviewTracker from './InterviewTracker';

// ── TAB CONFIGURATION FOR JOB APP ──
const TABS = [
  { id: "interviews", label: "🎯 Interview Tracker", icon: "🎯" },
  { id: "jobs", label: "🏢 Job Tracker", icon: "🏢" },
];

// ══════════════════════════════════════════════════════════════
// JOB APP — SEPARATE FOCUSED APP FOR JOB HUNTING
// ══════════════════════════════════════════════════════════════
export default function JobApp() {
  const [tab, setTab] = useState("interviews"); // Start with Interview Tracker

  return (
    <div style={{
      background: "#080C10",
      color: "#DDE4EE",
      minHeight: "100vh",
      fontFamily: "'DM Mono','Courier New',monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        /* Header */
        .job-app-header {
          background: linear-gradient(135deg, #FFD166 0%, #00D4AA 100%);
          padding: 24px;
          text-align: center;
        }
        
        .job-app-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px;
          letter-spacing: 0.04em;
          color: #080C10;
          margin: 0;
        }
        
        .job-app-subtitle {
          font-size: 12px;
          color: #080C10;
          opacity: 0.8;
          margin-top: 4px;
        }
        
        /* Tab Navigation */
        .tab-nav {
          position: sticky;
          top: 0;
          background: #0c1018;
          border-bottom: 2px solid #111820;
          overflow-x: auto;
          z-index: 100;
          display: flex;
          gap: 0;
        }
        
        .tab-btn {
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: #4a6a8a;
          padding: 14px 24px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.2s ease;
          text-decoration: none;
          letter-spacing: 0.02em;
        }
        
        .tab-btn:hover {
          color: #7a9aaa;
          background: #080C10;
        }
        
        .tab-btn.active {
          color: #FFD166;
          border-bottom-color: #FFD166;
          background: #0f1620;
        }
        
        /* Content */
        .tab-content {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #0c1018;
        }
        ::-webkit-scrollbar-thumb {
          background: #1a2a3a;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2a3a5a;
        }
      `}</style>

      {/* Header */}
      <div className="job-app-header">
        <h1 className="job-app-title">💼 Job Hunt Hub</h1>
        <p className="job-app-subtitle">Track interviews & job applications in one place</p>
      </div>

      {/* Tab Navigation */}
      <nav className="tab-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
            title={t.label}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        
        {/* Interview Tracker */}
        {tab === "interviews" && <InterviewTracker />}

        {/* Job Tracker */}
        {tab === "jobs" && <JobTracker />}
      </div>
    </div>
  );
}
