import React from 'react'
import { resultStyles } from '../assets/dummyStyles'
import { useState } from 'react';
import axios from 'axios';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { API_BASE } from '../config';
import { DashboardSkeleton, EmptyState, ErrorState } from './UiStates';


const Badge = ({ percent }) => {
  if (percent >= 85)
    return <span className={resultStyles.badgeExcellent}>Excellent</span>;
  if (percent >= 65)
    return <span className={resultStyles.badgeGood}>Good</span>;
  if (percent >= 45)
    return <span className={resultStyles.badgeAverage}>Average</span>;
  return <span className={resultStyles.badgeNeedsWork}>Needs Work</span>;
};

const MyResult = ({ apiBase = API_BASE }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTechnology, setSelectedTechnology] = useState("all");
  const [technologies, setTechnologies] = useState([]);

  const getAuthHeader = useCallback(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Effect: Fetch results when component mounts or when selectedTechnology changes
  useEffect(() => {
    let mounted = true;
    const fetchResults = async (tech = "all") => {
      setLoading(true);
      setError(null);
      try {
        const q =
          tech && tech.toLowerCase() !== "all"
            ? `?technology=${encodeURIComponent(tech)}`
            : "";
        const res = await axios.get(`${apiBase}/api/results${q}`, {
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          timeout: 10000,
        });
        if (!mounted) return;
        if (res.status === 200 && res.data && res.data.success) {
          setResults(Array.isArray(res.data.results) ? res.data.results : []);
        } else {
          setResults([]);
          toast.warn("Unexpected server response while fetching results.");
        }
      } catch (err) {
        console.error(
          "Failed to fetch results:",
          err?.response?.data || err.message || err
        );
        if (!mounted) return;
        if (err?.response?.status === 401) {
          setError("Not authenticated. Please log in to view results.");
          toast.error("Not authenticated. Please login.");
        } else {
          setError("Could not load results from server.");
          toast.error("Could not load results from server.");
          setResults([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchResults(selectedTechnology);
    return () => {
      mounted = false;
    };
  }, [apiBase, selectedTechnology, getAuthHeader]);


  // Effect: fetch all results once (or when apiBase changes) to build a list
  // of available `technologies` for filter buttons.
  useEffect(() => {
    let mounted = true;
    const fetchAllForTechList = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/results`, {
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          timeout: 10000,
        });
        if (!mounted) return;
        if (res.status === 200 && res.data && res.data.success) {
          const all = Array.isArray(res.data.results) ? res.data.results : [];
          const set = new Set();
          all.forEach((r) => {
            if (r.technology) set.add(r.technology);
          });
          const arr = Array.from(set).sort((a, b) => a.localeCompare(b));
          setTechnologies(arr);
        } else {
          // leave technologies empty (will still show "All")
        }
      } catch (err) {
          // Silent: no need to block main UI; log for debug.
        console.error(
          "Failed to fetch technologies:",
          err?.response?.data || err.message || err
        );
      }
    };
    fetchAllForTechList();
    return () => {
      mounted = false;
    };
  }, [apiBase, getAuthHeader]);


  const makeKey = (r) => (r && r._id ? r._id : `${r.id}||${r.title}`);

  // `summary` is memoized so it only recalculates when `results` changes.
  // It aggregates totals and computes an overall percentage.
  const summary = useMemo(() => {
    const source = Array.isArray(results) ? results : [];
    const totalQs = source.reduce(
      (s, r) => s + (Number(r.totalQuestions) || 0),
      0
    );
    const totalCorrect = source.reduce(
      (s, r) => s + (Number(r.correct) || 0),
      0
    );
    const totalWrong = source.reduce((s, r) => s + (Number(r.wrong) || 0), 0);
    const pct = totalQs ? Math.round((totalCorrect / totalQs) * 100) : 0;
    return { totalQs, totalCorrect, totalWrong, pct };
  }, [results]);

  // Group results by the first word of the title (used as "track")
  const grouped = useMemo(() => {
    const src = Array.isArray(results) ? results : [];
    const map = {};
    src.forEach((r) => {
      const track = (r.title || "").split(" ")[0] || "General";
      if (!map[track]) map[track] = [];
      map[track].push(r);
    });
    return map;
  }, [results]);

  // Handler called when user clicks a technology filter button
  const handleSelectTech = (tech) => {
    setSelectedTechnology(tech || "all");
  };

  return (
    <div className={resultStyles.pageContainer}>
      <div className={resultStyles.container}>
        <header className={resultStyles.header}>
          <div>
            <h1 className={resultStyles.title}>Quiz Results </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Download certificates, filter attempts, and track progress across every quiz category.
            </p>
          </div>
          <div className={resultStyles.headerControls} />
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <SummaryTile label="Attempts" value={Array.isArray(results) ? results.length : 0} />
          <SummaryTile label="Questions" value={summary.totalQs} />
          <SummaryTile label="Correct" value={summary.totalCorrect} />
          <SummaryTile label="Accuracy" value={`${summary.pct}%`} />
        </div>

        <div className={resultStyles.filterContainer}>
          <div className={resultStyles.filterContent}>
            <div className={resultStyles.filterButtons}>
              <span className={resultStyles.filterLabel}>Filter by tech:</span>

              <button
                onClick={() => handleSelectTech("all")}
                className={`${resultStyles.filterButton} ${selectedTechnology === "all"
                  ? resultStyles.filterButtonActive
                  : resultStyles.filterButtonInactive
                  }`}
              >
                ALL
              </button>

              {/* dynamic technology buttons */}
              {technologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleSelectTech(tech)}
                  className={`${resultStyles.filterButton} ${selectedTechnology === tech
                    ? resultStyles.filterButtonActive
                    : resultStyles.filterButtonInactive
                    }`}
                >
                  {tech}
                </button>
              ))}

              {/* If we don't yet have technologies but results exist, derive from current results */}
              {technologies.length === 0 &&
                Array.isArray(results) &&
                results.length > 0 &&
                [
                  ...new Set(results.map((r) => r.technology).filter(Boolean)),
                ].map((tech) => (
                  <button
                    key={`fallback-${tech}`}
                    onClick={() => handleSelectTech(tech)}
                    className={`${resultStyles.filterButton} ${selectedTechnology === tech
                      ? resultStyles.filterButtonActive
                      : resultStyles.filterButtonInactive
                      }`}
                    aria-pressed={selectedTechnology === tech}
                  >
                    {tech}
                  </button>
                ))}
            </div>

            <div className={resultStyles.filterStatus}>
              {selectedTechnology === "all"
                ? "Showing all technologies"
                : `Filtering : ${selectedTechnology}`}
            </div>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton cards={4} rows={2} />
        ) : error ? (
          <ErrorState title="Results could not be loaded" message={error} />
        ) : (
          <>
            {Object.entries(grouped).map(([track, items]) => (
              <section key={track} className={resultStyles.trackSection}>
                <h2 className={resultStyles.trackTitle}>{track} Track</h2>

                <div className={resultStyles.resultsGrid}>
                  {items.map((r) => (
                    <StripCard key={makeKey(r)} item={r} />
                  ))}
                </div>
              </section>
            ))}

            {Array.isArray(results) && results.length === 0 && !error && (
              <EmptyState
                title="No quiz results yet"
                message="Complete your first quiz to unlock score history, certificates, and accuracy insights."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function StripCard({ item }) {
  const percent = item.totalQuestions
    ? Math.round((Number(item.correct) / Number(item.totalQuestions)) * 100)
    : 0;

  const getLevel = (it) => {
    const id = (it.id || "").toString().toLowerCase();
    const title = (it.title || "").toString().toLowerCase();
    if (id.includes("basic") || title.includes(" basic"))
      return { letter: "B", style: resultStyles.levelBasic };
    if (id.includes("intermediate") || title.includes(" intermediate"))
      return { letter: "I", style: resultStyles.levelIntermediate };
    return { letter: "A", style: resultStyles.levelAdvanced };
  };

  const level = getLevel(item);
  const downloadCertificate = () => {
    const user = getCurrentUser();
    const percent = item.totalQuestions
      ? Math.round((Number(item.correct) / Number(item.totalQuestions)) * 100)
      : 0;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    doc.setFillColor(2, 6, 23);
    doc.rect(0, 0, 842, 595, 'F');
    doc.setDrawColor(103, 232, 249);
    doc.setLineWidth(4);
    doc.roundedRect(36, 36, 770, 523, 18, 18, 'S');
    doc.setTextColor(103, 232, 249);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('QuizMaster Certificate', 421, 110, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(42);
    doc.text('Certificate of Achievement', 421, 185, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(203, 213, 225);
    doc.text('This certificate is proudly presented to', 421, 235, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(255, 255, 255);
    doc.text(user?.name || 'Student', 421, 285, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(203, 213, 225);
    doc.text(`for completing ${item.title} with a score of ${percent}%`, 421, 335, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(134, 239, 172);
    doc.text(`Performance: ${item.performance || 'Completed'}`, 421, 380, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text(`Issued on ${new Date(item.createdAt || Date.now()).toLocaleDateString()}`, 421, 492, { align: 'center' });
    doc.save(`${item.title || 'quiz'}-certificate.pdf`.replace(/\s+/g, '-').toLowerCase());
  };


  return (
    <article className={resultStyles.card}>
      <div className={resultStyles.cardAccent}></div>

      <div className={resultStyles.cardContent}>
        <div className={resultStyles.cardHeader}>
          <div className={resultStyles.cardInfo}>
            <div className={`${resultStyles.levelAvatar} ${level.style}`}>
              {level.letter}
            </div>

            <div className={resultStyles.cardText}>
              <h3 className={resultStyles.cardTitle}>{item.title}</h3>

              <div className={resultStyles.cardMeta}>
                {item.totalQuestions} Qs
                  {item.timeSpent ? ` - ${item.timeSpent}` : ""}
              </div>
            </div>
          </div>

          <div className={resultStyles.cardPerformance}>
            <div className={resultStyles.performanceLabel}>Performance</div>
            <div className={resultStyles.badgeContainer}>
              <Badge percent={percent} />
            </div>
            <button
              type="button"
              onClick={downloadCertificate}
              className="mt-3 inline-flex items-center justify-center gap-1 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1.5 text-xs font-black text-cyan-100 transition hover:bg-cyan-300/15"
            >
              <Download size={14} />
              Certificate
            </button>
          </div>
        </div>

        <div className={resultStyles.cardStats}>
          <div className={resultStyles.statItem}>
            Correct:
            <span className={resultStyles.statNumber}>{item.correct}</span>
          </div>

           <div className={resultStyles.statItem}>
            Wrong:
            <span className={resultStyles.statNumber}>{item.wrong}</span>
          </div>

          <div className={resultStyles.statItem}>
            Score:
            <span className={resultStyles.statNumber}>{percent}%</span>
          </div>
        </div>
      </div>
    </article >
  );

}

export default MyResult;
