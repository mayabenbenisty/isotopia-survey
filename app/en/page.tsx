"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RatingTable from "@/components/RatingTable";
import CheckboxTable, { CheckboxPair } from "@/components/CheckboxTable";
import { supabase } from "@/lib/supabaseClient";
import { ScaleValue, RatingSection } from "@/lib/questions";
import {
  RATING_SECTIONS_EN,
  RECOMMEND_REASONS_POSITIVE_EN,
  RECOMMEND_REASONS_NEGATIVE_EN,
  RECOMMEND_REASON_OTHER_ID_EN,
  SATISFACTION_FACTORS_EN,
  SATISFACTION_FACTORS_MAX_EN,
  MANAGER_TRAITS_EN,
  CULTURE_TRAITS_EN,
  CLOSING_QUESTIONS_EN,
  FAIRNESS_FOLLOWUP_LABEL_EN,
  SCALE_OPTIONS_EN,
  US_SITE,
  US_DEPARTMENTS,
} from "@/lib/questions.en";

function section(id: string): RatingSection {
  return RATING_SECTIONS_EN.find((s) => s.id === id)!;
}

// Mirrors app/he/page.tsx step grouping exactly (same ids), just English content
// and simpler demographics (US = one site, no "unit" level, department only).
const STEPS = [
  { id: "demographics", title: "Demographic Information" },
  { id: "general_satisfaction", title: "General Satisfaction" },
  { id: "recommend_reasons", title: "Recommending the Company" },
  { id: "me_and_role", title: "Me and the Role" },
  { id: "me_as_employee", title: "I as an Employee" },
  { id: "company_external_leadership", title: "The Company Externally & Leadership" },
  { id: "company_internal_team", title: "The Company Internally & My Team" },
  { id: "my_manager", title: "My Direct Supervisor" },
  { id: "culture", title: "Organizational Culture" },
  { id: "closing", title: "Open-Ended Comments" },
] as const;

