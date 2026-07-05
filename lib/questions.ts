// Question schema for the Isotopia satisfaction survey (Hebrew, Israel).
// Ids are stable keys used both for conditional logic and for the JSON stored in Supabase.
// English (USA) content will be added later using the same ids.

export type ScaleValue = 1 | 2 | 3 | 4 | 5 | "na";

export const SCALE_OPTIONS: { value: ScaleValue; label: string }[] = [
  { value: 1, label: "לא מסכים כלל" },
  { value: 2, label: "מסכים במידה מועטה" },
  { value: 3, label: "מסכים" },
  { value: 4, label: "מסכים במידה רבה" },
  { value: 5, label: "מסכים במידה רבה מאוד" },
  { value: "na", label: "לא רלוונטי" },
];

export interface RatingItem {
  id: string;
  label: string;
}

export interface RatingSection {
  id: string;
  title: string;
  items: RatingItem[];
}

export const RATING_SECTIONS: RatingSection[] = [
  {
    id: "general_satisfaction",
    title: "שביעות רצון כללית",
    items: [
      { id: "proud", label: "אני גאה לעבוד בחברה" },
      { id: "continue", label: "אני רואה את עצמי ממשיך לעבוד בחברה בשנים הקרובות" },
      { id: "recommend", label: "אמליץ לחברים ולקרובים לעבוד בחברה" },
    ],
  },
  {
    id: "me_and_role",
    title: "אני והתפקיד",
    items: [
      { id: "contribution", label: "לתפקיד שלי יש תרומה משמעותית להשגת המטרות והיעדים של יחידתי" },
      { id: "enjoy", label: "אני נהנה וחש סיפוק מתפקידי" },
    ],
  },
  {
    id: "me_as_employee",
    title: "אני כעובד",
    items: [
      { id: "voice", label: "יש לי הזדמנויות וערוצים שונים להביע את דעותיי ועמדותיי" },
      { id: "fair_pay", label: "התגמול (שכר ותנאים) שלי הוגן ביחס למקובל ביחס לתפקיד" },
      { id: "advancement_belief", label: "אני מאמין שיש לי אפשרויות להתקדם ולהתפתח לתפקידים שונים בחברה" },
      { id: "advancement_fairness", label: "האנשים שהתקדמו בחברה, ואני מכיר אותם היו ראויים לכך" },
      { id: "work_env", label: "סביבת העבודה שלי הנה ברמה נאותה (מקום ישיבה, חזות כללית, חדרי שירותים, מיזוג וכו')" },
      { id: "welfare", label: "אני חש כי החברה משקיעה ברווחת העובדים וכי פעילויות הרווחה משקפות אכפתיות ותשומת לב" },
      { id: "fairness", label: "בחברה נוהגים בכבוד ובהוגנות כלפי העובדים" },
    ],
  },
  {
    id: "company_external",
    title: "החברה כלפי חוץ",
    items: [
      { id: "brand", label: "החברה היא מותג מוביל בשוק" },
      { id: "resilience", label: "אני מאמין בחוסן החברה וביציבותה" },
      { id: "customer_centric", label: "התהליכים והשירותים של החברה נבנים מתוך תפיסת הלקוח במרכז" },
      { id: "community", label: "בחברה יש אחריות קהילה ותרומה מעשית לקהילה" },
    ],
  },
  {
    id: "leadership",
    title: "הנהלת החברה",
    items: [
      { id: "confidence", label: "יש לי אמון באופן שבו הנהלת החברה מתמודדת עם האתגרים שהשוק מציב בפניה" },
      { id: "connected", label: 'הנהלת החברה "מחוברת לשטח" (יודעת מה קורה, מודעת להלך הרוחות)' },
    ],
  },
  {
    id: "company_internal",
    title: "החברה כלפי פנים",
    items: [
      { id: "policy_growth", label: "המדיניות והתהלכים בחברה מקדמים את צמיחתה והצלחתה בתחום עיסוקיה" },
      { id: "cost_awareness", label: "בחברה פועלים מתוך מודעות למשאבים ועלויות" },
      { id: "project_coordination", label: "פרויקטים המערבים גופים רבים בחברה, מתאפיינים בתיאום מוצלח ומשקפים אחריות משותפת להצלחה" },
      { id: "focus_known", label: "המיקודים העסקיים של החברה ידועים ומתוקשרים היטב" },
      { id: "comms_reach", label: "עשייה ותהליכים מרכזיים בחברה מתוקשרים ומגיעים לכלל העובדים" },
    ],
  },
  {
    id: "my_team",
    title: "הצוות שלי",
    items: [
      { id: "cohesion", label: "אני מרגיש שיש גיבוש ואווירה טובה בצוות שלי" },
      { id: "cooperation", label: "אני זוכה לשיתוף פעולה שוטף ולעזרה משאר חברי הצוות" },
    ],
  },
  {
    id: "my_manager",
    title: "המנהל הישיר שלי",
    items: [
      { id: "leads", label: "מוביל את היחידה להישגים והצלחה" },
      { id: "manages", label: "מנהל את משימות היחידה ביעילות ואפקטיביות" },
      { id: "motivates", label: "מעורר בעובדיו מוטיבציה ומניע אותם למיצוי יכולתם" },
      { id: "interfaces", label: "פועל באופן שיטתי להסדרת ממשקי עבודה עם אחרים" },
    ],
  },
];

