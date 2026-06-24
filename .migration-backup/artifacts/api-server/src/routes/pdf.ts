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
import { connectMongo } from "../lib/mongo";
import { GroupModel } from "../models/Group";
import { CraResponseModel } from "../models/CraResponse";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function resolveChromiumPath(): string {
  const envPath = process.env["PUPPETEER_EXECUTABLE_PATH"];
  if (envPath) return envPath;
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

    const LOGO_PATH = '/home/runner/workspace/artifacts/mobile/assets/images/icon.png';
    let logoBase64 = '';
    try {
      if (fs.existsSync(LOGO_PATH)) {
        logoBase64 = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`;
        console.log('Logo loaded, length:', logoBase64.length);
      }
    } catch(e) {
      console.log('Logo error:', e);
    }
    console.log('=== Calling generateReportHTML with logoBase64 length ===', logoBase64?.length ?? 0);
    const html = generateReportHTML(candidateInfo, perceivedActual, composites, scores, logoBase64, groupAverages);
    console.log('=== HTML contains img tag ===', html.includes('<img src="data:image'));

    const executablePath = resolveChromiumPath();
    const browser = await puppeteer.launch({
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: 794,
        height: 1123,
        deviceScaleFactor: 1,
      });
      await page.setBypassCSP(true);
      await page.setRequestInterception(false);
      await page.setContent(html, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 3000));
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "15px", bottom: "15px", left: "15px", right: "15px" },
        scale: 1,
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

export default router;
