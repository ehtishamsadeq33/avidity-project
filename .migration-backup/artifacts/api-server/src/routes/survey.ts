import { Router, type IRouter } from "express";
import { QUESTIONS } from "../lib/questions";
import { connectMongo } from "../lib/mongo";
import { ResponseModel } from "../models/Response";
import { CraResponseModel } from "../models/CraResponse";
import { GroupModel } from "../models/Group";
import { validateSurvey } from "../middlewares/validateSurvey";
import { computePerceivedActual, computeComposites } from "../lib/cra";

const router: IRouter = Router();

router.get("/survey/questions", (_req, res) => {
  res.json({ questions: QUESTIONS });
});

router.post("/survey/verify-group-code", async (req, res): Promise<void> => {
  try {
    await connectMongo();
    const { groupCode } = req.body ?? {};
    if (!groupCode) {
      res.status(400).json({ error: "Group code is required" });
      return;
    }
    const code = String(groupCode).trim().toUpperCase();

    // Search new phase-based groups
    const group = await GroupModel.findOne({ "phases.code": code });
    if (group) {
      const phase = (group.phases as any[]).find((p: any) => p.code === code);
      if (!phase.enabled) {
        res.status(403).json({
          error: "This survey phase is currently closed. Please contact your administrator.",
        });
        return;
      }
      res.json({
        verified: true,
        groupId: group._id.toString(),
        groupName: group.groupName,
        phase: phase.phaseType as "pre" | "post",
        groupCode: code,
      });
      return;
    }

    // Legacy fallback: old groups with top-level groupCode field
    const legacyGroup = await GroupModel.findOne({ groupCode: code });
    if (legacyGroup) {
      res.json({
        verified: true,
        groupId: legacyGroup._id.toString(),
        groupName: legacyGroup.groupName,
        phase: null,
        groupCode: code,
      });
      return;
    }

    res.status(404).json({ error: "Invalid group code. Please check with your administrator." });
  } catch (err) {
    req.log.error({ err }, "Group code verification failed");
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/survey/submit", validateSurvey, async (req, res) => {
  try {
    await connectMongo();

    const incoming = req.body.answers as Record<string, number>;
    const answersByQuestion: Record<string, number> = {};
    for (const q of QUESTIONS) {
      answersByQuestion[`${q.label}. ${q.text}`] = incoming[q.id];
    }

    const groupCode = req.body.groupCode ? String(req.body.groupCode).trim().toUpperCase() : null;
    const groupId = req.body.groupId ? String(req.body.groupId).trim() : null;
    const submissionType = req.body.submissionType === "group" ? "group" : "individual";
    const rawPhase = req.body.phase;
    const phase: "pre" | "post" | null =
      rawPhase === "pre" || rawPhase === "post" ? rawPhase : null;

    const doc = new ResponseModel({
      name: String(req.body.name).trim(),
      email: String(req.body.email).trim(),
      company: String(req.body.company).trim(),
      date: new Date(req.body.date),
      gender: req.body.gender,
      ageGroup: req.body.ageGroup,
      yearsInOrganization: req.body.yearsInOrganization,
      yearsInPosition: req.body.yearsInPosition,
      numberOfReports: req.body.numberOfReports,
      answers: answersByQuestion,
    });
    await doc.save();

    const scores: Record<string, number> = {
      "1": 0, "2": 0, "3": 0, "4": 0, "5": 0,
      "6": 0, "7": 0, "8": 0, "9": 0, "10": 0,
    };
    let totalResponses = 0;
    for (const q of QUESTIONS) {
      const v = incoming[q.id];
      if (typeof v === "number" && v >= 1 && v <= 10) {
        scores[String(v)]! += 1;
        totalResponses += 1;
      }
    }
    const submittedAt = new Date();
    const candidateInfo = {
      name: String(req.body.name).trim(),
      gender: String(req.body.gender ?? ""),
      age: String(req.body.ageGroup ?? ""),
      yearsInOrganization: String(req.body.yearsInOrganization ?? ""),
      yearsInPosition: String(req.body.yearsInPosition ?? ""),
    };
    const perceivedActual = computePerceivedActual(incoming);
    const composites = computeComposites(incoming);

    const craDoc = new CraResponseModel({
      name: String(req.body.name).trim(),
      email: String(req.body.email).trim(),
      company: String(req.body.company).trim(),
      submittedAt,
      scores,
      totalResponses,
      candidateInfo,
      perceivedActual,
      composites,
      icNumber: "",
      groupCode: groupCode || null,
      groupId: groupId || null,
      phase,
      submissionType,
    });
    await craDoc.save();

    res.json({ message: "Survey submitted successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to save survey");
    res.status(500).json({ error: "Failed to save survey" });
  }
});

export default router;