// Branching question: RATING_SECTIONS[0] item "recommend".
// value 3/4/5 -> RECOMMEND_REASONS_POSITIVE, value 1/2 -> RECOMMEND_REASONS_NEGATIVE.
export const RECOMMEND_REASONS_POSITIVE: RatingItem[] = [
  { id: "success_belief", label: "מאמין בהצלחת החברה, בחוסן ובמוניטין שלה" },
  { id: "interest_success", label: "תחושת עניין, הנאה והצלחה בעיסוק הנוכחי שלי" },
  { id: "development_opportunity", label: "יש לי הזדמנות לפיתוח אישי, מקצועי וניהולי" },
  { id: "manager_relationship", label: "הקשר שלי עם הממונה הישיר" },
  { id: "team_relations", label: "היחסים עם הצוות שלי והגיבוש החברתי" },
  { id: "compensation_fairness", label: "הוגנות התגמול שלי – השכר ותנאי נלווים" },
  { id: "job_security", label: "תחושת הביטחון והיציבות התעסוקתיים" },
  { id: "flexibility_balance", label: "הגמישות והאיזון בין חיים פרטיים ועבודה" },
  { id: "care_feeling", label: "תחושת אכפתיות והתעניינות בי כאדם" },
  { id: "welfare_activities", label: "פעילות הרווחה בחברה" },
];
// REMOVED 2026-07-05 per Maya: "job_market" (מצב שוק העבודה היום) and "burnout" (שחיקה בתפקיד)
// dropped from both lists; "commute" (נוחות ההגעה והקירבה למקום המגורים) dropped from both
// lists too (she decided it's not relevant enough, including in the positive branch).

// Final wording from Maya (2026-07-05), incl. her follow-up adding a negative version of job_security.
export const RECOMMEND_REASONS_NEGATIVE: RatingItem[] = [
  { id: "success_belief", label: "לא מאמין בהצלחת החברה, בחוסן ובמוניטין שלה" },
  { id: "development_opportunity", label: "אין לי הזדמנויות לפיתוח אישי, מקצועי וניהולי" },
  { id: "team_relations", label: "היחסים שלי עם הצוות שלי והגיבוש החברתי" },
  { id: "welfare_activities", label: "היעדר פעילויות רווחה בחברה" },
  { id: "interest_success", label: "חוסר תחושת עניין, הנאה והצלחה בעיסוק הנוכחי שלי" },
  { id: "manager_relationship", label: "הקשר שלי עם הממונה הישיר" },
  { id: "compensation_fairness", label: "חוסר הוגנות בתגמול שלי (שכר ותנאים נלווים)" },
  { id: "flexibility_balance", label: "היעדר גמישות ואיזון בין החיים הפרטיים והעבודה" },
  { id: "care_feeling", label: "חוסר תחושת אכפתיות והתעניינות בי כאדם" },
  { id: "job_security", label: "היעדר תחושת ביטחון ויציבות תעסוקתית" },
];

export const RECOMMEND_REASON_OTHER_ID = "other";

