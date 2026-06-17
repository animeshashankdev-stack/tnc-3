import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const router = Router();

const CRM_BASE = "https://crm.tncnursing.in";
const ADMIN_PASSWORD = "newtncsite";
const ADMIN_TOKEN = "admin_tnc_2024_secure_token";
const PROMO_EXPIRES_DAYS = 30;

let promoState = {
  enabled: true,
  expiresAt: new Date(Date.now() + PROMO_EXPIRES_DAYS * 24 * 60 * 60 * 1000).toISOString() as string | null,
};

async function crmQuery(payload: object): Promise<unknown> {
  const resp = await fetch(`${CRM_BASE}/common/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: JSON.stringify(payload) }),
  });
  if (!resp.ok) throw new Error(`CRM error ${resp.status}`);
  return resp.json();
}

function buildMediaUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${CRM_BASE}/${path.replace(/^\//, "")}`;
}

function parseCourse(row: Record<string, unknown>) {
  const json = (row.json as Record<string, unknown>) ?? {};
  const at = (json._at as Record<string, unknown>) ?? {};
  return {
    id: row.id,
    rowId: row.row_id,
    name: json._na ?? "",
    description: json._de ?? "",
    serialNo: json._sno ?? "",
    imageUrl: buildMediaUrl(at.url as string),
    createdAt: row.cr_on,
    updatedAt: row.up_on,
  };
}

function isYouTubeUrl(url: unknown): url is string {
  if (typeof url !== "string" || !url.startsWith("http")) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function isPlayableUrl(url: unknown): url is string {
  if (typeof url !== "string" || !url.startsWith("http")) return false;
  return true;
}

function parseChapter(row: Record<string, unknown>) {
  const json = (row.json as Record<string, unknown>) ?? {};
  const vi = (json._vi as Record<string, unknown>) ?? {};
  const de = (json._de as Record<string, unknown>) ?? {};
  const deVi = (de._vi as Record<string, unknown>) ?? {};
  const deNo = (de._no as Record<string, unknown>) ?? {};

  const rawVideoUrl = (vi._vi_url ?? deVi.url ?? "") as string;
  const videoUrl = isYouTubeUrl(rawVideoUrl) || isPlayableUrl(rawVideoUrl) ? rawVideoUrl : null;

  const firebaseId = (vi._fs_id ?? deVi.fs_id ?? "") as string;
  const hasFirebase = typeof firebaseId === "string" && firebaseId.trim().length > 10;

  const rawPdfPath = ((deNo.url ?? "") as string).replace(/^\//, "");
  const isCrmHostedPdf = rawPdfPath.startsWith("uploads/");
  const pdfUrl = isCrmHostedPdf
    ? `/api/pdf?path=${encodeURIComponent(rawPdfPath)}`
    : null;

  const hasFirebasePdf = !isCrmHostedPdf && rawPdfPath.length > 0;

  let contentType: "youtube" | "firebase" | "pdf" | "none";
  if (videoUrl) {
    contentType = "youtube";
  } else if (hasFirebase || hasFirebasePdf) {
    contentType = "firebase";
  } else if (pdfUrl) {
    contentType = "pdf";
  } else {
    contentType = "none";
  }

  return {
    id: row.id as number,
    rowId: row.row_id as string,
    title: (json._na ?? "Untitled") as string,
    description: "",
    videoUrl,
    pdfUrl,
    contentType,
    type: contentType === "youtube" ? "video" : contentType === "pdf" ? "pdf" : "content",
    courseId: (row.co_refid ?? json._co) as string | null,
    subjectId: (row.su_refid ?? json._su) as string | null,
    isPaid: (json._pr_ty as number) === 1,
    duration: null as string | null,
    thumbnailUrl: null as string | null,
    serialNo: String(json._sno ?? ""),
    createdAt: row.cr_on as string,
  };
}

function parseSlider(row: Record<string, unknown>) {
  const json = (row.json as Record<string, unknown>) ?? {};
  const at = (json._at as Record<string, unknown>) ?? {};
  return {
    id: row.id,
    rowId: row.row_id,
    imageUrl: buildMediaUrl(at.url as string) ?? "",
    name: (json._na ?? "") as string,
    description: (json._de ?? "") as string,
  };
}

function parseUserRow(row: Record<string, unknown>) {
  const json = (row.json as Record<string, unknown>) ?? {};
  return {
    userId: (json._us_id ?? row.row_id) as string,
    name: (json._us_na ?? "") as string,
    mobile: (json._mo ?? "") as string,
    email: (json._em as string) ?? null,
    college: (json._cl as string) ?? null,
    state: (json._st as string) ?? null,
    token: `usr_${json._us_id ?? row.row_id}`,
  };
}

function parseAdminUser(row: Record<string, unknown>) {
  const json = (row.json as Record<string, unknown>) ?? {};
  return {
    id: row.id,
    rowId: row.row_id,
    name: (json._us_na ?? "") as string,
    mobile: (json._mo ?? "") as string,
    email: (json._em as string) ?? null,
    college: (json._cl as string) ?? null,
    state: (json._st as string) ?? null,
    createdAt: row.cr_on,
  };
}

function parseExam(row: Record<string, unknown>) {
  const json = (row.json as Record<string, unknown>) ?? {};
  const quRefids = (row.qu_refid as string[]) ?? [];
  return {
    examId: row.row_id as string,
    examNo: (row.examno as number) ?? 0,
    name: (json._ex_na ?? "Quiz") as string,
    maxMarks: (json._ma_ma as number) ?? 0,
    negativeMarks: (json._ne_ma as number) ?? 0.25,
    durationMinutes: String(json._ex_du ?? "60"),
    questionCount: quRefids.length,
    validUntil: (json._va_ti as string) ?? null,
    allowForPremium: (json._al_fo_pr as number) === 1,
    startDate: (json._st_da as string) ?? null,
    endDate: (json._en_da as string) ?? null,
  };
}

function parseQuestion(row: Record<string, unknown>) {
  const json = (row.json as Record<string, unknown>) ?? {};
  const quObj = (json._qu as Record<string, unknown>) ?? {};
  const ops = (json._op as Record<string, Record<string, unknown>>) ?? {};
  const soObj = (json._so as Record<string, unknown>) ?? {};

  return {
    rowId: row.row_id as string,
    questionId: row.id as number,
    questionText: (quObj._qu ?? "") as string,
    optionA: ((ops._op_A ?? {})?._op_ti ?? "") as string,
    optionB: ((ops._op_B ?? {})?._op_ti ?? "") as string,
    optionC: ((ops._op_C ?? {})?._op_ti ?? "") as string,
    optionD: ((ops._op_D ?? {})?._op_ti ?? "") as string,
    correctAnswer: (json._an ?? "") as string,
    explanation: (soObj._ti ?? null) as string | null,
    questionNo: (json._qno as number) ?? null,
  };
}

// GET /api/courses
router.get("/courses", async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_co",
      data: { json: "*" }, cond: {},
    });
    const courses = Array.isArray(data)
      ? (data as Record<string, unknown>[]).map(parseCourse)
      : [];
    // Sort by serial number
    courses.sort((a, b) => {
      const aNo = parseFloat(String(a.serialNo)) || 0;
      const bNo = parseFloat(String(b.serialNo)) || 0;
      return aNo - bNo;
    });
    res.json(courses);
  } catch (err) {
    logger.error({ err }, "Failed to fetch courses");
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// GET /api/pdf?path=... — proxy PDFs from CRM
router.get("/pdf", async (req: Request, res: Response): Promise<void> => {
  try {
    const { path: pdfPath } = req.query;
    if (!pdfPath || typeof pdfPath !== "string") {
      res.status(400).json({ error: "Missing path" });
      return;
    }
    const url = `${CRM_BASE}/${pdfPath.replace(/^\/+/, "")}`;
    const upstream = await fetch(url);
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "PDF not found" });
      return;
    }
    const contentType = upstream.headers.get("content-type") ?? "application/pdf";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const buf = await upstream.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    logger.error({ err }, "Failed to proxy PDF");
    res.status(500).json({ error: "Failed to load PDF" });
  }
});

