// Question schema for the Isotopia satisfaction survey (English, USA).
// Mirrors lib/questions.ts structure and ids exactly (same RatingItem/RatingSection
// shapes, same ids per question) so the same wizard logic/components work for both
// locales and results stay comparable across languages.
import type { RatingItem, RatingSection, ScaleValue } from "./questions";

export const SCALE_OPTIONS_EN: { value: ScaleValue; label: string }[] = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree Somewhat" },
  { value: 3, label: "Agree" },
  { value: 4, label: "Strongly Agree" },
  { value: 5, label: "Completely Agree" },
  { value: "na", label: "N/A" },
];

export const RATING_SECTIONS_EN: RatingSection[] = [
  {
    id: "general_satisfaction",
    title: "General Satisfaction",
    items: [
      { id: "proud", label: "I am proud to work at the company." },
      { id: "continue", label: "I see myself continuing to work at the company in the coming years." },
      { id: "recommend", label: "I would recommend friends and relatives to work at the company." },
    ],
  },
  {
    id: "me_and_role",
    title: "Me and the Role",
    items: [
      { id: "contribution", label: "My role makes a significant contribution to achieving the goals and objectives of my unit." },
      { id: "enjoy", label: "I enjoy and feel a sense of satisfaction from my role." },
    ],
  },
  {
    id: "me_as_employee",
    title: "I as an Employee",
    items: [
      { id: "voice", label: "I have various channels and opportunities to express my opinions and viewpoints." },
      { id: "fair_pay", label: "My compensation (salary and benefits) is fair relative to standard market rates for my role." },
      { id: "advancement_belief", label: "I believe I have opportunities to advance and develop into different roles within the company." },
      { id: "advancement_fairness", label: "People who have advanced in the company, whom I know, deserved it." },
      { id: "work_env", label: "My work environment is at an appropriate standard (seating, general appearance, restrooms, air conditioning, etc.)." },
      { id: "welfare", label: "I feel that the company invests in employee welfare, and that welfare activities reflect care and attention." },
      { id: "fairness", label: "The company treats its employees with respect and fairness." },
    ],
  },
  {
    id: "company_external",
    title: "The Company Externally",
    items: [
      { id: "brand", label: "The company is a leading brand in the market." },
      { id: "resilience", label: "I believe in the company's resilience and stability." },
      { id: "customer_centric", label: "The company's processes and services are built around a customer-centric approach." },
      { id: "community", label: "The company demonstrates community responsibility and makes a practical contribution to society." },
    ],
  },
  {
    id: "leadership",
    title: "Company Leadership",
    items: [
      { id: "confidence", label: "I have confidence in the way the company leadership handles market challenges." },
      { id: "connected", label: "The company leadership is ‘connected to the field’ (knows what is happening, aware of the general sentiment)." },
    ],
  },
  {
    id: "company_internal",
    title: "The Company Internally",
    items: [
      { id: "policy_growth", label: "The company's policies and processes promote its growth and success in its fields of business." },
      { id: "cost_awareness", label: "The company operates with awareness of resources and costs." },
      { id: "project_coordination", label: "Projects involving multiple entities in the company are characterized by successful coordination and reflect shared responsibility for success." },
      { id: "focus_known", label: "The company's business focuses are well known and clearly communicated." },
      { id: "comms_reach", label: "Key actions and processes in the company are communicated effectively and reach all employees." },
    ],
  },
  {
    id: "my_team",
    title: "My Team",
    items: [
      { id: "cohesion", label: "I feel there is cohesion and a good atmosphere in my team." },
      { id: "cooperation", label: "I receive ongoing cooperation and help from other team members." },
    ],
  },
  {
    id: "my_manager",
    title: "My Direct Supervisor",
    items: [
      { id: "leads", label: "Leads the unit to achievements and success." },
      { id: "manages", label: "Manages unit tasks efficiently and effectively." },
      { id: "motivates", label: "Inspires motivation in employees and drives them to maximize their potential." },
      { id: "interfaces", label: "Operates systematically to organize and regulate working interfaces with others." },
    ],
  },
];

// Branching question: RATING_SECTIONS_EN[0] item "recommend".
// value 3/4/5 -> RECOMMEND_REASONS_POSITIVE_EN, value 1/2 -> RECOMMEND_REASONS_NEGATIVE_EN.
// Same trimmed set as the Hebrew version (job_market / burnout / commute removed per Maya).
export const RECOMMEND_REASONS_POSITIVE_EN: RatingItem[] = [
  { id: "success_belief", label: "Belief in the company's success, stability, and reputation" },
  { id: "interest_success", label: "Sense of interest, enjoyment, and success in my current role" },
  { id: "development_opportunity", label: "Opportunity for personal, professional, and managerial development" },
  { id: "manager_relationship", label: "Relationship with my direct supervisor" },
  { id: "team_relations", label: "Relations with my team and social cohesion" },
  { id: "compensation_fairness", label: "Fairness of compensation – salary and ancillary benefits" },
  { id: "job_security", label: "Sense of job security and employment stability" },
  { id: "flexibility_balance", label: "Flexibility and work-life balance" },
  { id: "care_feeling", label: "Sense of care and interest in me as an individual" },
  { id: "welfare_activities", label: "Company welfare/wellbeing activities" },
];

