import type { Request, Response, NextFunction } from "express";
import { QUESTION_IDS } from "../lib/questions";

const PERSONAL_FIELDS = [
  "name",
  "email",
  "company",
  "date",
  "gender",
  "ageGroup",
  "yearsInOrganization",
  "yearsInPosition",
  "numberOfReports",
] as const;

const ALLOWED_GENDERS = new Set(["Male", "Female"]);
const ALLOWED_AGE_GROUPS = new Set([
  "20-25", "26-30", "31-35", "36-40", "41-45",
  "46-50", "51-55", "56-60", "61-65", "66-70",
]);
const ALLOWED_YEARS = new Set([
  "less than 1 year",
  "1-2 years",
  "3-5 years",
  "6-10 years",
  "11-15 years",
  "16-20 years",
  "21 years and more",
]);
const ALLOWED_REPORTS = new Set([
  "None", "1 to 3", "4 to 6", "7 to 10", "11 to 20", "21 and more",
]);

const ERR = { error: "All questions must be answered correctly" };

export function validateSurvey(req: Request, res: Response, next: NextFunction) {
  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json(ERR);
  }

  for (const f of PERSONAL_FIELDS) {
    const v = body[f];
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
      return res.status(400).json(ERR);
    }
  }

  if (!ALLOWED_GENDERS.has(String(body.gender))) return res.status(400).json(ERR);
  if (!ALLOWED_AGE_GROUPS.has(String(body.ageGroup))) return res.status(400).json(ERR);
  if (!ALLOWED_YEARS.has(String(body.yearsInOrganization))) return res.status(400).json(ERR);
  if (!ALLOWED_YEARS.has(String(body.yearsInPosition))) return res.status(400).json(ERR);
  if (!ALLOWED_REPORTS.has(String(body.numberOfReports))) return res.status(400).json(ERR);

  const dateVal = new Date(body.date);
  if (Number.isNaN(dateVal.getTime())) return res.status(400).json(ERR);

  const answers = body.answers;
  if (!answers || typeof answers !== "object") return res.status(400).json(ERR);

  const questionCount = Object.keys(QUESTION_IDS).length;
  const submittedCount =
    typeof body.totalQuestions === "number" && Number.isFinite(body.totalQuestions)
      ? body.totalQuestions
      : Object.keys(answers).length;
  if (submittedCount !== questionCount) {
    return res.status(400).json({
      error: "All questions must be answered correctly",
      expected: questionCount,
      received: submittedCount,
    });
  }

  const missing = QUESTION_IDS.filter((id) => {
    const v = answers[id];
    return typeof v !== "number" || !Number.isFinite(v) || v < 1 || v > 10;
  });

  if (missing.length > 0) {
    return res.status(400).json({
      error: "All questions must be answered correctly",
      missing,
    });
  }

  next();
}
