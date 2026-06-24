import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function getJwtSecret(): string {
  return process.env["ADMIN_JWT_SECRET"] ?? "cra-admin-secret-change-in-production";
}

export interface AdminTokenPayload {
  adminId: string;
  username: string;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as AdminTokenPayload;
    (req as Request & { admin?: AdminTokenPayload }).admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