export const RECOMMEND_REASONS_NEGATIVE_EN: RatingItem[] = [
  { id: "success_belief", label: "I don't believe in the company's success, stability, or reputation" },
  { id: "development_opportunity", label: "I don't have opportunities for personal, professional, or managerial development" },
  { id: "team_relations", label: "Relations with my team and social cohesion" },
  { id: "welfare_activities", label: "Lack of welfare/wellbeing activities at the company" },
  { id: "interest_success", label: "Lack of interest, enjoyment, or success in my current role" },
  { id: "manager_relationship", label: "Relationship with my direct supervisor" },
  { id: "compensation_fairness", label: "Unfairness in my compensation (salary and benefits)" },
  { id: "flexibility_balance", label: "Lack of flexibility and work-life balance" },
  { id: "care_feeling", label: "Lack of care and interest in me as an individual" },
  { id: "job_security", label: "Lack of job security and employment stability" },
];

export const RECOMMEND_REASON_OTHER_ID_EN = "other";

// "Choose up to 2" question, id: satisfaction_factors
export const SATISFACTION_FACTORS_EN: RatingItem[] = [
  { id: "express_skills", label: "I successfully express my skills and capabilities in my role." },
  { id: "guidance_training", label: "I receive guidance, training, and mentoring to succeed in my role." },
  { id: "efficient_workflows", label: "Work workflows enable me to work efficiently and effectively." },
  { id: "interesting_role", label: "My role is interesting and challenging." },
  { id: "authority_influence", label: "I have the authority, independence, and knowledge to influence matters related to my work." },
  { id: "clear_priorities", label: "Tasks, goals, and priorities are clear and well-defined." },
];
export const SATISFACTION_FACTORS_MAX_EN = 2;

export const MANAGER_TRAITS_EN: RatingItem[] = [
  { id: "personal_interest", label: "Takes an interest in me as a person and serves as a go-to contact for resolving personal matters." },
  { id: "clarifies_expectations", label: "Clarifies expectations, defines goals, and establishes metrics for me." },
  { id: "keeps_updated", label: "Updates me on an ongoing basis regarding decisions and/or changes in the company that affect my work." },
  { id: "professional_development", label: "Acts to support my professional development and looks after my needs as an employee in the company." },
  { id: "open_to_initiative", label: "Open to initiatives and new ideas, encourages proactive thinking, leading topics, and taking responsibility." },
  { id: "role_model", label: "Sets a personal example for me." },
  { id: "openness_to_mistakes", label: "Demonstrates openness and views mistakes as opportunities for improvement and learning." },
  { id: "challenging_mentorship", label: "Mentors me in a way that challenges me and allows me to improve my performance and capabilities." },
  { id: "management_routines", label: "Strictly maintains management routines (team meetings, work alignment meetings, 1-on-1 sessions, feedback)." },
  { id: "appreciation", label: "Appreciates and recognizes successes and achievements in my work." },
];

export const CULTURE_TRAITS_EN: RatingItem[] = [
  { id: "innovation", label: "Innovation" },
  { id: "initiative", label: "Initiative / Proactivity" },
  { id: "excellence", label: "Excellence" },
  { id: "pace", label: "Speed / Pace" },
  { id: "results_readiness", label: "Readiness for Results" },
  { id: "accountability", label: "Accountability / Taking Responsibility" },
  { id: "risk_taking", label: "Risk-taking" },
  { id: "continuous_improvement", label: "Continuous Improvement" },
  { id: "detailed_planning", label: "Detailed Planning" },
  { id: "flexibility", label: "Flexibility" },
  { id: "seizing_opportunities", label: "Capitalizing on Opportunities" },
  { id: "goal_adherence", label: "Adherence to the Goal / Perseverance" },
  { id: "professionalism", label: "Professionalism" },
  { id: "integrity", label: "Integrity" },
  { id: "investment_in_employees", label: "Investment in Employees" },
];

export const CLOSING_QUESTIONS_EN = [
  { id: "what_you_love", label: "Please note one or two things that make you enjoy / love working at the company:" },
  { id: "what_to_change", label: "If you could change one or two areas in the company – what would you change?" },
];

export const FAIRNESS_FOLLOWUP_LABEL_EN = "Please elaborate on the reasons for your answer regarding fairness towards employees:";

// Demographics (USA) — confirmed with Maya 2026-07-19: single site, no "unit" level,
// 4 departments (the last one merges several small functions per her min-group-size rule).
export const US_SITE = "USA";
export const US_DEPARTMENTS = [
  "QA",
  "QC",
  "Ops",
  "Materials & Logistics, Finance, Sales & HR",
];
