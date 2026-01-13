
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./_lib/routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(express.json({
    verify: (req: any, _res, buf) => {
        req.rawBody = buf;
    },
}));

app.use(express.urlencoded({ extended: false }));

let initialized = false;
const initPromise = (async () => {
    await registerRoutes(httpServer, app);
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
    });
    initialized = true;
})();

export default async function handler(req: any, res: any) {
    if (!initialized) {
        await initPromise;
    }
    return app(req, res);
}
