import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { connectMongo } from "./lib/mongo";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JSON parse error handler
app.use((err: Error & { type?: string }, _req: Request, res: Response, next: NextFunction) => {
  if (err && (err.type === "entity.parse.failed" || err.message?.includes("JSON"))) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next(err);
});

app.use("/api", router);

// Eagerly connect to Mongo so first request is fast
connectMongo().catch((err) => logger.error({ err }, "Initial MongoDB connect failed"));

export default app;
