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
  RatingSection,
} from "@/lib/questions";

function section(id: string): RatingSection {
  return RATING_SECTIONS.find((s) => s.id === id)!;
}

// Grouped so short sections (2-3 items) share a step with a neighbor, per Maya's request,
// while larger sections (me_as_employee, my_manager+traits, culture) stay on their own.
const STEPS = [
  { id: "demographics", title: "פרטי מיון" },
  { id: "general_satisfaction", title: "שביעות רצון כללית" },
  { id: "recommend_reasons", title: "המלצה לעבודה בחברה" },
  { id: "me_and_role", title: "אני והתפקיד" },
  { id: "me_as_employee", title: "אני כעובד" },
  { id: "company_external_leadership", title: "החברה כלפי חוץ והנהלת החברה" },
  { id: "company_internal_team", title: "החברה כלפי פנים והצוות שלי" },
  { id: "my_manager", title: "המנהל הישיר שלי" },
  { id: "culture", title: "תרבות ארגונית בחברה" },
  { id: "closing", title: "הערות מילוליות" },
] as const;

export default function HebrewSurveyPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState("");

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
  const [submitError, setSubmitError] = useState("");

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

  function ratingSectionsMissing(sectionIds: string[]): string | null {
    for (const sectionId of sectionIds) {
      const sec = section(sectionId);
      for (const item of sec.items) {
        if (!ratings[sectionId]?.[item.id]) {
          return `נא למלא את כל השאלות בסעיף "${sec.title}"`;
        }
      }
    }
    return null;
  }

  function validateCurrentStep(): string | null {
    const stepId = STEPS[currentStep].id;
    switch (stepId) {
      case "demographics":
        if (!site || !unit || !department) return "נא למלא את שדות המיון (אתר, יחידה, מחלקה)";
        return null;
      case "general_satisfaction":
        return ratingSectionsMissing(["general_satisfaction"]);
      case "me_and_role":
        return ratingSectionsMissing(["me_and_role"]);
      case "me_as_employee":
        return ratingSectionsMissing(["me_as_employee"]);
      case "company_external_leadership":
        return ratingSectionsMissing(["company_external", "leadership"]);
      case "company_internal_team":
        return ratingSectionsMissing(["company_internal", "my_team"]);
      case "my_manager":
        return ratingSectionsMissing(["my_manager"]);
      default:
        return null;
    }
  }

  function goNext() {
    const err = validateCurrentStep();
    if (err) {
      setStepError(err);
      return;
    }
    setStepError("");
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  }

  function goBack() {
    setStepError("");
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo(0, 0);
  }

  async function handleSubmit() {
    const err = validateCurrentStep();
    if (err) {
      setStepError(err);
      return;
    }
    setSubmitError("");
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
      setSubmitError("אירעה שגיאה בשליחת הסקר. נסה שוב.");
      return;
    }
    router.push("/thank-you");
  }

  const stepId = STEPS[currentStep].id;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <main dir="rtl" className="max-w-3xl mx-auto p-6 font-sans" lang="he">
      <Image src="/logo.png" alt="Isotopia" width={180} height={65} className="mb-6" />

      {isFirstStep && (
        <>
          <h1 className="text-2xl font-bold mb-2 text-brand-primary">סקר עמדות ארגוני</h1>
          <p className="mb-1">עובד יקר,</p>
          <p className="mb-1">
            השאלון שלפניך הינו הזדמנות להשפיע ולהביע את עמדותיך, תפיסותיך ושביעות רצונך האישית ממכלול ההיבטים הנוגעים לעבודתך בחברה.
          </p>
          <p className="mb-1">בשאלון אין &quot;תשובות נכונות&quot; או &quot;תשובות לא נכונות&quot; – דעתך הכנה חשובה לנו.</p>
          <p className="mb-4 font-semibold">השאלון הוא אנונימי לחלוטין!</p>
        </>
      )}

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{STEPS[currentStep].title}</span>
          <span>
            שלב {currentStep + 1} מתוך {STEPS.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {stepId === "demographics" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">פרטי מיון</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-sm mb-1">אתר עבודה</label>
                <select value={site} onChange={(e) => setSite(e.target.value)} className="w-full border rounded p-2">
                  <option value="">בחר...</option>
                  {IL_SITES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">יחידה ארגונית</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full border rounded p-2">
                  <option value="">בחר...</option>
                  {IL_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">מחלקה</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border rounded p-2">
                  <option value="">בחר...</option>
                  {IL_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {stepId === "general_satisfaction" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("general_satisfaction").title}</h2>
            <RatingTable
              items={section("general_satisfaction").items}
              values={ratings.general_satisfaction ?? {}}
              onChange={(itemId, value) => setRating("general_satisfaction", itemId, value)}
            />
          </section>
        )}

        {stepId === "recommend_reasons" && (
          <section>
            {showPositiveReasons && (
              <div className="border border-brand-accent/40 rounded p-4 bg-brand-accent/5">
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

            {showNegativeReasons && (
              <div className="border border-brand-accent/40 rounded p-4 bg-brand-accent/5">
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

            {!showPositiveReasons && !showNegativeReasons && (
              <p className="text-gray-600">אין שאלת המשך עבורך בסעיף זה — אפשר להמשיך.</p>
            )}
          </section>
        )}

        {stepId === "me_and_role" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("me_and_role").title}</h2>
            <RatingTable
              items={section("me_and_role").items}
              values={ratings.me_and_role ?? {}}
              onChange={(itemId, value) => setRating("me_and_role", itemId, value)}
            />
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
          </section>
        )}

        {stepId === "me_as_employee" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("me_as_employee").title}</h2>
            <RatingTable
              items={section("me_as_employee").items}
              values={ratings.me_as_employee ?? {}}
              onChange={(itemId, value) => setRating("me_as_employee", itemId, value)}
            />
            <div className="mt-4">
              <label className="block mb-1 font-medium">{FAIRNESS_FOLLOWUP_LABEL}</label>
              <textarea
                value={fairnessFollowup}
                onChange={(e) => setFairnessFollowup(e.target.value)}
                className="w-full border rounded p-2"
                rows={3}
              />
            </div>
          </section>
        )}

        {stepId === "company_external_leadership" && (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("company_external").title}</h2>
              <RatingTable
                items={section("company_external").items}
                values={ratings.company_external ?? {}}
                onChange={(itemId, value) => setRating("company_external", itemId, value)}
              />
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("leadership").title}</h2>
              <RatingTable
                items={section("leadership").items}
                values={ratings.leadership ?? {}}
                onChange={(itemId, value) => setRating("leadership", itemId, value)}
              />
            </section>
          </>
        )}

        {stepId === "company_internal_team" && (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("company_internal").title}</h2>
              <RatingTable
                items={section("company_internal").items}
                values={ratings.company_internal ?? {}}
                onChange={(itemId, value) => setRating("company_internal", itemId, value)}
              />
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("my_team").title}</h2>
              <RatingTable
                items={section("my_team").items}
                values={ratings.my_team ?? {}}
                onChange={(itemId, value) => setRating("my_team", itemId, value)}
              />
            </section>
          </>
        )}

        {stepId === "my_manager" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("my_manager").title}</h2>
            <RatingTable
              items={section("my_manager").items}
              values={ratings.my_manager ?? {}}
              onChange={(itemId, value) => setRating("my_manager", itemId, value)}
            />
            <div className="mt-4">
              <p className="mb-2 font-medium">
                לפנייך רשימת תכונות, אנא ציין עבור כל אחת מהן האם זו תכונה שהיא עוצמה של מנהלך הישיר או האם זו תכונה שנדרשת שיפור:
              </p>
              <CheckboxTable items={MANAGER_TRAITS} values={managerTraits} onChange={setManagerTrait} labelA="עוצמה של המנהל" labelB="הזדמנות לשיפור" />
            </div>
          </section>
        )}

        {stepId === "culture" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">תרבות ארגונית בחברה</h2>
            <p className="mb-2 text-sm text-gray-600">
              ציין את המאפיינים אשר לדעתך משקפים את מצב הדברים הקיים בחברה, ואת המאפיינים שהיית רוצה שיתקיימו (מצב רצוי).
            </p>
            <CheckboxTable items={CULTURE_TRAITS} values={cultureTraits} onChange={setCultureTrait} labelA="מצב קיים" labelB="מצב רצוי" />
          </section>
        )}

        {stepId === "closing" && (
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
        )}

        {stepError && <p className="text-red-600">{stepError}</p>}
        {submitError && <p className="text-red-600">{submitError}</p>}

        <div className="flex gap-3 pt-4">
          {!isFirstStep && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 border border-brand-primary text-brand-primary rounded p-3 font-semibold hover:bg-brand-accent/5"
            >
              הקודם
            </button>
          )}
          {!isLastStep && (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 bg-brand-primary text-white rounded p-3 font-semibold hover:bg-brand-primary-dark"
            >
              הבא
            </button>
          )}
          {isLastStep && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-brand-primary text-white rounded p-3 font-semibold hover:bg-brand-primary-dark disabled:opacity-50"
            >
              {submitting ? "שולח..." : "שליחת הסקר"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