export default function EnglishSurveyPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState("");

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
      if (prev.length >= SATISFACTION_FACTORS_MAX_EN) return prev;
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
          return `Please answer all questions in the "${sec.title}" section`;
        }
      }
    }
    return null;
  }

  function validateCurrentStep(): string | null {
    const stepId = STEPS[currentStep].id;
    switch (stepId) {
      case "demographics":
        if (!department) return "Please select your department";
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
      locale: "en",
      site: US_SITE,
      unit: null,
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
      setSubmitError("An error occurred submitting the survey. Please try again.");
      return;
    }
    router.push("/thank-you");
  }

  const stepId = STEPS[currentStep].id;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <main dir="ltr" className="max-w-3xl mx-auto p-6 font-sans" lang="en">
      <Image src="/logo.png" alt="Isotopia" width={180} height={65} className="mb-6" />

      {isFirstStep && (
        <>
          <h1 className="text-2xl font-bold mb-2 text-brand-primary">Organizational Climate Survey</h1>
          <p className="mb-1">Dear Employee,</p>
          <p className="mb-1">
            The questionnaire before you is an opportunity to influence and express your views, perceptions, and personal satisfaction regarding all aspects of your work in the company.
          </p>
          <p className="mb-1">There are no &quot;right&quot; or &quot;wrong&quot; answers in this questionnaire – your honest opinion is crucial.</p>
          <p className="mb-4 font-semibold">The questionnaire is completely anonymous!</p>
        </>
      )}

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{STEPS[currentStep].title}</span>
          <span>
            Step {currentStep + 1} of {STEPS.length}
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
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">Demographic Information</h2>
            <div className="grid gap-3 sm:grid-cols-2 max-w-sm">
              <div>
                <label className="block text-sm mb-1">Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border rounded p-2">
                  <option value="">Select...</option>
                  {US_DEPARTMENTS.map((d) => (
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
              scaleOptions={SCALE_OPTIONS_EN}
              ltr
            />
          </section>
        )}

        {stepId === "recommend_reasons" && (
          <section>
            {showPositiveReasons && (
              <div className="border border-brand-accent/40 rounded p-4 bg-brand-accent/5">
                <p className="mb-2 font-medium">What are the reasons you would recommend it? (select all that apply)</p>
                {RECOMMEND_REASONS_POSITIVE_EN.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 py-1">
                    <input type="checkbox" className="accent-brand-primary" checked={recommendSelected.includes(r.id)} onChange={() => toggleRecommendReason(r.id)} />
                    {r.label}
                  </label>
                ))}
                <label className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    className="accent-brand-primary"
                    checked={recommendSelected.includes(RECOMMEND_REASON_OTHER_ID_EN)}
                    onChange={() => toggleRecommendReason(RECOMMEND_REASON_OTHER_ID_EN)}
                  />
                  Other (please specify):
                </label>
                {recommendSelected.includes(RECOMMEND_REASON_OTHER_ID_EN) && (
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
                <p className="mb-2 font-medium">What are the reasons you would not recommend it? (select all that apply)</p>
                {RECOMMEND_REASONS_NEGATIVE_EN.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 py-1">
                    <input type="checkbox" className="accent-brand-primary" checked={recommendSelected.includes(r.id)} onChange={() => toggleRecommendReason(r.id)} />
                    {r.label}
                  </label>
                ))}
                <label className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    className="accent-brand-primary"
                    checked={recommendSelected.includes(RECOMMEND_REASON_OTHER_ID_EN)}
                    onChange={() => toggleRecommendReason(RECOMMEND_REASON_OTHER_ID_EN)}
                  />
                  Other (please specify):
                </label>
                {recommendSelected.includes(RECOMMEND_REASON_OTHER_ID_EN) && (
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
              <p className="text-gray-600">There is no follow-up question for you in this section — you can continue.</p>
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
              scaleOptions={SCALE_OPTIONS_EN}
              ltr
            />
            <div className="mt-4 border border-brand-accent/40 rounded p-4 bg-brand-accent/5">
              <p className="mb-2 font-medium">
                Please select up to {SATISFACTION_FACTORS_MAX_EN} key factors that contribute to your job satisfaction:
              </p>
              {SATISFACTION_FACTORS_EN.map((f) => (
                <label key={f.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    className="accent-brand-primary"
                    checked={satisfactionFactors.includes(f.id)}
                    onChange={() => toggleSatisfactionFactor(f.id)}
                    disabled={!satisfactionFactors.includes(f.id) && satisfactionFactors.length >= SATISFACTION_FACTORS_MAX_EN}
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
              scaleOptions={SCALE_OPTIONS_EN}
              ltr
            />
            <div className="mt-4">
              <label className="block mb-1 font-medium">{FAIRNESS_FOLLOWUP_LABEL_EN}</label>
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
                scaleOptions={SCALE_OPTIONS_EN}
                ltr
              />
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("leadership").title}</h2>
              <RatingTable
                items={section("leadership").items}
                values={ratings.leadership ?? {}}
                onChange={(itemId, value) => setRating("leadership", itemId, value)}
                scaleOptions={SCALE_OPTIONS_EN}
                ltr
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
                scaleOptions={SCALE_OPTIONS_EN}
                ltr
              />
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-3 text-brand-primary">{section("my_team").title}</h2>
              <RatingTable
                items={section("my_team").items}
                values={ratings.my_team ?? {}}
                onChange={(itemId, value) => setRating("my_team", itemId, value)}
                scaleOptions={SCALE_OPTIONS_EN}
                ltr
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
              scaleOptions={SCALE_OPTIONS_EN}
              ltr
            />
            <div className="mt-4">
              <p className="mb-2 font-medium">
                Below is a list of attributes. For each one, please indicate whether it is a strength of your direct supervisor or an area that requires improvement:
              </p>
              <CheckboxTable items={MANAGER_TRAITS_EN} values={managerTraits} onChange={setManagerTrait} labelA="Manager's Strength" labelB="Opportunity for Improvement" ltr />
            </div>
          </section>
        )}

        {stepId === "culture" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">Organizational Culture</h2>
            <p className="mb-2 text-sm text-gray-600">
              Please indicate the characteristics that, in your opinion, best reflect how the company currently operates (current state), and the characteristics you would like to see in place (desired state).
            </p>
            <CheckboxTable items={CULTURE_TRAITS_EN} values={cultureTraits} onChange={setCultureTrait} labelA="Current State" labelB="Desired State" ltr />
          </section>
        )}

        {stepId === "closing" && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-brand-primary">Open-Ended Comments</h2>
            {CLOSING_QUESTIONS_EN.map((q) => (
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
              Back
            </button>
          )}
          {!isLastStep && (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 bg-brand-primary text-white rounded p-3 font-semibold hover:bg-brand-primary-dark"
            >
              Next
            </button>
          )}
          {isLastStep && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-brand-primary text-white rounded p-3 font-semibold hover:bg-brand-primary-dark disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit survey"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