// "Choose up to 2" question, id: satisfaction_factors
export const SATISFACTION_FACTORS: RatingItem[] = [
  { id: "express_skills", label: "אני מצליח להביא לידי ביטוי בתפקידי את כישוריי ויכולותיי" },
  { id: "guidance_training", label: "אני מקבל הדרכה, הכשרה וחניכה למילוי והצלחה בתפקיד" },
  { id: "efficient_workflows", label: "תהליכי העבודה מאפשרים לי עבודה יעילה ואפקטיבית" },
  { id: "interesting_role", label: "התפקיד שלי מעניין ומאתגר" },
  { id: "authority_influence", label: "יש לי הסמכות, העצמאות והידע להשפיע על נושאים הקשורים לעבודתי" },
  { id: "clear_priorities", label: "משימות, יעדים וסדרי עדיפויות ברורים ומוגדרים" },
];
export const SATISFACTION_FACTORS_MAX = 2;

// Manager attributes: each rated as strength and/or improvement opportunity (independent checkboxes)
export const MANAGER_TRAITS: RatingItem[] = [
  { id: "personal_interest", label: "מתעניין בי כאדם ומהווה כתובת להסדרת נושאים אישיים" },
  { id: "clarifies_expectations", label: "מבהיר לי את צפיותיו, מגדיר לי יעדים ומדדים" },
  { id: "keeps_updated", label: "מעדכן אותי באופן שוטף לגבי החלטות ו/או שינויים בחברה הנוגעים לעבודתי" },
  { id: "professional_development", label: "פועל להתפתחותי המקצועית ודואג לצרכי כעובד בחברה" },
  { id: "open_to_initiative", label: 'פתוח ליוזמות ולרעיונות חדשים, מעודד "ראש גדול", הובלת נושאים ולקיחת אחריות' },
  { id: "role_model", label: "מהווה דוגמא אישית עבורי" },
  { id: "openness_to_mistakes", label: "מפגין פתיחות ורואה בטעויות הזדמנויות לשיפור ולמידה" },
  { id: "challenging_mentorship", label: "חונך אותי באופן שמאתגר אותי ומאפשר לי לשפר את ביצועיי ויכולותיי" },
  { id: "management_routines", label: "מקפיד על שגרות ניהוליות (ישיבות צוות, פגישות עבודה, פגישות אישיות, משוב)" },
  { id: "appreciation", label: "מעריך ומוקיר הצלחות והישגים בעבודתי" },
];

// Organizational culture traits: each rated as current-state and/or desired-state (independent checkboxes)
export const CULTURE_TRAITS: RatingItem[] = [
  { id: "innovation", label: "חדשנות" },
  { id: "initiative", label: "יוזמה" },
  { id: "excellence", label: "מצוינות" },
  { id: "pace", label: "מהירות (קצב)" },
  { id: "results_readiness", label: "מוכנות לתוצאות" },
  { id: "accountability", label: "לקיחת אחריות (accountability)" },
  { id: "risk_taking", label: "נטילת סיכונים" },
  { id: "continuous_improvement", label: "שיפור מתמיד" },
  { id: "detailed_planning", label: "תכנון מפורט" },
  { id: "flexibility", label: "גמישות" },
  { id: "seizing_opportunities", label: "ניצול הזדמנויות" },
  { id: "goal_adherence", label: "דבקות במטרה" },
  { id: "professionalism", label: "מקצוענות" },
  { id: "integrity", label: "יושרה (אינטגריטי)" },
  { id: "investment_in_employees", label: "השקעה בעובדים" },
];

export const CLOSING_QUESTIONS = [
  { id: "what_you_love", label: "אנא ציין דבר-שניים שבזכותם אתה נהנה / אוהב לעבוד בחברה:" },
  { id: "what_to_change", label: "אילו יכולת לשנות נושא אחד או שניים בחברה – מה היית משנה?" },
];

export const FAIRNESS_FOLLOWUP_LABEL = "אנא פרט סיבות לתשובתך ביחס לשאלת ההוגנות כלפי העובדים:";

// Demographics (Israel) — confirmed with Maya 2026-07-05.
export const IL_SITES = ["מודיעין", "פתח תקווה"];
export const IL_UNITS = ["בית מרקחת", "תרפיה", "מפעל אספטי"];
export const IL_DEPARTMENTS = [
  "ייצור",
  "QC",
  "QA",
  "לוגיסטיקה, רכש ומחסן",
  "שרשרת אספקה",
  "הנדסה, מו\"פ",
  "מכירות, שיווק ושירות לקוחות",
  "כספים, הנהלה ומשאבי אנוש",
];
