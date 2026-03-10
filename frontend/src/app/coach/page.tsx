"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { generateProgram, getPrograms, getProgram, logWorkout, getExercises } from "@/lib/api";

const GOALS = ["mass_gain", "cut", "recomp", "strength", "endurance"];
const GOAL_LABELS: Record<string, string> = { mass_gain: "Prise de masse", cut: "Sèche", recomp: "Recomposition", strength: "Force", endurance: "Endurance" };
const SPLITS = ["ppl", "upper_lower", "full_body"];
const SPLIT_LABELS: Record<string, string> = { ppl: "Push/Pull/Legs", upper_lower: "Upper/Lower", full_body: "Full Body" };

export default function CoachPage() {
  const { token } = useAuth();
  const [phase, setPhase] = useState<"setup" | "generating" | "program">("setup");
  const [programs, setPrograms] = useState<any[]>([]);
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerMax, setTimerMax] = useState(0);
  const [logs, setLogs] = useState<Record<string, any>>({});
  const timerRef = useRef<any>(null);

  // Form state
  const [goal, setGoal] = useState("mass_gain");
  const [split, setSplit] = useState("ppl");
  const [weeks, setWeeks] = useState(8);
  const [days, setDays] = useState(4);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      getPrograms(token).then((progs) => {
        setPrograms(progs);
        const active = progs.find((p: any) => p.is_active);
        if (active) {
          getProgram(token, active.id).then((full) => {
            setActiveProgram(full);
            setPhase("program");
          });
        }
      }).catch(() => {});
    }
  }, [token]);

  const startTimer = (secs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerMax(secs);
    setTimer(secs);
    timerRef.current = setInterval(() => {
      setTimer((p) => {
        if (p === null || p <= 1) { clearInterval(timerRef.current); return null; }
        return p - 1;
      });
    }, 1000);
  };

  const handleGenerate = async () => {
    if (!token) return;
    setError("");
    setPhase("generating");
    try {
      const result = await generateProgram(token, {
        goal, split_type: split, duration_weeks: weeks, days_per_week: days, notes: notes || undefined,
      });
      setActiveProgram(result);
      setPhase("program");
    } catch (err: any) {
      setError(err.message);
      setPhase("setup");
    }
  };

  const logSet = (exIdx: number, setIdx: number, field: string, value: string) => {
    const key = `${selectedWeek}-${selectedDay}-${exIdx}-${setIdx}`;
    setLogs((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), [field]: value } }));
  };

  // Setup phase
  if (phase === "setup") {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold">🤖 Coach IA</h1>
          <p className="text-gray-500 text-sm mt-1">Génère un programme personnalisé par intelligence artificielle</p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-bold mb-5">Configure ton programme</h2>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-2">Objectif</label>
                <div className="flex gap-2 flex-wrap">
                  {GOALS.map((g) => (
                    <button key={g} onClick={() => setGoal(g)} className={`px-3 py-2 rounded-lg text-xs transition ${goal === g ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold" : "border-gray-700 text-gray-400"} border`}>
                      {GOAL_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Type de split</label>
                <div className="flex gap-2">
                  {SPLITS.map((s) => (
                    <button key={s} onClick={() => setSplit(s)} className={`px-3 py-2 rounded-lg text-xs transition ${split === s ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold" : "border-gray-700 text-gray-400"} border`}>
                      {SPLIT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Durée (semaines)</label>
                  <select value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none">
                    {[4, 6, 8, 10, 12, 16].map((w) => <option key={w} value={w}>{w} semaines</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Jours / semaine</label>
                  <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none">
                    {[2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{d} jours</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Notes (optionnel)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Blessures, préférences, focus..." className="w-full p-3 rounded-lg bg-gray-950 border border-gray-800 text-sm outline-none resize-none h-16" />
              </div>

              <button onClick={handleGenerate} className="w-full py-3.5 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold hover:opacity-90 transition">
                ⚡ Générer mon programme
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generating
  if (phase === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-14 h-14 border-3 border-gray-700 border-t-emerald-500 rounded-full animate-spin mb-5" />
        <h3 className="text-lg font-bold mb-2">Génération en cours...</h3>
        <p className="text-gray-400 text-sm">L'IA analyse ton profil et crée un programme optimal</p>
      </div>
    );
  }

  // Program view
  const program = activeProgram?.program;
  if (!program?.weeks) {
    return <div className="text-gray-500 text-center py-20">Programme vide. <button onClick={() => setPhase("setup")} className="text-emerald-500 underline">Générer un nouveau</button></div>;
  }

  const week = program.weeks[selectedWeek];
  const session = week?.sessions?.[selectedDay];

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">{activeProgram.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{activeProgram.description}</p>
        </div>
        <button onClick={() => setPhase("setup")} className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-400 hover:text-white transition">
          🔄 Nouveau programme
        </button>
      </div>

      {/* Week selector */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {program.weeks.map((_: any, i: number) => (
          <button key={i} onClick={() => { setSelectedWeek(i); setSelectedDay(0); }} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${selectedWeek === i ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold" : "border-gray-700 text-gray-400"} border transition`}>
            S{i + 1} {program.weeks[i].theme && `— ${program.weeks[i].theme}`}
          </button>
        ))}
      </div>

      {/* Day selector */}
      {week?.sessions && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {week.sessions.map((s: any, i: number) => (
            <button key={i} onClick={() => setSelectedDay(i)} className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap ${selectedDay === i ? "bg-blue-500/15 border-blue-500 text-blue-400 font-semibold" : "border-gray-700 text-gray-400"} border transition`}>
              J{s.day_of_week} — {s.name || s.session_type}
            </button>
          ))}
        </div>
      )}

      {/* Timer */}
      {timer !== null && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center mb-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Repos</div>
          <div className="text-4xl font-extrabold text-emerald-400 tabular-nums">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}</div>
          <div className="h-1 bg-gray-800 rounded-full mt-2"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(timer / timerMax) * 100}%` }} /></div>
        </div>
      )}

      {/* Exercises */}
      {session?.exercises ? (
        <div className="space-y-3">
          {session.exercises.map((ex: any, exIdx: number) => (
            <div key={exIdx} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="font-bold text-sm">{ex.exercise_name || `Exercice ${ex.exercise_id}`}</h4>
                  <span className="text-xs text-gray-500">{ex.sets} séries × {ex.reps_target} · RPE {ex.rpe_target || "—"}</span>
                </div>
                <button onClick={() => startTimer(ex.rest_seconds || 90)} className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                  ⏱ {(ex.rest_seconds || 90) >= 60 ? `${Math.floor((ex.rest_seconds || 90) / 60)}min` : `${ex.rest_seconds}s`}
                </button>
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${ex.sets}, 1fr)` }}>
                {Array.from({ length: ex.sets }, (_, si) => {
                  const key = `${selectedWeek}-${selectedDay}-${exIdx}-${si}`;
                  const log = logs[key] || {};
                  return (
                    <div key={si} className="bg-gray-950 rounded-lg p-2 text-center">
                      <div className="text-[9px] text-gray-500 mb-1">Série {si + 1}</div>
                      <input value={log.kg || ""} onChange={(e) => logSet(exIdx, si, "kg", e.target.value)} placeholder="kg" className="w-full p-1.5 rounded bg-gray-900 border border-gray-800 text-center text-sm outline-none focus:border-emerald-500" />
                      <input value={log.reps || ""} onChange={(e) => logSet(exIdx, si, "reps", e.target.value)} placeholder="reps" className="w-full p-1 rounded bg-gray-900 border border-gray-800 text-center text-xs outline-none focus:border-emerald-500 mt-1" />
                      {log.kg && log.reps && <div className="text-emerald-400 text-[10px] mt-1">✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold hover:opacity-90 transition">
            ✅ Terminer la séance
          </button>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">Sélectionne une séance</div>
      )}
    </div>
  );
}
