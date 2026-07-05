"use client";

import { useState } from "react";
import Image from "next/image";

interface Results {
  total: number;
  bySite: Record<string, number>;
  byUnit: Record<string, number>;
  byDepartment: Record<string, number>;
}

function CountTable({ title, counts }: { title: string; counts: Record<string, number> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
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
      setError("סיסמה שגויה");
      setLoading(false);
      return;
    }
    setLoggedIn(true);
    await loadResults();
    setLoading(false);
  }

  async function loadResults() {
    setResultsError("");
    try {
      const res = await fetch("/api/hr-results");
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

  if (!loggedIn) {
    return (
      <main dir="rtl" className="max-w-sm mx-auto p-6 mt-20">
        <Image src="/logo.png" alt="Isotopia" width={160} height={58} className="mx-auto mb-6" />
        <h1 className="text-xl font-bold mb-4 text-brand-primary">כניסת HR</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white rounded p-2 font-semibold hover:bg-brand-primary-dark">
            כניסה
          </button>
        </form>
      </main>
    );
  }

  return (
    <main dir="rtl" className="max-w-2xl mx-auto p-6">
      <Image src="/logo.png" alt="Isotopia" width={160} height={58} className="mb-6" />
      <h1 className="text-xl font-bold mb-4 text-brand-primary">תוצאות הסקר</h1>
      {resultsError && <p className="text-red-600 mb-4">{resultsError}</p>}
      {results ? (
        <>
          <p className="mb-6 text-lg">
            סה&quot;כ תשובות שהתקבלו: <strong>{results.total}</strong>
          </p>
          <CountTable title="לפי אתר" counts={results.bySite} />
          <CountTable title="לפי יחידה" counts={results.byUnit} />
          <CountTable title="לפי מחלקה" counts={results.byDepartment} />
          <a
            href="/api/hr-results?format=csv"
            className="inline-block bg-green-600 text-white rounded px-4 py-2 font-semibold hover:bg-green-700"
          >
            הורדת כל התשובות (CSV לאקסל)
          </a>
        </>
      ) : (
        !resultsError && <p>טוען...</p>
      )}
    </main>
  );
}
