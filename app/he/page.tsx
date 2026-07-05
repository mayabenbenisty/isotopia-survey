"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RatingTable from "@/components/RatingTable";
import CheckboxTable, { CheckboxPair } from "@/components/CheckboxTable";
import { supabase } from "@/lib/supabaseClient";
import {
  RATING_SECTIONS,
  RECOMMEND_REASONS_POSITIVE,
  RECOMMEND_REASONS_NEGATIVE,
  RECOMMEND_REASON_OTHER_ID,
  SATISFACTION_FACTORS,
  SATISFACTION_FACTORS_MAX,
  MANAGER_TRAITS,
  CULTURE_TRAITS,
  CLOSING_QUESTIONS,
  FAIRNESS_FOLLOWUP_LABEL,
  IL_SITES,
  IL_UNITS,
  IL_DEPARTMENTS,
  ScaleValue,
} from "@/lib/questions";

export default function HebrewSurveyPage() {
  const router = useRouter();

  const [site, setSite] = useState("");
  const [unit, setUnit] = useState("");
  const [department, setDepartment] = useState("");

  const [ratings, setRatings] = useState<Record<string, Record<string, ScaleValue>>>({});

  const [recommendSelected, setRecommendSelected] = useState<string[]>([]);
  const [recommendOtherText, setRecommendOtherText] = useState("");

  const [satisfactionFactors, setSatisfactionFactors] = useState<string[]>([]);

  const [managerTraits, setManagerTraits] = useState<Record<string, CheckboxPair>>({});
  const [cultureTraits, setCultureTraits] = useState<Record<string, CheckboxPair>>({});

  const [fairnessFollowup, setFairnessFollowup] = useState("");
  const [closingAnswers, setClosingAnswers] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function setRating(sectionId: string, itemId: string, value: ScaleValue) {
    setRatings((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [itemId]: value },
    }));
  }

  function toggleRecommendReason(id: string) {
    setRecommendSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSatisfactionFactor(id: string) {
    setSatisfactionFactors((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= SATISFACTION_FACTORS_MAX) return prev;
      return [...prev, id];
    });
  }

  function setManagerTrait(itemId: string, key: "a" | "b", checked: boolean) {
    setManagerTraits((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] ?? { a: false, b: false }), [key]: checked } }));
  }

  function setCultureTrait(itemId: string, key: "a" | "b", checked: boolean) {
    setCultureTraits((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] ?? { a: false, b: false }), [key]: checked } }));
  }

  const recommendValue = ratings.general_satisfaction?.recommend;
  const showPositiveReasons = recommendValue === 3 || recommendValue === 4 || recommendValue === 5;
  const showNegativeReasons = recommendValue === 1 || recommendValue === 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!site || !unit || !department) {
      setError("נא למלא את שדות המיון (אתר, יחידה, מחלקה)");
      return;
    }
    for (const section of RATING_SECTIONS) {
      for (const item of section.items) {
        if (!ratings[section.id]?.[item.id]) {
          setError(`נא למלא את כל השאלות בסעיף "${section.title}"`);
          return;
        }
      }
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("survey_responses").insert({
      locale: "he",
      site,
      unit,
      department,
      ratings,
      recommend_direction: showPositiveReasons ? "positive" : showNegativeReasons ? "negative" : null,
      recommend_reasons: recommendSelected,
      recommend_other_text: recommendOtherText || null,
      satisfaction_factors: satisfactionFactors,
      manager_traits: managerTraits,
      culture_traits: cultureTraits,
      fairness_followup: fairnessFollowup || null,
      closing_answers: closingAnswers,
    });
    setSubmitting(false);

    if (insertError) {
      setError("אירעה שגיאה בשליחת הסקר. נסה שוב.");
      return;
    }
    router.push("/thank-you");
  }

  return (
    <main dir="rtl" className="max-w-3xl mx-auto p-6 font-sans" lang="he">
      <Image src="/logo.png" alt="Isotopia" width={180} height={65} className="mb-6" />
      <h1 className="text-2xl font-bold mb-2 text-brand-primary">סקר עמדות ארגוני</h1>
      <p className="mb-1">עובד יקר,</p>
      <p className="mb-1">
        השאלון שלפניך הינו הזדמנות להשפיע ולהביע את עמדותיך, תפיסותיך ושביעות רצונך האישית ממכלול ההיבטים הנוגעים לעבודתך בחברה.
      </p>
      <p className="mb-1">בשאלון אין &quot;תשובות נכונות&quot; או &quot;תשובות לא נכונות&quot; – דעתך הכנה חשובה לנו.</p>
      <p className="mb-4 font-semibold">השאלון הוא אנונימי לחלוטין!</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-3 text-brand-primary">פרטי מיון</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-sm mb-1">אתר עבודה</label>
              <select required value={site} onChange={(e) => setSite(e.target.value)} className="w-full border rounded p-2">
                <option value="">בחר...</option>
                {IL_SITES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">יחידה ארגונית</label>
              <select required value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full border rounded p-2">
                <option value="">בחר...</option>
                {IL_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">מחלקה</label>
              <select required value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border rounded p-2">
                <option value="">בחר...</option>
                {IL_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {RATING_SECTIONS.map((section) => (
          <section key={section.id}>
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section.title}</h2>
            <RatingTable
              items={section.items}
              values={ratings[section.id] ?? {}}
              onChange={(itemId, value) => setRating(section.id, itemId, value)}
            />

            {section.id === "general_satisfaction" && showPositiveReasons && (
              <div className="mt-4 border border-brand-accent/40 rounded p-4 bg-brand-accent/5">
                <p className="mb-2 font-medium">מהן הסיבות בזכותן היית ממליץ? (בחר את כל הרלוונטי)</p>
                {RECOMMEND_REASONS_POSITIVE.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 py-1">
                    <input type="checkbox" className="accent-brand-primary" checked={recommendSelected.includes(r.id)} onChange={() => toggleRecommendReason(r.id)} />
                    {r.label}
                  </label>
                ))}
                <label className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    className="accent-brand-primary"
                    checked={recommendSelected.includes(RECOMMEND_REASON_OTHER_ID)}
                    onChange={() => toggleRecommendReason(RECOMMEND_REASON_OTHER_ID)}
                  />
                  אחר (פרט):
                </label>
                {recommendSelected.includes(RECOMMEND_REASON_OTHER_ID) && (
                  <input
                    type="text"
                    value={recommendOtherText}
                    onChange={(e) => setRecommendOtherText(e.target.value)}
                    className="w-full border rounded p-2 mt-1"
                  />
                )}
              </div>
            )}

            {section.id === "general_satisfaction" && showNegativeReasons && (
              <div className="mt-4 border border-brand-accent/40 rounded p-4 bg-brand-accent/5">
                <p className="mb-2 font-medium">מהן הסיבות לכך שלא היית ממליץ? (בחר את כל הרלוונטי)</p>
                {RECOMMEND_REASONS_NEGATIVE.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 py-1">
                    <input type="checkbox" className="accent-brand-primary" checked={recommendSelected.includes(r.id)} onChange={() => toggleRecommendReason(r.id)} />
                    {r.label}
                  </label>
                ))}
                <label className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    className="accent-brand-primary"
                    checked={recommendSelected.includes(RECOMMEND_REASON_OTHER_ID)}
                    onChange={() => toggleRecommendReason(RECOMMEND_REASON_OTHER_ID)}
                  />
                  אחר (פרט):
                </label>
                {recommendSelected.includes(RECOMMEND_REASON_OTHER_ID) && (
                  <input
                    type="text"
                    value={recommendOtherText}
                    onChange={(e) => setRecommendOtherText(e.target.value)}
                    className="w-full border rounded p-2 mt-1"
                  />
                )}
              </div>
            )}

            {section.id === "me_and_role" && (
              <div className="mt-4 border border-brand-accent/40 rounded p-4 bg-brand-accent/5">
                <p className="mb-2 font-medium">
                  ציין 2 נושאים מרכזיים, בזכותם אתה מרגיש סיפוק מתפקידך (עד {SATISFACTION_FACTORS_MAX}):
                </p>
                {SATISFACTION_FACTORS.map((f) => (
                  <label key={f.id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      className="accent-brand-primary"
                      checked={satisfactionFactors.includes(f.id)}
                      onChange={() => toggleSatisfactionFactor(f.id)}
                      disabled={!satisfactionFactors.includes(f.id) && satisfactionFactors.length >= SATISFACTION_FACTORS_MAX}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            )}

            {section.id === "me_as_employee" && (
              <div className="mt-4">
                <label className="block mb-1 font-medium">{FAIRNESS_FOLLOWUP_LABEL}</label>
                <textarea
                  value={fairnessFollowup}
                  onChange={(e) => setFairnessFollowup(e.target.value)}
                  className="w-full border rounded p-2"
                  rows={3}
                />
              </div>
            )}

            {section.id === "my_manager" && (
              <div className="mt-4">
                <p className="mb-2 font-medium">
                  לפנייך רשימת תכונות, אנא ציין עבור כל אחת מהן האם זו תכונה שהיא עוצמה של מנהלך הישיר או האם זו תכונה שנדרשת שיפור:
                </p>
                <CheckboxTable items={MANAGER_TRAITS} values={managerTraits} onChange={setManagerTrait} labelA="עוצמה של המנהל" labelB="הזדמנות לשיפור" />
              </div>
            )}
          </section>
        ))}

        <section>
          <h2 className="text-lg font-semibold mb-3 text-brand-primary">תרבות ארגונית בחברה</h2>
          <p className="mb-2 text-sm text-gray-600">
            ציין את המאפיינים אשר לדעתך משקפים את מצב הדברים הקיים בחברה, ואת המאפיינים שהיית רוצה שיתקיימו (מצב רצוי).
          </p>
          <CheckboxTable items={CULTURE_TRAITS} values={cultureTraits} onChange={setCultureTrait} labelA="מצב קיים" labelB="מצב רצוי" />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-brand-primary">הערות מילוליות</h2>
          {CLOSING_QUESTIONS.map((q) => (
            <div key={q.id} className="mb-4">
              <label className="block mb-1 font-medium">{q.label}</label>
              <textarea
                value={closingAnswers[q.id] ?? ""}
                onChange={(e) => setClosingAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                className="w-full border rounded p-2"
                rows={3}
              />
            </div>
          ))}
        </section>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-primary text-white rounded p-3 font-semibold hover:bg-brand-primary-dark disabled:opacity-50"
        >
          {submitting ? "שולח..." : "שליחת הסקר"}
        </button>
      </form>
    </main>
  );
}
