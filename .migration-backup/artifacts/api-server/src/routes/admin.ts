import { Router, type IRouter, type Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import puppeteer from "puppeteer-core";
import { execSync } from "node:child_process";
import { connectMongo } from "../lib/mongo";
import { AdminModel } from "../models/Admin";
import { CraResponseModel } from "../models/CraResponse";
import { GroupModel } from "../models/Group";
import { requireAdmin, getJwtSecret, type AdminTokenPayload } from "../middlewares/adminAuth";
import { generateReportHTML } from "../lib/reportHTML";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function resolveChromiumPath(): string {
  const envPath = process.env["PUPPETEER_EXECUTABLE_PATH"];
  if (envPath) return envPath;
  try { return execSync("which chromium", { encoding: "utf8" }).trim(); } catch { /* */ }
  try { return execSync("which chromium-browser", { encoding: "utf8" }).trim(); } catch { /* */ }
  return "/usr/bin/chromium";
}

type AdminReq = Request & { admin?: AdminTokenPayload };

function toCandidatePayload(doc: Awaited<ReturnType<typeof CraResponseModel.findById>> & { toObject?: () => unknown } | any) {
  const plain = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  return {
    _id: plain?._id?.toString?.() ?? plain?._id,
    name: plain?.name ?? plain?.candidateInfo?.name ?? "",
    email: plain?.email ?? "",
    company: plain?.company ?? "",
    submittedAt: plain?.submittedAt,
    totalResponses: plain?.totalResponses ?? 0,
    scores: plain?.scores ?? {},
    candidateInfo: plain?.candidateInfo ?? {},
    perceivedActual: plain?.perceivedActual ?? {},
    composites: plain?.composites ?? {},
    icNumber: plain?.icNumber ?? "",
    groupCode: plain?.groupCode ?? null,
    groupId: plain?.groupId?.toString?.() ?? plain?.groupId ?? null,
    phase: plain?.phase ?? null,
    submissionType: plain?.submissionType ?? "individual",
  };
}

// ── Setup ─────────────────────────────────────────────────────────────────────
router.post("/admin/setup", async (req, res): Promise<void> => {
  await connectMongo();
  const count = await AdminModel.countDocuments();
  if (count > 0) { res.status(409).json({ error: "Admin already configured" }); return; }
  const { username = "admin", password = "admin123" } = req.body ?? {};
  const hashed = await bcrypt.hash(String(password), 12);
  const admin = new AdminModel({ username: String(username).toLowerCase().trim(), password: hashed });
  await admin.save();
  res.json({ message: "Admin created successfully" });
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/admin/login", async (req, res): Promise<void> => {
  await connectMongo();
  const { username, password } = req.body ?? {};
  if (!username || !password) { res.status(400).json({ error: "Username and password required" }); return; }
  const admin = await AdminModel.findOne({ username: String(username).toLowerCase().trim() });
  if (!admin) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const valid = await bcrypt.compare(String(password), admin.password);
  if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
  const token = jwt.sign(
    { adminId: admin._id.toString(), username: admin.username } as AdminTokenPayload,
    getJwtSecret(),
    { expiresIn: "7d" },
  );
  res.json({ token, username: admin.username });
});

// ── Me ────────────────────────────────────────────────────────────────────────
router.get("/admin/me", requireAdmin, (req: AdminReq, res) => {
  res.json({ username: req.admin?.username });
});

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get("/admin/stats", requireAdmin, async (_req, res) => {
  await connectMongo();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, thisWeek, thisMonth, averages, genderBreakdown, dist, timeline] = await Promise.all([
    CraResponseModel.countDocuments(),
    CraResponseModel.countDocuments({ submittedAt: { $gte: startOfWeek } }),
    CraResponseModel.countDocuments({ submittedAt: { $gte: startOfMonth } }),
    CraResponseModel.aggregate([
      {
        $group: {
          _id: null,
          totalSkills: { $sum: { $ifNull: ["$composites.skills.percent", 0] } },
          totalWill: { $sum: { $ifNull: ["$composites.will.percent", 0] } },
          totalEnv: { $sum: { $ifNull: ["$composites.environmentalSupport.percent", 0] } },
          totalDnd: { $sum: { $ifNull: ["$composites.directiveNonDirective.percent", 0] } },
          count: { $sum: 1 },
        },
      },
    ]),
    CraResponseModel.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$candidateInfo.gender", "unknown"] } },
          totalSkills: { $sum: { $ifNull: ["$composites.skills.percent", 0] } },
          totalWill: { $sum: { $ifNull: ["$composites.will.percent", 0] } },
          totalEnv: { $sum: { $ifNull: ["$composites.environmentalSupport.percent", 0] } },
          totalDnd: { $sum: { $ifNull: ["$composites.directiveNonDirective.percent", 0] } },
          count: { $sum: 1 },
        },
      },
    ]),
    CraResponseModel.aggregate([
      { $project: { score: { $round: ["$composites.skills.percent", 0] } } },
      { $group: { _id: "$score", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    CraResponseModel.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const count = averages[0]?.count ?? 0;
  const avg = (total: number) => count ? Math.round(total / count * 10) / 10 : 0;

  const genderCharts: Record<string, { skills: number; will: number; environmentalSupport: number; directiveNonDirective: number }> = {};
  for (const g of genderBreakdown) {
    const c = g.count ?? 1;
    genderCharts[g._id] = {
      skills: Math.round((g.totalSkills / c) * 10) / 10,
      will: Math.round((g.totalWill / c) * 10) / 10,
      environmentalSupport: Math.round((g.totalEnv / c) * 10) / 10,
      directiveNonDirective: Math.round((g.totalDnd / c) * 10) / 10,
    };
  }

  res.json({
    total,
    thisWeek,
    thisMonth,
    averages: {
      skills: avg(averages[0]?.totalSkills ?? 0),
      will: avg(averages[0]?.totalWill ?? 0),
      environmentalSupport: avg(averages[0]?.totalEnv ?? 0),
      directiveNonDirective: avg(averages[0]?.totalDnd ?? 0),
    },
    genderCharts,
    genderCounts: Object.fromEntries(genderBreakdown.map((d) => [d._id || "unknown", d.count])),
    scoreDistribution: Object.fromEntries(dist.map((d) => [String(d._id), d.count])),
    timeline: timeline.map((d) => ({ date: d._id, count: d.count })),
  });
});

// ── Candidate list ────────────────────────────────────────────────────────────
router.get("/admin/candidates", requireAdmin, async (req, res) => {
  await connectMongo();
  const {
    search = "",
    gender = "",
    age = "",
    yearsInOrganization = "",
    yearsInPosition = "",
    page = "1",
    limit = "20",
    submissionType = "",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const filter: Record<string, unknown> = {};

  if (search) filter["$or"] = [
    { name: { $regex: search, $options: "i" } },
    { "candidateInfo.name": { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
    { icNumber: { $regex: search, $options: "i" } },
  ];
  if (gender) filter["candidateInfo.gender"] = { $regex: new RegExp(`^${gender}$`, "i") };
  if (age) filter["candidateInfo.age"] = age;
  if (yearsInOrganization) filter["candidateInfo.yearsInOrganization"] = yearsInOrganization;
  if (yearsInPosition) filter["candidateInfo.yearsInPosition"] = yearsInPosition;
  if (submissionType && (submissionType === "individual" || submissionType === "group")) {
    filter["submissionType"] = submissionType;
  }

  const [candidates, total] = await Promise.all([
    CraResponseModel.find(filter).sort({ submittedAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    CraResponseModel.countDocuments(filter),
  ]);

  // Attach group names for group submissions
  const groupIds = [...new Set(candidates.filter((c: any) => c.groupId).map((c: any) => c.groupId?.toString()))];
  let groupMap: Record<string, string> = {};
  if (groupIds.length > 0) {
    const groups = await GroupModel.find({ _id: { $in: groupIds } }).lean();
    for (const g of groups) {
      groupMap[g._id.toString()] = g.groupName;
    }
  }

  const enriched = candidates.map((c: any) => ({
    ...toCandidatePayload(c),
    groupName: c.groupId ? (groupMap[c.groupId.toString()] ?? "") : "",
  }));

  res.json({
    candidates: enriched,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

// ── Single candidate ──────────────────────────────────────────────────────────
router.get("/admin/candidate/:id", requireAdmin, async (req, res): Promise<void> => {
  await connectMongo();
  const candidate = await CraResponseModel.findById(req.params.id).lean();
  if (!candidate) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toCandidatePayload(candidate));
});

// ── PDF for candidate ─────────────────────────────────────────────────────────
router.get("/admin/report/:id/pdf", requireAdmin, async (req, res): Promise<void> => {
  await connectMongo();
  const doc = await CraResponseModel.findById(req.params.id).lean();
  if (!doc) { res.status(404).json({ error: "Not found" }); return; }

  const scores =
    doc.scores instanceof Map
      ? Object.fromEntries(doc.scores as Map<string, number>)
      : (doc.scores as Record<string, number>) ?? {};

  let groupAverages = null;
  const docGroupId = (doc as any).groupId;
  if (docGroupId) {
    const group = await GroupModel.findById(docGroupId).lean();
    if (group) {
      const submissions = await CraResponseModel.find({ groupCode: group.groupCode }).lean();
      const total = submissions.length;
      if (total > 0) {
        let sumSkills = 0, sumWill = 0, sumEnv = 0;
        for (const s of submissions) {
          sumSkills += (s.composites as any)?.skills?.percent ?? 0;
          sumWill += (s.composites as any)?.will?.percent ?? 0;
          sumEnv += (s.composites as any)?.environmentalSupport?.percent ?? 0;
        }
        groupAverages = {
          total,
          groupSkills: parseFloat((sumSkills / total).toFixed(1)),
          groupWill: parseFloat((sumWill / total).toFixed(1)),
          groupEnvironmentalSupport: parseFloat((sumEnv / total).toFixed(1)),
        };
      }
    }
  }

  const html = generateReportHTML(
    doc.candidateInfo as Parameters<typeof generateReportHTML>[0],
    doc.perceivedActual as Parameters<typeof generateReportHTML>[1],
    doc.composites as Parameters<typeof generateReportHTML>[2],
    scores,
    "",
    groupAverages,
  );

  const executablePath = resolveChromiumPath();
  const browser = await puppeteer.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 500));
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });
    const base64 = Buffer.from(pdf).toString("base64");
    res.json({ pdf: base64 });
  } catch (err) {
    logger.error({ err }, "PDF generation failed");
    res.status(500).json({ error: "PDF generation failed" });
  } finally {
    await browser.close();
  }
});

// ── Analytics data ────────────────────────────────────────────────────────────
router.get("/admin/analytics", requireAdmin, async (_req, res) => {
  await connectMongo();
  const points = await CraResponseModel.aggregate([
    {
      $project: {
        name: { $ifNull: ["$candidateInfo.name", "$name"] },
        skills: { $ifNull: ["$composites.skills.percent", 0] },
        will: { $ifNull: ["$composites.will.percent", 0] },
        env: { $ifNull: ["$composites.environmentalSupport.percent", 0] },
        submittedAt: 1,
      },
    },
    { $sort: { submittedAt: -1 } },
  ]);
  res.json({ points });
});

// ── Groups CRUD ───────────────────────────────────────────────────────────────
function generatePhaseCode(prefix: "PRE" | "POST", groupName: string): string {
  const slug = groupName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4).padEnd(4, "X");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${slug}-${rand}`;
}

router.post("/admin/groups", requireAdmin, async (req: AdminReq, res): Promise<void> => {
  await connectMongo();
  const { groupName, organization, description } = req.body ?? {};
  if (!groupName) { res.status(400).json({ error: "Group name is required" }); return; }
  const preCode = generatePhaseCode("PRE", String(groupName).trim());
  const group = new GroupModel({
    groupName: String(groupName).trim(),
    organization: organization ? String(organization).trim() : "",
    description: description ? String(description).trim() : "",
    phases: [{ phaseType: "pre", code: preCode, enabled: true, createdAt: new Date() }],
    createdBy: req.admin?.username ?? "admin",
  });
  await group.save();
  res.json({ group });
});

router.get("/admin/groups", requireAdmin, async (_req, res) => {
  await connectMongo();
  const groups = await GroupModel.find().sort({ createdAt: -1 }).lean();
  const enriched = await Promise.all(
    groups.map(async (g) => {
      const hasPhases = g.phases && g.phases.length > 0;
      if (hasPhases) {
        const phaseCounts: Record<string, number> = {};
        let submissionCount = 0;
        for (const ph of g.phases as any[]) {
          const count = await CraResponseModel.countDocuments({ groupId: g._id, phase: ph.phaseType });
          phaseCounts[ph.phaseType as string] = count;
          submissionCount += count;
        }
        return { ...g, submissionCount, phaseCounts };
      }
      // Legacy group (has top-level groupCode)
      const submissionCount = await CraResponseModel.countDocuments({ groupId: g._id });
      return { ...g, submissionCount, phaseCounts: {} };
    }),
  );
  res.json({ groups: enriched });
});

router.get("/admin/groups/:id", requireAdmin, async (req, res): Promise<void> => {
  await connectMongo();
  const group = await GroupModel.findById(req.params.id).lean();
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  res.json({ group });
});

router.delete("/admin/groups/:id", requireAdmin, async (req, res): Promise<void> => {
  await connectMongo();
  await GroupModel.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.post("/admin/groups/:id/generate-post", requireAdmin, async (req, res): Promise<void> => {
  await connectMongo();
  const group = await GroupModel.findById(req.params.id);
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  const existing = (group.phases as any[]).find((p: any) => p.phaseType === "post");
  if (existing) { res.status(409).json({ error: "POST phase already exists for this group" }); return; }
  const postCode = generatePhaseCode("POST", group.groupName);
  (group.phases as any[]).push({ phaseType: "post", code: postCode, enabled: true, createdAt: new Date() });
  await group.save();
  res.json({ group });
});

router.post("/admin/groups/:id/phases/:phaseType/toggle", requireAdmin, async (req, res): Promise<void> => {
  await connectMongo();
  const { phaseType } = req.params;
  if (phaseType !== "pre" && phaseType !== "post") { res.status(400).json({ error: "Invalid phase type" }); return; }
  const group = await GroupModel.findById(req.params.id);
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  const phase = (group.phases as any[]).find((p: any) => p.phaseType === phaseType);
  if (!phase) { res.status(404).json({ error: "Phase not found" }); return; }
  phase.enabled = !phase.enabled;
  await group.save();
  res.json({ group });
});

router.get("/admin/groups/:id/submissions", requireAdmin, async (req, res): Promise<void> => {
  await connectMongo();
  const group = await GroupModel.findById(req.params.id).lean();
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }
  const { phase } = req.query;
  const query: Record<string, unknown> = { groupId: group._id };
  if (phase === "pre" || phase === "post") query.phase = phase;
  const submissions = await CraResponseModel.find(query).sort({ submittedAt: -1 }).lean();
  res.json({ submissions: submissions.map(toCandidatePayload), group });
});

router.delete("/admin/responses/:id", requireAdmin, async (req, res): Promise<void> => {
  await connectMongo();
  const result = await CraResponseModel.findByIdAndDelete(req.params.id);
  if (!result) { res.status(404).json({ error: "Submission not found" }); return; }
  res.json({ success: true });
});

router.get("/admin/groups/:id/averages", requireAdmin, async (req, res): Promise<void> => {
  await connectMongo();
  const group = await GroupModel.findById(req.params.id).lean();
  if (!group) { res.status(404).json({ error: "Group not found" }); return; }

  const computeAvg = async (query: Record<string, unknown>) => {
    const subs = await CraResponseModel.find(query).lean();
    const total = subs.length;
    if (total === 0) {
      return { total: 0, groupSkills: null, groupWill: null, groupEnvironmentalSupport: null, candidates: [] };
    }
    let sumSkills = 0, sumWill = 0, sumEnv = 0;
    const candidates = subs.map((s) => {
      const sk = (s.composites as any)?.skills?.percent ?? 0;
      const wi = (s.composites as any)?.will?.percent ?? 0;
      const en = (s.composites as any)?.environmentalSupport?.percent ?? 0;
      sumSkills += sk; sumWill += wi; sumEnv += en;
      return { name: s.name, skills: sk, will: wi, environmentalSupport: en, phase: (s as any).phase ?? null };
    });
    return {
      total,
      groupSkills: parseFloat((sumSkills / total).toFixed(1)),
      groupWill: parseFloat((sumWill / total).toFixed(1)),
      groupEnvironmentalSupport: parseFloat((sumEnv / total).toFixed(1)),
      candidates,
    };
  };

  const hasPhases = group.phases && group.phases.length > 0;
  const all = await computeAvg({ groupId: group._id });
  if (hasPhases) {
    const pre = await computeAvg({ groupId: group._id, phase: "pre" });
    const post = await computeAvg({ groupId: group._id, phase: "post" });
    res.json({ ...all, pre, post });
  } else {
    res.json({ ...all, pre: null, post: null });
  }
});

export default router;
