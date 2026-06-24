import { Router, type IRouter } from "express";
import healthRouter from "./health";
import surveyRouter from "./survey";
import pdfRouter from "./pdf";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(surveyRouter);
router.use(pdfRouter);
router.use(adminRouter);

export default router;
