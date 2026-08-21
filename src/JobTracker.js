import { useState, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════
// CONFIG — searches tailored to your resume
// ══════════════════════════════════════════════
const SEARCHES = [
  "QA Automation Engineer Java Selenium India",
  "SDET Java TestNG RestAssured India",
  "Test Automation Engineer BDD Cucumber India",
];

const STATUSES = [
  { id:"new",          label:"New",           color:"#96C5F7" },
  { id:"interested",   label:"Interested",    color:"#FFD166" },
  { id:"applied",      label:"Applied",       color:"#00D4AA" },
  { id:"not_fit",      label:"Not a Fit",     color:"#FF6B9D" },
];

const getStatus = (map, id) => map[id] || "new";
const getStatusObj = (id) => STATUSES.find(s => s.id === id) || STATUSES[0];

// ══════════════════════════════════════════════
// HELPER: Check if 24 hours have passed
// ══════════════════════════════════════════════
const shouldFetch = (lastFetchTimeStr) => {
  if (!lastFetchTimeStr) return true; // Never fetched
  
  try {
    const lastFetchTime = new Date(lastFetchTimeStr).getTime();
    const now = new Date().getTime();
    const hoursPassed = (now - lastFetchTime) / (1000 * 60 * 60);
    return hoursPassed >= 24;
  } catch {
    return true; // If error parsing, fetch
  }
};

// ══════════════════════════════════════════════
// SETUP SCREEN
// ══════════════════════════════════════════════
function Setup({ onSave }) {
  const [key, setKey] = useState("");
  return (
    <div style={{ maxWidth:600, margin:"60px auto", padding:"0 24px",
      fontFamily:"'DM Mono','Courier New',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box}
        .step-box{background:#0c1018;border:1px solid #111820;border-radius:8px;
          padding:14px 16px;margin-bottom:10px}
        .step-num{width:22px;height:22px;border-radius:50%;background:#FFD166;
          color:#080C10;font-size:11px;font-weight:bold;display:flex;
          align-items:center;justify-content:center;flex-shrink:0}
        .key-inp{width:100%;background:#0c1018;border:1px solid #1e2a3a;
          border-radius:6px;color:#DDE4EE;font-family:inherit;font-size:12px;
          padding:10px 12px;outline:none}
        .key-inp:focus{border-color:#FFD166}
        .key-inp::placeholder{color:#1e3040}
        .save-btn{width:100%;background:#FFD166;border:none;border-radius:6px;
          font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.06em;
          color:#080C10;padding:10px;cursor:pointer;margin-top:10px}
        .save-btn:disabled{opacity:.4;cursor:not-allowed}
        .link{color:#00D4AA;text-decoration:none}
        .link:hover{text-decoration:underline}
      `}</style>
      <div style={{ color:"#FFD166", fontFamily:"'Bebas Neue'",
        fontSize:32, letterSpacing:".04em", marginBottom:6 }}>
        🏢 Job Tracker Setup
      </div>
      <div style={{ fontSize:11, color:"#1e3040", marginBottom:24 }}>
        One-time setup — free RapidAPI key needed. Takes 2 minutes.
      </div>

      {[
        { n:1, title:"Go to RapidAPI",
          body: <span>Open <a className="link" href="https://rapidapi.com" target="_blank" rel="noreferrer">rapidapi.com</a> → Sign up free (no credit card)</span> },
        { n:2, title:"Find JSearch API",
          body: <span>Search <strong style={{color:"#FFD166"}}>"JSearch"</strong> in the search bar → Click it</span> },
        { n:3, title:"Subscribe Free",
          body: <span>Click <strong style={{color:"#FFD166"}}>"Subscribe to Test"</strong> → Select <strong style={{color:"#FFD166"}}>FREE plan</strong> (500 requests/month)</span> },
        { n:4, title:"Copy your API Key",
          body: <span>In the dashboard → look for <strong style={{color:"#FFD166"}}>"X-RapidAPI-Key"</strong> → Copy that value</span> },
      ].map(s => (
        <div className="step-box" key={s.n}>
          <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
            <div className="step-num">{s.n}</div>
            <div>
              <div style={{ fontSize:12, color:"#ccd4e0", fontWeight:500, marginBottom:3 }}>{s.title}</div>
              <div style={{ fontSize:11, color:"#4a6a8a", lineHeight:1.6 }}>{s.body}</div>
            </div>
          </div>
        </div>
      ))}

      <div style={{ marginTop:20, marginBottom:8, fontSize:9,
        color:"#1e3040", letterSpacing:".12em", textTransform:"uppercase" }}>
        Paste your API key here
      </div>
      <input
        className="key-inp"
        placeholder="e.g. a1b2c3d4e5f6..."
        value={key}
        onChange={e => setKey(e.target.value)}
      />
      <button
        className="save-btn"
        disabled={key.trim().length < 10}
        onClick={() => onSave(key.trim())}>
        Save & Start Auto-Fetching →
      </button>

      <div style={{ marginTop:14, fontSize:10, color:"#1e3040",
        lineHeight:1.7, textAlign:"center" }}>
        🔄 Auto-fetches daily (every 24 hours) · Free tier: 500 requests/month
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════
export default function JobTracker() {
  const [apiKey,      setApiKey]      = useState("");
  const [jobs,        setJobs]        = useState([]);
  const [statusMap,   setStatusMap]   = useState({});
  const [loading,     setLoading]     = useState(false);
  const [autoFetching, setAutoFetching] = useState(false); // NEW: Track auto-fetch
  const [error,       setError]       = useState("");
  const [lastFetched, setLastFetched] = useState("");
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [expanded,    setExpanded]    = useState({});
  const [loaded,      setLoaded]      = useState(false);
  const [notes,       setNotes]       = useState({});
  const [editNote,    setEditNote]    = useState(null);

  // Load from localStorage
  useEffect(() => {
    const key  = localStorage.getItem("jt_apikey");
    const jbs  = localStorage.getItem("jt_jobs");
    const stm  = localStorage.getItem("jt_status");
    const lf   = localStorage.getItem("jt_lastfetched");
    const nts  = localStorage.getItem("jt_notes");
    if (key) setApiKey(key);
    if (jbs) setJobs(JSON.parse(jbs));
    if (stm) setStatusMap(JSON.parse(stm));
    if (lf)  setLastFetched(lf);
    if (nts) setNotes(JSON.parse(nts));
    setLoaded(true);
  }, []);

  // Auto-save
  useEffect(() => { if (loaded) localStorage.setItem("jt_jobs",      JSON.stringify(jobs));      }, [jobs,      loaded]);
  useEffect(() => { if (loaded) localStorage.setItem("jt_status",    JSON.stringify(statusMap)); }, [statusMap, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem("jt_notes",     JSON.stringify(notes));     }, [notes,     loaded]);

  const saveKey = (k) => {
    localStorage.setItem("jt_apikey", k);
    setApiKey(k);
  };

  const fetchJobs = useCallback(async (isManual = false) => {
    if (isManual) {
      setLoading(true);
    } else {
      setAutoFetching(true); // NEW: Show auto-fetch indicator
    }
    setError("");
    const all = [];

    for (const query of SEARCHES) {
      try {
        const res = await fetch(
          `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&date_posted=3days&country=in`,
          { headers: {
            "X-RapidAPI-Key":  apiKey,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          }}
        );
        const data = await res.json();
        if (data.data) all.push(...data.data);
        else if (data.message) setError(data.message);
      } catch (e) {
        setError("Network error — check your API key or internet connection.");
      }
    }

    // Deduplicate by job_id
    const unique = [...new Map(all.map(j => [j.job_id, j])).values()];

    // Merge with existing — keep status of old jobs
    setJobs(prev => {
      const prevMap = new Map(prev.map(j => [j.job_id, j]));
      unique.forEach(j => prevMap.set(j.job_id, j));
      return [...prevMap.values()].sort(
        (a, b) => new Date(b.job_posted_at_datetime_utc) - new Date(a.job_posted_at_datetime_utc)
      );
    });

    const now = new Date();
    const formattedNow = now.toLocaleString("en-IN",
      { day:"2-digit", month:"short", year:"numeric",
        hour:"2-digit", minute:"2-digit" });
    
    setLastFetched(formattedNow);
    localStorage.setItem("jt_lastfetched", now.toISOString()); // Save ISO format for 24-hour check
    localStorage.setItem("jt_lastfetched_display", formattedNow); // Save display format
    
    if (isManual) {
      setLoading(false);
    } else {
      setAutoFetching(false); // NEW: Hide auto-fetch indicator
    }
  }, [apiKey]);

  // NEW: Auto-fetch on component mount if > 24 hours
  useEffect(() => {
    if (!loaded || !apiKey) return;
    
    const lastFetchTime = localStorage.getItem("jt_lastfetched");
    if (shouldFetch(lastFetchTime)) {
      console.log("🔄 Auto-fetching jobs (24 hours since last fetch)...");
      fetchJobs(false); // false = auto-fetch, not manual
    }
  }, [loaded, apiKey, fetchJobs]);

  const setStatus = (id, status) =>
    setStatusMap(prev => ({ ...prev, [id]: status }));

  const saveNote = (id, note) => {
    setNotes(prev => ({ ...prev, [id]: note }));
    setEditNote(null);
  };

  if (!apiKey) return <Setup onSave={saveKey} />;

  const filtered = jobs.filter(j => {
    const st = getStatus(statusMap, j.job_id);
    const matchStatus = filter === "all" || st === filter;
    const matchSearch = !search ||
      j.job_title.toLowerCase().includes(search.toLowerCase()) ||
      j.employer_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ background:"#080C10", color:"#DDE4EE", minHeight:"100vh",
      fontFamily:"'DM Mono','Courier New',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box}
        .jcard{background:#0c1018;border:1px solid #111820;border-radius:8px;
          margin-bottom:12px;animation:slideIn .3s ease-out}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        .apply-btn{background:#00D4AA;border:none;border-radius:6px;
          color:#080C10;padding:6px 14px;font-size:11px;cursor:pointer;
          font-weight:bold;text-decoration:none;font-family:inherit;
          flex-shrink:0}
        .apply-btn:hover{opacity:.85}
        .st-btn{background:none;border:1px solid #1e2a3a;border-radius:4px;
          padding:4px 8px;font-size:9px;cursor:pointer;color:#2a3a4a;
          font-family:inherit}
        .st-btn.sel{border-width:2px}
        .st-btn.unsel:hover{border-color:#2a4a5a;color:#3a4a5a}
        .expand-btn{background:none;border:1px solid #1e2a3a;border-radius:4px;
          padding:4px 8px;font-size:9px;cursor:pointer;color:#2a3a4a;
          font-family:inherit}
        .expand-btn:hover{border-color:#2a4a5a;color:#3a4a5a}
        .note-inp{width:100%;background:#0c1018;border:1px solid #1e2a3a;
          border-radius:4px;color:#DDE4EE;font-family:inherit;font-size:11px;
          padding:8px 10px;outline:none;max-height:150px}
        .note-inp:focus{border-color:#00D4AA}
        .fi{display:flex;flex-direction:column;gap:6px}
      `}</style>

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"20px 24px" }}>
        
        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:28, fontFamily:"'Bebas Neue'", color:"#FFD166",
            letterSpacing:".04em", marginBottom:4 }}>🏢 Job Tracker</div>
          <div style={{ fontSize:10, color:"#1e3040", textTransform:"uppercase",
            letterSpacing:".1em", marginBottom:14 }}>
            🔄 Auto-fetches daily · Last updated: {lastFetched || "Never"}
          </div>
          
          {/* Auto-fetch indicator */}
          {autoFetching && (
            <div style={{ fontSize:11, color:"#FFD166", background:"#0a1a0a",
              border:"1px solid #1a3a1a", borderRadius:4, padding:"8px 12px",
              marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>⟳</span>
              Auto-fetching new jobs...
            </div>
          )}
          
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>

        {/* Filter & Search */}
        <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap",
          alignItems:"center" }}>
          <input
            placeholder="Search by title or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex:1, minWidth:200, background:"#0c1018",
              border:"1px solid #1e2a3a", borderRadius:6, padding:"8px 12px",
              color:"#DDE4EE", fontFamily:"inherit", fontSize:11, outline:"none" }}
            onFocus={e => e.target.style.borderColor = "#FFD166"}
            onBlur={e => e.target.style.borderColor = "#1e2a3a"}
          />
          
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ background:"#0c1018", border:"1px solid #1e2a3a",
              borderRadius:6, padding:"8px 12px", color:"#DDE4EE",
              fontFamily:"inherit", fontSize:11, outline:"none", cursor:"pointer" }}
            onFocus={e => e.target.style.borderColor = "#FFD166"}
            onBlur={e => e.target.style.borderColor = "#1e2a3a"}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <button
            onClick={() => fetchJobs(true)} // true = manual fetch
            disabled={loading}
            style={{ background:loading ? "#555" : "#FFD166", border:"none",
              borderRadius:6, padding:"8px 16px", color:"#080C10", cursor:"pointer",
              fontFamily:"inherit", fontSize:11, fontWeight:"bold",
              opacity:loading ? 0.5 : 1 }}>
            {loading ? "Fetching..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Job count */}
        <div style={{ fontSize:10, color:"#1e3040", marginBottom:14 }}>
          {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"40px 20px",
            fontSize:11, color:"#4a6a8a" }}>
            <div style={{ marginBottom:10 }}>🔄 Searching LinkedIn · Indeed · Naukri · Glassdoor</div>
          </div>
        )}

        {/* Jobs list */}
        {!loading && filtered.map((job, idx) => {
          const st       = getStatus(statusMap, job.job_id);
          const stObj    = getStatusObj(st);
          const isExpand = expanded[job.job_id];
          const note     = notes[job.job_id] || "";
          const isEdit   = editNote === job.job_id;

          const posted = job.job_posted_at_datetime_utc
            ? new Date(job.job_posted_at_datetime_utc)
                .toLocaleDateString("en-IN",
                  { day:"2-digit", month:"short" })
            : "";

          const salary = job.job_min_salary
            ? `₹${Math.round(job.job_min_salary/100000)}L – ₹${Math.round(job.job_max_salary/100000)}L`
            : "";

          return (
            <div key={job.job_id}
              className={`jcard fi`}
              style={{ animationDelay:`${Math.min(idx*0.03, 0.3)}s`,
                borderLeftColor: stObj.color,
                borderLeftWidth: 3, borderLeftStyle:"solid" }}>

              {/* Card header */}
              <div style={{ padding:"12px 14px",
                borderBottom: isExpand ? "1px solid #0f1820" : "none" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    {/* Title */}
                    <div style={{ fontSize:13.5, fontWeight:500,
                      color:"#ccd4e0", lineHeight:1.3, marginBottom:5 }}>
                      {job.job_title}
                    </div>
                    {/* Company + location */}
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap",
                      alignItems:"center" }}>
                      <span style={{ fontSize:11, color:"#5a7a9a" }}>
                        🏢 {job.employer_name}
                      </span>
                      {job.job_city && (
                        <span style={{ fontSize:10, color:"#2a4a5a" }}>
                          📍 {job.job_city}{job.job_state ? `, ${job.job_state}` : ""}
                        </span>
                      )}
                      {salary && (
                        <span style={{ fontSize:10, color:"#3a6a3a" }}>
                          💰 {salary}
                        </span>
                      )}
                      {posted && (
                        <span style={{ fontSize:9, color:"#1e3040" }}>
                          🗓 {posted}
                        </span>
                      )}
                      {job.job_employment_type && (
                        <span style={{ fontSize:9, color:"#1e3040",
                          background:"#0c1018", border:"1px solid #111820",
                          borderRadius:4, padding:"1px 6px" }}>
                          {job.job_employment_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Apply button */}
                  <a
                    href={job.job_apply_link}
                    target="_blank"
                    rel="noreferrer"
                    className="apply-btn"
                    onClick={() => {
                      if (st === "new") setStatus(job.job_id, "interested");
                    }}>
                    Apply →
                  </a>
                </div>

                {/* Status buttons */}
                <div style={{ display:"flex", gap:6, marginTop:10,
                  flexWrap:"wrap", alignItems:"center" }}>
                  {STATUSES.map(s => (
                    <button key={s.id}
                      className={`st-btn ${st===s.id?"sel":"unsel"}`}
                      style={st===s.id ? { background:s.color } : {}}
                      onClick={() => setStatus(job.job_id, s.id)}>
                      {s.label}
                    </button>
                  ))}

                  <button className="expand-btn"
                    onClick={() => setExpanded(p => ({ ...p, [job.job_id]: !isExpand }))}>
                    {isExpand ? "▲ Less" : "▼ Details"}
                  </button>

                  {/* Note preview */}
                  {note && !isExpand && (
                    <span style={{ fontSize:9, color:"#3a5a3a",
                      fontStyle:"italic", marginLeft:4 }}>
                      📝 {note.slice(0,40)}{note.length>40?"...":""}
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpand && (
                <div style={{ padding:"12px 14px",
                  background:"#09100f" }} className="fi">

                  {/* Description */}
                  <div style={{ fontSize:9, color:"#1e3040",
                    textTransform:"uppercase", letterSpacing:".1em",
                    marginBottom:6 }}>Job Description</div>
                  <div style={{ fontSize:11, color:"#4a6a5a",
                    lineHeight:1.75, marginBottom:14,
                    maxHeight:150, overflow:"auto",
                    whiteSpace:"pre-wrap" }}>
                    {job.job_description
                      ? job.job_description.slice(0, 800) + (job.job_description.length > 800 ? "..." : "")
                      : "No description available."}
                  </div>

                  {/* Source */}
                  {job.job_publisher && (
                    <div style={{ fontSize:9, color:"#1e3040", marginBottom:12 }}>
                      Source: {job.job_publisher}
                    </div>
                  )}

                  {/* Note */}
                  <div style={{ fontSize:9, color:"#1e3040",
                    textTransform:"uppercase", letterSpacing:".1em",
                    marginBottom:6 }}>My Notes</div>
                  {isEdit ? (
                    <div>
                      <textarea
                        className="note-inp"
                        rows={3}
                        defaultValue={note}
                        placeholder="Add notes about this job..."
                        id={`note-${job.job_id}`}
                      />
                      <div style={{ display:"flex", gap:8, marginTop:6 }}>
                        <button
                          onClick={() => saveNote(job.job_id,
                            document.getElementById(`note-${job.job_id}`).value)}
                          style={{ background:"#00D4AA", border:"none",
                            borderRadius:4, color:"#080C10", fontFamily:"inherit",
                            fontSize:10, cursor:"pointer", padding:"5px 12px" }}>
                          Save Note
                        </button>
                        <button
                          onClick={() => setEditNote(null)}
                          style={{ background:"none", border:"1px solid #1e2a3a",
                            borderRadius:4, color:"#2a3a4a", fontFamily:"inherit",
                            fontSize:10, cursor:"pointer", padding:"5px 12px" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditNote(job.job_id)}
                      style={{ fontSize:11, color: note ? "#5a8a5a" : "#1e3040",
                        fontStyle: note ? "normal" : "italic",
                        cursor:"pointer", padding:"6px 10px",
                        background:"#080C10", border:"1px solid #111820",
                        borderRadius:4, lineHeight:1.6,
                        minHeight:36 }}>
                      {note || "Click to add notes..."}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
