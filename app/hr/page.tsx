"use client";

import { useState } from "react";
import Image from "next/image";

interface Results {
  scope: "full" | "us" | "modiin";
  total: number;
  bySite: Record<string, number>;
  byUnit: Record<string, number>;
  byDepartment: Record<string, number>;
}

type LocaleFilter = "" | "he" | "en";

function CountTable({ title, counts }: { title: string; counts: Record<string, number> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <table className="text-sm border-collapse">
        <tbody>
          {entries.map(([name, count]) => (
            <tr key={name} className="border-b border-gray-100">
              <td className="p-1 pl-6">{name}</td>
              <td className="p-1 font-medium">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HrResultsPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [localeFilter, setLocaleFilter] = useState<LocaleFilter>("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/hr-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Incorrect password");
      setLoading(false);
      return;
    }
    setLoggedIn(true);
    await loadResults(localeFilter);
    setLoading(false);
  }

  async function loadResults(filter: LocaleFilter) {
    setResultsError("");
    try {
      const qs = filter ? `?locale=${filter}` : "";
      const res = await fetch(`/api/hr-results${qs}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setResultsError(body.error ?? `שגיאה בטעינת התוצאות (${res.status})`);
        return;
      }
      setResults(await res.json());
    } catch {
      setResultsError("שגיאה בטעינת התוצאות");
    }
  }

  function handleFilterChange(filter: LocaleFilter) {
    setLocaleFilter(filter);
    loadResults(filter);
  }

  if (!loggedIn) {
    return (
      <main dir="ltr" className="max-w-sm mx-auto p-6 mt-20">
        <Image src="/logo.png" alt="Isotopia" width={160} height={58} className="mx-auto mb-6" />
        <h1 className="text-xl font-bold mb-4 text-brand-primary">HR Login</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white rounded p-2 font-semibold hover:bg-brand-primary-dark">
            Login
          </button>
        </form>
      </main>
    );
  }

  const isUs = results?.scope === "us";

  return (
    <main dir={isUs ? "ltr" : "rtl"} className="max-w-2xl mx-auto p-6">
      <Image src="/logo.png" alt="Isotopia" width={160} height={58} className="mb-6" />
      <h1 className="text-xl font-bold mb-4 text-brand-primary">{isUs ? "Survey Results" : "תוצאות הסקר"}</h1>
      {resultsError && <p className="text-red-600 mb-4">{resultsError}</p>}
      {results ? (
        <>
          {results.scope === "full" && (
            <div className="flex gap-2 mb-6">
              {(
                [
                  ["", "הכול"],
                  ["he", "ישראל"],
                  ["en", "ארה\"ב"],
                ] as [LocaleFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value || "all"}
                  onClick={() => handleFilterChange(value)}
                  className={`rounded px-4 py-1.5 text-sm font-semibold border ${
                    localeFilter === value
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <p className="mb-6 text-lg">
            {isUs ? (
              <>
                Total responses received: <strong>{results.total}</strong>
              </>
            ) : (
              <>
                סה&quot;כ תשובות שהתקבלו: <strong>{results.total}</strong>
              </>
            )}
          </p>
          <CountTable title={isUs ? "By Site" : "לפי אתר"} counts={results.bySite} />
          <CountTable title={isUs ? "By Unit" : "לפי יחידה"} counts={results.byUnit} />
          <CountTable title={isUs ? "By Department" : "לפי מחלקה"} counts={results.byDepartment} />
          <a
            href={`/api/hr-results?format=csv${localeFilter ? `&locale=${localeFilter}` : ""}`}
            className="inline-block bg-green-600 text-white rounded px-4 py-2 font-semibold hover:bg-green-700"
          >
            {isUs ? "Download all responses (CSV for Excel)" : "הורדת כל התשובות (CSV לאקסל)"}
          </a>
        </>
      ) : (
        !resultsError && <p>{isUs ? "Loading..." : "טוען..."}</p>
      )}
    </main>
  );
}
