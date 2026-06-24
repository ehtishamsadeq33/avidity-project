import { Router, type IRouter } from "express";
import puppeteer from "puppeteer-core";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  generateReportHTML,
  type CandidateInfo,
  type Composites,
  type GroupAverages,
  type PerceivedActual,
} from "../lib/reportHTML";
import {
  generateGroupReportHTML,
  generateGroupCandidateResultsHTML,
  type CandidateRow as GroupReportCandidateRow,
} from "../lib/groupReport";
import {
  generateCombinedGroupReportHTML,
  generatePrePostLandscapeHTML,
  type CandidateRow,
  type PrePostAverages,
} from "../lib/combineGroupReport";
import { mergeGroupReportPdfs } from "../lib/mergePdfs";
import {
  generateComparisonReportHTML,
  type ComparisonPhase,
} from "../lib/comparisonReportHTML";
import { connectMongo } from "../lib/mongo";
import { GroupModel } from "../models/Group";
import { CraResponseModel } from "../models/CraResponse";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function resolveChromiumPath(): string {
  const envPath = process.env["PUPPETEER_EXECUTABLE_PATH"];
  if (envPath) return envPath;
  const playwrightPath = process.env["REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE"];
  if (playwrightPath) return playwrightPath;
  try {
    return execSync("which chromium", { encoding: "utf8" }).trim();
  } catch {
    try {
      return execSync("which chromium-browser", { encoding: "utf8" }).trim();
    } catch {
      return "/usr/bin/chromium";
    }
  }
}
// ── Group Report PDF: POST /pdf/group ──────────────────────────────────────────
router.post("/pdf/group", async (req, res) => {
  try {
    const candidateInfo = req.body.candidateInfo ?? {};
    const perceivedActual = req.body.perceivedActual ?? {};
    const composites = req.body.composites ?? {};
    const scores = req.body.scores ?? {};

    await connectMongo();
    let groupAverages: GroupAverages | null = null;
    const bodyGroupId = req.body.groupId;
    if (bodyGroupId) {
      const group = await GroupModel.findById(String(bodyGroupId)).lean();
      if (group) {
        const submissions = await CraResponseModel.find({
          groupId: group._id.toString(),
        }).lean();
        const preSubmissions = submissions.filter(
          (s) => (s as any).phase === "pre",
        );
        const total = preSubmissions.length;
        if (total > 0) {
          let sumSkills = 0,
            sumWill = 0,
            sumEnv = 0;
          for (const s of preSubmissions) {
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

    // Load all the same images as /pdf
    const LOGO_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Group Pre Report.png";
    let logoBase64 = "";
    try {
      if (fs.existsSync(LOGO_PATH)) {
        logoBase64 = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Logo error:", e);
    }

    const QUOTE_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/CRA-02.png";
    let quoteImageBase64 = "";
    try {
      if (fs.existsSync(QUOTE_IMG_PATH)) {
        quoteImageBase64 = `data:image/png;base64,${fs.readFileSync(QUOTE_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Quote image error:", e);
    }

    const CHART_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/CRA-07.png";
    let chartImageBase64 = "";
    try {
      if (fs.existsSync(CHART_IMG_PATH)) {
        chartImageBase64 = `data:image/png;base64,${fs.readFileSync(CHART_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    const cardImagePaths = [
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Skills Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Will Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Environment Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_D-ND Composite.png",
    ];
    const cardImagesBase64: string[] = cardImagePaths.map((imgPath) => {
      try {
        if (fs.existsSync(imgPath)) {
          return `data:image/png;base64,${fs.readFileSync(imgPath).toString("base64")}`;
        }
      } catch (e) {
        console.log(`Card image error for ${imgPath}:`, e);
      }
      return "";
    });
    // ── actualskill chart image ────────────────────────────
    const actualskills_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Perceived & Actual Skills.png";
    let actualskillsImageBase64 = "";
    try {
      if (fs.existsSync(actualskills_IMG_PATH)) {
        actualskillsImageBase64 = `data:image/png;base64,${fs.readFileSync(actualskills_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Composite chart image ────────────────────────────
    const Composite_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Composite Scores.png";
    let CompositeImageBase64 = "";
    try {
      if (fs.existsSync(Composite_IMG_PATH)) {
        CompositeImageBase64 = `data:image/png;base64,${fs.readFileSync(Composite_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Cra chart image ────────────────────────────
    const CRA_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_CRA Score Spread.png";
    let CRAImageBase64 = "";
    try {
      if (fs.existsSync(CRA_IMG_PATH)) {
        CRAImageBase64 = `data:image/png;base64,${fs.readFileSync(CRA_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }
    // ── Compare chart image ────────────────────────────
    const Compare_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_How To Read This Section.png";
    let CompareImageBase64 = "";
    try {
      if (fs.existsSync(Compare_IMG_PATH)) {
        CompareImageBase64 = `data:image/png;base64,${fs.readFileSync(Compare_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }
    // ── Use generateGroupReportHTML instead of generateReportHTML ──
    const html = generateGroupReportHTML(
      candidateInfo,
      perceivedActual,
      composites,
      scores,
      logoBase64,
      groupAverages,
      quoteImageBase64,
      cardImagesBase64,
      chartImageBase64,
      actualskillsImageBase64,
      CompositeImageBase64,
      CRAImageBase64,
      CompareImageBase64,
    );

    // Build candidates array for landscape page if groupId present
    let candidates: GroupReportCandidateRow[] = [];
    let groupName = "Group";
    if (bodyGroupId) {
      const group = await GroupModel.findById(String(bodyGroupId)).lean();
      if (group) {
        groupName = (group as any).groupName || "Group";
        const submissions = await CraResponseModel.find({
          groupId: group._id.toString(),
        }).lean();
        const preSubmissions = submissions.filter(
          (s) => (s as any).phase === "pre",
        );
        for (const s of preSubmissions) {
          const sAny = s as any;
          const name =
            sAny.candidateInfo?.name || sAny.name || "Unnamed";
          const skills = sAny.composites?.skills?.percent ?? 0;
          const will = sAny.composites?.will?.percent ?? 0;
          const env = sAny.composites?.environmentalSupport?.percent ?? 0;
          const dn = sAny.composites?.directiveNonDirective?.percent ?? 0;
          const total = Math.round(
            ((skills * 1.3 + will * 1.45 + env * 1.25) / 4) * 100,
          ) / 100;
          candidates.push({
            name,
            preSkills: skills,
            preWill: will,
            preEnv: env,
            preDN: dn,
            preTotal: total,
          });
        }
      }
    }

    const executablePath = resolveChromiumPath();
    const browser = await puppeteer.launch({
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      headless: true,
    });

    try {
      // Generate portrait PDF (no built-in footer, mergeGroupReportPdfs adds it)
      const page = await browser.newPage();
      await page.setViewport({
        width: 794,
        height: 1440,
        deviceScaleFactor: 1,
      });
      await page.setBypassCSP(true);
      await page.setRequestInterception(false);
      await page.setContent(html, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 3000));
      const portraitPdf = await page.pdf({
        width: "210mm",
        height: "450mm",
        printBackground: true,
        margin: { top: "15px", bottom: "35px", left: "15px", right: "15px" },
        scale: 1,
        displayHeaderFooter: false,
      });

      // Generate landscape candidate-results page if candidates exist
      let finalPdf: Buffer;
      if (candidates.length > 0) {
        const landscapeHtml = generateGroupCandidateResultsHTML(
          groupName,
          candidates,
        );
        const landscapePage = await browser.newPage();
        await landscapePage.setViewport({
          width: 1122,
          height: 794,
          deviceScaleFactor: 1,
        });
        await landscapePage.setBypassCSP(true);
        await landscapePage.setRequestInterception(false);
        await landscapePage.setContent(landscapeHtml, {
          waitUntil: "networkidle0",
        });
        await new Promise((r) => setTimeout(r, 3000));
        const landscapePdf = await landscapePage.pdf({
          width: "297mm",
          height: "210mm",
          printBackground: true,
          margin: { top: "10px", bottom: "35px", left: "10px", right: "10px" },
          scale: 1,
          displayHeaderFooter: false,
        });
        finalPdf = await mergeGroupReportPdfs(
          Buffer.from(portraitPdf),
          Buffer.from(landscapePdf),
        );
      } else {
        finalPdf = Buffer.from(portraitPdf);
      }

      res.json({ pdf: finalPdf.toString("base64") });
    } finally {
      await browser.close();
    }
  } catch (error) {
    logger.error({ err: error }, "Group PDF generation failed");
    res.status(500).json({ error: "Group PDF generation failed" });
  }
});

// ── Combined Pre+Post Group Report: POST /pdf/group/combine ─────────────────────
router.post("/pdf/group/combine", async (req, res) => {
  try {
    const bodyGroupId = req.body.groupId;
    const groupNameLabel = req.body.groupNameLabel ?? "Candidate";
    if (!bodyGroupId) {
      res.status(400).json({ error: "groupId is required" });
      return;
    }

    await connectMongo();
    const group = await GroupModel.findById(String(bodyGroupId)).lean();
    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    const allSubs = await CraResponseModel.find({
      groupId: group._id.toString(),
    }).lean();
    const preSubs = allSubs.filter((s) => (s as any).phase === "pre");
    const postSubs = allSubs.filter((s) => (s as any).phase === "post");

    if (preSubs.length === 0 || postSubs.length === 0) {
      res.status(400).json({
        error: "Both PRE and POST submissions are required for combined report",
      });
      return;
    }

    // Match pre/post by name (or email fallback)
    // Fallback to top-level name/email because candidateInfo defaults may be empty
    const match = (pre: any) =>
      postSubs.find((post) => {
        const preName = String(pre.candidateInfo?.name || pre.name || "")
          .toLowerCase()
          .trim();
        const postName = String(post.candidateInfo?.name || post.name || "")
          .toLowerCase()
          .trim();
        if (preName && postName && preName === postName) return true;
        const preEmail = String(pre.email || "")
          .toLowerCase()
          .trim();
        const postEmail = String(post.email || "")
          .toLowerCase()
          .trim();
        if (preEmail && postEmail && preEmail === postEmail) return true;
        return false;
      });

    const candidatesList: CandidateRow[] = preSubs.map((pre: any) => {
      const post: any = match(pre) ?? null;
      const preS = pre.composites?.skills?.percent ?? 0;
      const preW = pre.composites?.will?.percent ?? 0;
      const preE = pre.composites?.environmentalSupport?.percent ?? 0;
      const preTotal =
        Math.round(((preS * 1.3 + preW * 1.45 + preE * 1.25) / 4) * 100) / 100;
      const postS = post?.composites?.skills?.percent ?? null;
      const postW = post?.composites?.will?.percent ?? null;
      const postE = post?.composites?.environmentalSupport?.percent ?? null;
      const postTotal =
        postS != null && postW != null && postE != null
          ? Math.round(
              ((postS * 1.3 + postW * 1.45 + postE * 1.25) / 4) * 100,
            ) / 100
          : null;
      return {
        name: pre.candidateInfo?.name || pre.name || "Unknown",
        preSkills: preS,
        postSkills: postS,
        preWill: preW,
        postWill: postW,
        preEnv: preE,
        postEnv: postE,
        preTotal: preTotal,
        postTotal: postTotal,
        preSkillRating: pre.perceivedActual?.whereTheyArePercent ?? 0,
        postSkillRating: post?.perceivedActual?.whereTheyArePercent ?? null,
        preDN: pre.composites?.directiveNonDirective?.percent ?? 0,
        postDN: post?.composites?.directiveNonDirective?.percent ?? null,
      };
    });

    if (candidatesList.length === 0) {
      res.status(400).json({
        error: "No pre-phase candidates found for combined report",
      });
      return;
    }

    // Aggregate composites across all pre submissions
    const avgPre = (getter: (s: any) => number) => {
      const sum = preSubs.reduce((a, s) => a + (getter(s) || 0), 0);
      return Math.round((sum / preSubs.length) * 100) / 100;
    };
    const avgPost = (getter: (s: any) => number) => {
      const sum = postSubs.reduce((a, s) => a + (getter(s) || 0), 0);
      return Math.round((sum / postSubs.length) * 100) / 100;
    };

    const preSkills = avgPre((s) => s.composites?.skills?.percent ?? 0);
    const preWill = avgPre((s) => s.composites?.will?.percent ?? 0);
    const preEnv = avgPre(
      (s) => s.composites?.environmentalSupport?.percent ?? 0,
    );
    const preDnd = avgPre(
      (s) => s.composites?.directiveNonDirective?.percent ?? 0,
    );
    const postSkills = avgPost((s) => s.composites?.skills?.percent ?? 0);
    const postWill = avgPost((s) => s.composites?.will?.percent ?? 0);
    const postEnv = avgPost(
      (s) => s.composites?.environmentalSupport?.percent ?? 0,
    );
    const postDnd = avgPost(
      (s) => s.composites?.directiveNonDirective?.percent ?? 0,
    );

    // Use PRE as the "base" for overall composites; the template shows pre/post rows
    const composites: Composites = {
      skills: {
        percent: preSkills,
        behavior: avgPre((s) => s.composites?.skills?.behavior ?? 0),
        knowledge: avgPre((s) => s.composites?.skills?.knowledge ?? 0),
        skill: avgPre((s) => s.composites?.skills?.skill ?? 0),
      },
      will: {
        percent: preWill,
        belief: avgPre((s) => s.composites?.will?.belief ?? 0),
        confidence: avgPre((s) => s.composites?.will?.confidence ?? 0),
        commitment: avgPre((s) => s.composites?.will?.commitment ?? 0),
        motivation: avgPre((s) => s.composites?.will?.motivation ?? 0),
      },
      environmentalSupport: {
        percent: preEnv,
        people: avgPre((s) => s.composites?.environmentalSupport?.people ?? 0),
        organization: avgPre(
          (s) => s.composites?.environmentalSupport?.organization ?? 0,
        ),
        leadership: avgPre(
          (s) => s.composites?.environmentalSupport?.leadership ?? 0,
        ),
      },
      directiveNonDirective: {
        percent: preDnd,
      },
    };

    const perceivedActual: PerceivedActual = {
      whatTheyThinkPercent: Math.round(
        preSubs.reduce(
          (a, s) => a + (s.perceivedActual?.whatTheyThinkPercent || 0),
          0,
        ) / preSubs.length,
      ),
      whereTheyArePercent: Math.round(
        preSubs.reduce(
          (a, s) => a + (s.perceivedActual?.whereTheyArePercent || 0),
          0,
        ) / preSubs.length,
      ),
    };

    const scores: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) {
      const key = String(i);
      scores[key] =
        Math.round(
          preSubs.reduce((a, s) => a + (s.scores?.[key] || 0), 0) /
            preSubs.length,
        ) / 100;
    }

    const postScores: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) {
      const key = String(i);
      postScores[key] =
        Math.round(
          postSubs.reduce((a, s) => a + (s.scores?.[key] || 0), 0) /
            postSubs.length,
        ) / 100;
    }

    const totalCRA =
      Math.round(
        ((preSkills * 1.3 + preWill * 1.45 + preEnv * 1.25) / 4) * 100,
      ) / 100;

    const groupAverages: GroupAverages = {
      total: preSubs.length,
      groupSkills: preSkills,
      groupWill: preWill,
      groupEnvironmentalSupport: preEnv,
    };

    const candidateInfo: CandidateInfo = {
      name: `${group.groupName} (PRE+POST - ${preSubs.length} PRE, ${postSubs.length} POST)`,
      gender: "—",
      age: "—",
      yearsInOrganization: "—",
      yearsInPosition: "—",
    };

    const postComposites: Composites = {
      skills: {
        percent: postSkills,
        behavior: avgPost((s) => s.composites?.skills?.behavior ?? 0),
        knowledge: avgPost((s) => s.composites?.skills?.knowledge ?? 0),
        skill: avgPost((s) => s.composites?.skills?.skill ?? 0),
      },
      will: {
        percent: postWill,
        belief: avgPost((s) => s.composites?.will?.belief ?? 0),
        confidence: avgPost((s) => s.composites?.will?.confidence ?? 0),
        commitment: avgPost((s) => s.composites?.will?.commitment ?? 0),
        motivation: avgPost((s) => s.composites?.will?.motivation ?? 0),
      },
      environmentalSupport: {
        percent: postEnv,
        people: avgPost((s) => s.composites?.environmentalSupport?.people ?? 0),
        organization: avgPost(
          (s) => s.composites?.environmentalSupport?.organization ?? 0,
        ),
        leadership: avgPost(
          (s) => s.composites?.environmentalSupport?.leadership ?? 0,
        ),
      },
      directiveNonDirective: {
        percent: postDnd,
      },
    };

    const postPerceivedActual: PerceivedActual = {
      whatTheyThinkPercent: Math.round(
        postSubs.reduce(
          (a, s) => a + (s.perceivedActual?.whatTheyThinkPercent || 0),
          0,
        ) / postSubs.length,
      ),
      whereTheyArePercent: Math.round(
        postSubs.reduce(
          (a, s) => a + (s.perceivedActual?.whereTheyArePercent || 0),
          0,
        ) / postSubs.length,
      ),
    };

    // Load images
    const LOGO_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Group Pre & Post Report.png";
    let logoBase64 = "";
    try {
      if (fs.existsSync(LOGO_PATH)) {
        logoBase64 = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}`;
      }
    } catch {
      /* ignore */
    }

    const QUOTE_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/CRA-02.png";
    let quoteImageBase64 = "";
    try {
      if (fs.existsSync(QUOTE_IMG_PATH)) {
        quoteImageBase64 = `data:image/png;base64,${fs.readFileSync(QUOTE_IMG_PATH).toString("base64")}`;
      }
    } catch {
      /* ignore */
    }

    const CHART_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/CRA-07.png";
    let chartImageBase64 = "";
    try {
      if (fs.existsSync(CHART_IMG_PATH)) {
        chartImageBase64 = `data:image/png;base64,${fs.readFileSync(CHART_IMG_PATH).toString("base64")}`;
      }
    } catch {
      /* ignore */
    }

    const cardImagePaths = [
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Skills Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Will Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Environment Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_D-ND Composite.png",
    ];
    const cardImagesBase64: string[] = cardImagePaths.map((imgPath) => {
      try {
        if (fs.existsSync(imgPath)) {
          return `data:image/png;base64,${fs.readFileSync(imgPath).toString("base64")}`;
        }
      } catch {
        /* ignore */
      }
      return "";
    });

    // ── actualskill chart image ────────────────────────────
    const actualskills_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Perceived & Actual Skills.png";
    let actualskillsImageBase64 = "";
    try {
      if (fs.existsSync(actualskills_IMG_PATH)) {
        actualskillsImageBase64 = `data:image/png;base64,${fs.readFileSync(actualskills_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Composite chart image ────────────────────────────
    const Composite_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Composite Scores.png";
    let CompositeImageBase64 = "";
    try {
      if (fs.existsSync(Composite_IMG_PATH)) {
        CompositeImageBase64 = `data:image/png;base64,${fs.readFileSync(Composite_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Cra chart image ────────────────────────────
    const CRA_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_CRA Score Spread.png";
    let CRAImageBase64 = "";
    try {
      if (fs.existsSync(CRA_IMG_PATH)) {
        CRAImageBase64 = `data:image/png;base64,${fs.readFileSync(CRA_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Compare chart image ────────────────────────────
    const Compare_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_How To Read This Section.png";
    let CompareImageBase64 = "";
    try {
      if (fs.existsSync(Compare_IMG_PATH)) {
        CompareImageBase64 = `data:image/png;base64,${fs.readFileSync(Compare_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    const html = generateCombinedGroupReportHTML(
      candidateInfo,
      perceivedActual,
      composites,
      scores,
      logoBase64,
      groupAverages,
      quoteImageBase64,
      cardImagesBase64,
      chartImageBase64,
      candidatesList,
      groupNameLabel,
      postComposites,
      postPerceivedActual,
      postScores,
      actualskillsImageBase64,
      CompositeImageBase64,
      CRAImageBase64,
      CompareImageBase64,
    );

    const averages: PrePostAverages = {
      preSkills: `${preSkills}%`,
      postSkills: `${postSkills}%`,
      preWill: `${preWill}%`,
      postWill: `${postWill}%`,
      preEnv: `${preEnv}%`,
      postEnv: `${postEnv}%`,
      preTotal: `${totalCRA}%`,
      postTotal: `${Math.round(((postSkills * 1.3 + postWill * 1.45 + postEnv * 1.25) / 4) * 100) / 100}%`,
      preSkillRating: `${perceivedActual.whereTheyArePercent ?? 0}%`,
      postSkillRating: `${postPerceivedActual.whereTheyArePercent ?? 0}%`,
      preDN: `${preDnd}%`,
      postDN: `${postDnd}%`,
    };

    const landscapeHtml = generatePrePostLandscapeHTML(
      String(group.groupName ?? ""),
      "",
      candidatesList,
      averages,
      logoBase64,
    );

    const executablePath = resolveChromiumPath();
    const browser = await puppeteer.launch({
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: 794,
        height: 1440,
        deviceScaleFactor: 1,
      });
      await page.setBypassCSP(true);
      await page.setRequestInterception(false);
      await page.setContent(html, { waitUntil: "networkidle0" as any });
      await new Promise((r) => setTimeout(r, 3000));
      const portraitPdf = await page.pdf({
        width: "210mm",
        height: "500mm",
        printBackground: true,
        margin: { top: "15px", bottom: "15px", left: "15px", right: "15px" },
        scale: 1,
        displayHeaderFooter: false,
      });

      const landscapePage = await browser.newPage();
      await landscapePage.setViewport({
        width: 1123,
        height: 794,
        deviceScaleFactor: 1,
      });
      await landscapePage.setBypassCSP(true);
      await landscapePage.setRequestInterception(false);
      await landscapePage.setContent(landscapeHtml, {
        waitUntil: "networkidle0" as any,
      });
      await new Promise((r) => setTimeout(r, 2000));
      const landscapePdf = await landscapePage.pdf({
        width: "297mm",
        height: "250mm",
        printBackground: true,
        margin: { top: "10px", bottom: "15px", left: "10px", right: "10px" },
        scale: 1,
        displayHeaderFooter: false,
      });
      await landscapePage.close();

      const mergedPdf = await mergeGroupReportPdfs(
        Buffer.from(portraitPdf),
        Buffer.from(landscapePdf),
      );
      res.json({ pdf: mergedPdf.toString("base64") });
    } finally {
      await browser.close();
    }
  } catch (error) {
    logger.error({ err: error }, "Combined group PDF generation failed");
    res.status(500).json({ error: "Combined group PDF generation failed" });
  }
});

router.post("/pdf", async (req, res) => {
  try {
    const candidateInfo = req.body.candidateInfo ?? {};
    const perceivedActual = req.body.perceivedActual ?? {};
    const composites = req.body.composites ?? {};
    const scores = req.body.scores ?? {};

    await connectMongo();
    let groupAverages: GroupAverages | null = null;
    const bodyGroupId = req.body.groupId;
    if (bodyGroupId) {
      const group = await GroupModel.findById(String(bodyGroupId)).lean();
      if (group) {
        const submissions = await CraResponseModel.find({
          groupId: group._id.toString(),
        }).lean();
        const preSubmissions = submissions.filter(
          (s) => (s as any).phase === "pre",
        );
        const total = preSubmissions.length;
        if (total > 0) {
          let sumSkills = 0,
            sumWill = 0,
            sumEnv = 0;
          for (const s of preSubmissions) {
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

    const LOGO_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Individual Pre Report.png";
    let logoBase64 = "";
    try {
      if (fs.existsSync(LOGO_PATH)) {
        logoBase64 = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}`;
        console.log("Logo loaded, length:", logoBase64.length);
      }
    } catch (e) {
      console.log("Logo error:", e);
    }
    // ── NEW: load CRA-02 for the quote block ──────────────────
    const QUOTE_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/CRA-02.png";
    let quoteImageBase64 = "";
    try {
      if (fs.existsSync(QUOTE_IMG_PATH)) {
        quoteImageBase64 = `data:image/png;base64,${fs.readFileSync(QUOTE_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Quote image error:", e);
    }

    // ── Load composite chart image ────────────────────────────
    const CHART_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/CRA-07.png";
    let chartImageBase64 = "";
    try {
      if (fs.existsSync(CHART_IMG_PATH)) {
        chartImageBase64 = `data:image/png;base64,${fs.readFileSync(CHART_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Load highlight card images ────────────────────────────
    const cardImagePaths = [
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Skills Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Will Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Environment Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_D-ND Composite.png",
    ];
    const cardImagesBase64: string[] = cardImagePaths.map((imgPath) => {
      try {
        if (fs.existsSync(imgPath)) {
          return `data:image/png;base64,${fs.readFileSync(imgPath).toString("base64")}`;
        }
      } catch (e) {
        console.log(`Card image error for ${imgPath}:`, e);
      }
      return "";
    });
    // ── actualskill chart image ────────────────────────────
    const actualskills_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Perceived & Actual Skills.png";
    let actualskillsImageBase64 = "";
    try {
      if (fs.existsSync(actualskills_IMG_PATH)) {
        actualskillsImageBase64 = `data:image/png;base64,${fs.readFileSync(actualskills_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Composite chart image ────────────────────────────
    const Composite_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Composite Scores.png";
    let CompositeImageBase64 = "";
    try {
      if (fs.existsSync(Composite_IMG_PATH)) {
        CompositeImageBase64 = `data:image/png;base64,${fs.readFileSync(Composite_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Cra chart image ────────────────────────────
    const CRA_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_CRA Score Spread.png";
    let CRAImageBase64 = "";
    try {
      if (fs.existsSync(CRA_IMG_PATH)) {
        CRAImageBase64 = `data:image/png;base64,${fs.readFileSync(CRA_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }
    // ── Compare chart image ────────────────────────────
    const Compare_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_How To Read This Section.png";
    let CompareImageBase64 = "";
    try {
      if (fs.existsSync(Compare_IMG_PATH)) {
        CompareImageBase64 = `data:image/png;base64,${fs.readFileSync(Compare_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }
    console.log(
      "=== Calling generateReportHTML with logoBase64 length ===",
      logoBase64?.length ?? 0,
    );

    const html = generateReportHTML(
      candidateInfo,
      perceivedActual,
      composites,
      scores,
      logoBase64,
      groupAverages,
      quoteImageBase64,
      cardImagesBase64,
      chartImageBase64,
      actualskillsImageBase64,
      CompositeImageBase64,
      CRAImageBase64,
      CompareImageBase64,
    );
    console.log(
      "=== HTML contains img tag ===",
      html.includes('<img src="data:image'),
    );

    const executablePath = resolveChromiumPath();
    const browser = await puppeteer.launch({
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: 794,
        height: 1440,
        deviceScaleFactor: 1,
      });
      await page.setBypassCSP(true);
      await page.setRequestInterception(false);
      await page.setContent(html, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 3000));
      const pdf = await page.pdf({
        width: "210mm",
        height: "450mm",
        printBackground: true,
        margin: { top: "15px", bottom: "35px", left: "15px", right: "15px" },
        scale: 1,
        displayHeaderFooter: true,
        footerTemplate: `<footer style="font-size:9px;font-family:Arial,sans-serif;width:100%;display:flex;justify-content:space-between;padding:0 20px;margin-top:8px;color:#666;">
          <span>Avidity International | Copyright &copy; Coach Readiness Assessment Report</span>
          <span>page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </footer>`,
      });
      const base64 = Buffer.from(pdf).toString("base64");
      res.json({ pdf: base64 });
    } finally {
      await browser.close();
    }
  } catch (error) {
    logger.error({ err: error }, "PDF generation failed");
    res.status(500).json({ error: "PDF generation failed" });
  }
});

// ── Comparison PDF: POST /pdf/compare ─────────────────────────────────────────
router.post("/pdf/compare", async (req, res) => {
  try {
    const { phases, candidateName } = req.body as {
      phases: ComparisonPhase[];
      candidateName?: string;
    };
    if (!phases || phases.length < 2) {
      res.status(400).json({ error: "At least 2 phases required" });
      return;
    }

    // ── Load CRA-01 logo ──────────────────────────────────────
    const LOGO_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Individual Pre & Post Report.png";
    let logoBase64 = "";
    try {
      if (fs.existsSync(LOGO_PATH)) {
        logoBase64 = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}`;
      }
    } catch {
      /* ignore */
    }

    // ── Load CRA-02 quote image ───────────────────────────────
    const QUOTE_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/CRA-02.png";
    let quoteImageBase64 = "";
    try {
      if (fs.existsSync(QUOTE_IMG_PATH)) {
        quoteImageBase64 = `data:image/png;base64,${fs.readFileSync(QUOTE_IMG_PATH).toString("base64")}`;
      }
    } catch {
      /* ignore */
    }

    // ── Load highlight card images ────────────────────────────
    const cardImagePaths = [
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Skills Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Will Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Environment Composite.png",
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_D-ND Composite.png",
    ];
    const cardImagesBase64: string[] = cardImagePaths.map((imgPath) => {
      try {
        if (fs.existsSync(imgPath)) {
          return `data:image/png;base64,${fs.readFileSync(imgPath).toString("base64")}`;
        }
      } catch {
        /* ignore */
      }
      return "";
    });

    // ── Load CRA-07 composite chart image ─────────────────────
    const CHART_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/CRA-07.png";
    let chartImageBase64 = "";
    try {
      if (fs.existsSync(CHART_IMG_PATH)) {
        chartImageBase64 = `data:image/png;base64,${fs.readFileSync(CHART_IMG_PATH).toString("base64")}`;
      }
    } catch {
      /* ignore */
    }

    // ── actualskill chart image ────────────────────────────
    const actualskills_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Perceived & Actual Skills.png";
    let actualskillsImageBase64 = "";
    try {
      if (fs.existsSync(actualskills_IMG_PATH)) {
        actualskillsImageBase64 = `data:image/png;base64,${fs.readFileSync(actualskills_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Composite chart image ────────────────────────────
    const Composite_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_Composite Scores.png";
    let CompositeImageBase64 = "";
    try {
      if (fs.existsSync(Composite_IMG_PATH)) {
        CompositeImageBase64 = `data:image/png;base64,${fs.readFileSync(Composite_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Cra chart image ────────────────────────────
    const CRA_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_CRA Score Spread.png";
    let CRAImageBase64 = "";
    try {
      if (fs.existsSync(CRA_IMG_PATH)) {
        CRAImageBase64 = `data:image/png;base64,${fs.readFileSync(CRA_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    // ── Compare chart image ────────────────────────────
    const Compare_IMG_PATH =
      "/home/runner/workspace/artifacts/mobile/assets/images/260622_How To Read This Section.png";
    let CompareImageBase64 = "";
    try {
      if (fs.existsSync(Compare_IMG_PATH)) {
        CompareImageBase64 = `data:image/png;base64,${fs.readFileSync(Compare_IMG_PATH).toString("base64")}`;
      }
    } catch (e) {
      console.log("Chart image error:", e);
    }

    const normalizedPhases = phases.map((phase) => {
      const submission =
        (phase as ComparisonPhase & { submission?: unknown }).submission ??
        phase;
      return {
        phaseType: phase.phaseType,
        submission,
      };
    });

    const html = generateComparisonReportHTML(
      normalizedPhases,
      logoBase64,
      candidateName,
      quoteImageBase64,
      cardImagesBase64,
      chartImageBase64,
      actualskillsImageBase64,
      CompositeImageBase64,
      CRAImageBase64,
      CompareImageBase64,
    );

    const executablePath = resolveChromiumPath();
    const browser = await puppeteer.launch({
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: 794,
        height: 1440,
        deviceScaleFactor: 1,
      });
      await page.setBypassCSP(true);
      await page.setContent(html, { waitUntil: "domcontentloaded" });
      await new Promise((r) => setTimeout(r, 3000));
      const pdf = await page.pdf({
        width: "210mm",
        height: "520mm",
        printBackground: true,
        margin: { top: "15px", bottom: "35px", left: "15px", right: "15px" },
        scale: 1,
        displayHeaderFooter: true,
        footerTemplate: `<footer style="font-size:9px;font-family:Arial,sans-serif;width:100%;display:flex;justify-content:space-between;padding:0 20px;margin-top:8px;color:#666;">
          <span>Avidity International | Copyright &copy; Coach Readiness Assessment Report</span>
          <span>page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </footer>`,
      });
      res.json({ pdf: Buffer.from(pdf).toString("base64") });
    } finally {
      await browser.close();
    }
  } catch (error) {
    logger.error({ err: error }, "Comparison PDF generation failed");
    const message =
      error instanceof Error
        ? error.message
        : "Comparison PDF generation failed";
    res.status(500).json({ error: message });
  }
});

export default router;
