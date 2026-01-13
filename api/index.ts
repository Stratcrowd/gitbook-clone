import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

const app = express();

// We create a dummy httpServer because registerRoutes expects it,
// though for Vercel serverless we don't listen on it.
const httpServer = createServer(app);

// Basic middleware matching server/index.ts
app.use(
    express.json({
        verify: (req: any, _res, buf) => {
            req.rawBody = buf;
        },
    })
);

app.use(express.urlencoded({ extended: false }));

// Logging middleware (optional but helpful)
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            console.log(logLine);
        }
    });

    next();
});

// Register routes (includes auth setup)
// We use an async wrapper to ensure initialization
let initialized = false;

const initPromise = (async () => {
    await registerRoutes(httpServer, app);

    // Error handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
    });

    initialized = true;
})();

// Vercel serverless handler adapter
export default async function handler(req: any, res: any) {
    if (!initialized) {
        await initPromise;
    }
    return app(req, res);
}