// GET /api/sessions — queries t_ch (real video sessions)
router.get("/sessions", async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, limit: limitParam, type } = req.query;
    const cond: Record<string, unknown> = {};
    if (courseId) cond.co_refid = courseId;

    const data = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_ch",
      data: { json: "*" }, cond,
    });

    if (!Array.isArray(data)) {
      res.json([]);
      return;
    }

    let sessions = (data as Record<string, unknown>[]).map(parseChapter);

    // Filter by content type if requested
    if (type === "video") {
      sessions = sessions.filter((s) => s.contentType === "youtube" || s.videoUrl);
    } else if (type === "pdf") {
      sessions = sessions.filter((s) => s.contentType === "pdf" || s.pdfUrl);
    }

    // Sort by serial number ascending
    sessions.sort((a, b) => {
      const aNo = parseFloat(String(a.serialNo)) || 0;
      const bNo = parseFloat(String(b.serialNo)) || 0;
      return aNo - bNo;
    });

    // Limit when no courseId to avoid huge payloads
    if (!courseId) {
      const limit = Math.min(parseInt(String(limitParam ?? "200")), 500);
      sessions = sessions.slice(0, limit);
    }

    res.json(sessions);
  } catch (err) {
    logger.error({ err }, "Failed to fetch sessions");
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// GET /api/sessions/:rowId — fetch a single session by rowId
router.get("/sessions/:rowId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { rowId } = req.params;
    const data = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_ch",
      data: { json: "*" }, cond: { row_id: rowId },
    });
    if (!Array.isArray(data) || data.length === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(parseChapter((data as Record<string, unknown>[])[0]));
  } catch (err) {
    logger.error({ err }, "Failed to fetch session");
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// GET /api/sliders
router.get("/sliders", async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_sl",
      data: { json: "*" }, cond: {},
    });
    res.json(Array.isArray(data) ? (data as Record<string, unknown>[]).map(parseSlider) : []);
  } catch (err) {
    logger.error({ err }, "Failed to fetch sliders");
    res.status(500).json({ error: "Failed to fetch sliders" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { mobile, password } = req.body as { mobile: string; password: string };
    if (!mobile || !password) {
      res.status(400).json({ error: "Mobile and password required" });
      return;
    }
    const data = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_us",
      data: { json: "*" },
      cond: { "json->>'_mo'": mobile, "json->>'_us_pa'": password },
    });
    if (!Array.isArray(data) || data.length === 0) {
      res.status(401).json({ error: "Invalid mobile number or password" });
      return;
    }
    res.json(parseUserRow((data as Record<string, unknown>[])[0]));
  } catch (err) {
    logger.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/register
router.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, mobile, password, email, college, state, city, gender, dob } = req.body as Record<string, string>;
    if (!name || !mobile || !password) {
      res.status(400).json({ error: "Name, mobile, and password are required" });
      return;
    }
    const existing = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_us",
      data: { json: "*" }, cond: { "json->>'_mo'": mobile },
    });
    if (Array.isArray(existing) && existing.length > 0) {
      res.status(409).json({ error: "Mobile number already registered" });
      return;
    }
    const userId = `${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const rowId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await crmQuery({
      fn: "common_fn", se: "in", sch: "t_us",
      data: {
        row_id: rowId, us_gr: 1, status: 0,
        json: {
          _us_id: userId, _us_na: name, _mo: mobile, _us_pa: password,
          _em: email ?? "", _cl: college ?? "", _st: state ?? "",
          _ci: city ?? "", _ge: gender ?? "", _dob: dob ?? "",
          _cr_on: new Date().toLocaleString(), _up_on: new Date().toLocaleString(),
        },
      },
      cond: {},
    });
    res.status(201).json({
      userId, name, mobile, email: email ?? null, college: college ?? null,
      state: state ?? null, token: `usr_${userId}`,
    });
  } catch (err) {
    logger.error({ err }, "Registration failed");
    res.status(500).json({ error: "Registration failed" });
  }
});

// GET /api/purchases/:userId
router.get("/purchases/:userId", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_cu",
      data: { json: "*" }, cond: { us_refid: req.params.userId },
    });
    if (!Array.isArray(data)) {
      res.json([]);
      return;
    }
    res.json(
      (data as Record<string, unknown>[]).map((row) => {
        const json = (row.json as Record<string, unknown>) ?? {};
        return {
          id: row.id, rowId: row.row_id, userId: row.us_refid,
          courseId: (json._co_id as string) ?? "",
          courseName: (json._co_na ?? json._na ?? "") as string,
          amount: (json._am as number) ?? null,
          paymentId: (json._pa_id as string) ?? null,
          createdAt: row.cr_on,
        };
      })
    );
  } catch (err) {
    logger.error({ err }, "Failed to fetch purchases");
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// POST /api/purchases
router.post("/purchases", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId, courseName, amount, paymentId } = req.body as Record<string, unknown>;
    if (!userId || !courseId || !courseName) {
      res.status(400).json({ error: "userId, courseId, and courseName are required" });
      return;
    }
    const rowId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await crmQuery({
      fn: "common_fn", se: "in", sch: "t_cu",
      data: {
        row_id: rowId, us_refid: userId,
        json: { _co_id: courseId, _co_na: courseName, _am: amount ?? 0, _pa_id: paymentId ?? "" },
      },
      cond: {},
    });
    res.status(201).json({
      id: Date.now(), rowId, userId, courseId, courseName,
      amount: (amount as number) ?? null, paymentId: (paymentId as string) ?? null,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to create purchase");
    res.status(500).json({ error: "Failed to create purchase" });
  }
});

// POST /api/admin/login
router.post("/admin/login", (req: Request, res: Response): void => {
  const { password } = req.body as { password: string };
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid admin password" });
    return;
  }
  res.json({ token: ADMIN_TOKEN, message: "Admin logged in successfully" });
});

// GET /api/admin/stats — only fetch courses & users (NOT the 59k sessions table)
router.get("/admin/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [coursesData, usersData, purchasesData] = await Promise.all([
      crmQuery({ fn: "common_fn", se: "fe", sch: "t_co", data: { json: "*" }, cond: {} }),
      crmQuery({ fn: "common_fn", se: "fe", sch: "t_us", data: { json: "*" }, cond: {} }),
      crmQuery({ fn: "common_fn", se: "fe", sch: "t_cu", data: { json: "*" }, cond: {} }),
    ]);
    const courses = Array.isArray(coursesData) ? coursesData as Record<string, unknown>[] : [];
    const users = Array.isArray(usersData) ? usersData as Record<string, unknown>[] : [];
    const purchases = Array.isArray(purchasesData) ? purchasesData as Record<string, unknown>[] : [];

    // Sort users by created_at descending for recent users
    const sortedUsers = [...users].sort((a, b) => {
      const aTime = String(a.cr_on ?? "");
      const bTime = String(b.cr_on ?? "");
      return bTime.localeCompare(aTime);
    });

    res.json({
      totalUsers: users.length,
      totalCourses: courses.length,
      totalSessions: 59806, // Known count from t_ch — too large to fetch dynamically
      totalPurchases: purchases.length,
      recentUsers: sortedUsers.slice(0, 15).map(parseAdminUser),
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch admin stats");
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// GET /api/admin/users
router.get("/admin/users", async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) ?? "";
    const data = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_us", data: { json: "*" }, cond: {},
    });
    let users = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
    if (search) {
      const q = search.toLowerCase();
      users = users.filter((row) => {
        const json = (row.json as Record<string, unknown>) ?? {};
        return (
          String(json._us_na ?? "").toLowerCase().includes(q) ||
          String(json._mo ?? "").includes(q) ||
          String(json._em ?? "").toLowerCase().includes(q)
        );
      });
    }
    // Sort newest first
    users = [...users].sort((a, b) => String(b.cr_on ?? "").localeCompare(String(a.cr_on ?? "")));
    const total = users.length;
    res.json({
      users: users.slice((page - 1) * limit, page * limit).map(parseAdminUser),
      total, page, limit,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch admin users");
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/promo/status
router.get("/promo/status", (_req: Request, res: Response): void => {
  const now = new Date();
  if (promoState.expiresAt && new Date(promoState.expiresAt) < now) {
    promoState.enabled = false;
    promoState.expiresAt = null;
  }
  res.json({
    enabled: promoState.enabled,
    expiresAt: promoState.expiresAt,
    message: promoState.enabled
      ? `Promo active — all content unlocked until ${new Date(promoState.expiresAt!).toLocaleDateString("en-IN")}`
      : "Promotional mode is inactive",
  });
});

// POST /api/promo/toggle
router.post("/promo/toggle", (req: Request, res: Response): void => {
  const { enabled, durationDays, adminToken } = req.body as { enabled: boolean; durationDays?: number; adminToken: string };
  if (adminToken !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  promoState.enabled = Boolean(enabled);
  if (promoState.enabled) {
    const days = durationDays ?? PROMO_EXPIRES_DAYS;
    promoState.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  } else {
    promoState.expiresAt = null;
  }
  res.json({
    enabled: promoState.enabled,
    expiresAt: promoState.expiresAt,
    message: promoState.enabled
      ? `Promotional mode enabled for ${durationDays ?? PROMO_EXPIRES_DAYS} days`
      : "Promotional mode disabled",
  });
});

// POST /api/promo/extend — extend the free period without toggling
router.post("/promo/extend", (req: Request, res: Response): void => {
  const { durationDays, adminToken } = req.body as { durationDays: number; adminToken: string };
  if (adminToken !== ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!durationDays || durationDays < 1) {
    res.status(400).json({ error: "Invalid durationDays" });
    return;
  }
  // Extend from current expiry (or from now if expired/disabled)
  const base = promoState.expiresAt && new Date(promoState.expiresAt) > new Date()
    ? new Date(promoState.expiresAt)
    : new Date();
  promoState.enabled = true;
  promoState.expiresAt = new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
  res.json({
    enabled: promoState.enabled,
    expiresAt: promoState.expiresAt,
    message: `Free period extended by ${durationDays} days — now active until ${new Date(promoState.expiresAt).toLocaleDateString("en-IN")}`,
  });
});

// GET /api/quizzes — list exam sets from t_ex
router.get("/quizzes", async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const data = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_ex",
      data: { json: "*", qu_refid: "*" }, cond: {},
    });

    if (!Array.isArray(data)) {
      res.json({ quizzes: [], total: 0, page, limit });
      return;
    }

    // Filter out exams with no questions
    const valid = (data as Record<string, unknown>[]).filter((row) => {
      const ids = (row.qu_refid as string[]) ?? [];
      return ids.length > 0;
    });

    // Sort by most recent (examno descending)
    const sorted = [...valid].sort((a, b) =>
      ((b.examno as number) ?? 0) - ((a.examno as number) ?? 0)
    );

    const total = sorted.length;
    const paged = sorted.slice((page - 1) * limit, page * limit);

    res.json({ quizzes: paged.map(parseExam), total, page, limit });
  } catch (err) {
    logger.error({ err }, "Failed to fetch quizzes");
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// GET /api/quiz/:examId — fetch exam with questions
router.get("/quiz/:examId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;

    const data = await crmQuery({
      fn: "common_fn", se: "fe", sch: "t_ex",
      data: { json: "*", qu_refid: "*" }, cond: { row_id: examId },
    });

    if (!Array.isArray(data) || data.length === 0) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    const exam = (data as Record<string, unknown>[])[0];
    const quRefids = (exam.qu_refid as string[]) ?? [];

    // Fetch up to 200 questions in batches of 50
    const MAX_QUESTIONS = 200;
    const BATCH_SIZE = 50;
    const questionIds = quRefids.slice(0, MAX_QUESTIONS);

    const batches: string[][] = [];
    for (let i = 0; i < questionIds.length; i += BATCH_SIZE) {
      batches.push(questionIds.slice(i, i + BATCH_SIZE));
    }

    const batchResults = await Promise.all(
      batches.map((batch) =>
        Promise.allSettled(
          batch.map((rowId) =>
            crmQuery({
              fn: "common_fn", se: "fe", sch: "t_qu",
              data: { json: "*" }, cond: { row_id: rowId },
            })
          )
        )
      )
    );

    const questions = batchResults
      .flat()
      .filter((r): r is PromiseFulfilledResult<unknown> => r.status === "fulfilled")
      .flatMap((r) => {
        const val = r.value;
        return Array.isArray(val) ? (val as Record<string, unknown>[]) : [];
      })
      .map(parseQuestion)
      .filter((q) => q.questionText.trim() !== "");

    res.json({ ...parseExam(exam), questions });
  } catch (err) {
    logger.error({ err }, "Failed to fetch quiz");
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

export default router;
