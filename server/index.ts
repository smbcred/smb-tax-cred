import express from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { createServer, type Server } from "http";
import apiRoutes from "./routes";
import srcRoutes from "./src/routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Add request_id middleware
app.use((req, res, next) => {
  (req as any).request_id = crypto.randomUUID();
  next();
});

// Health endpoints
app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.get("/readyz", async (_req, res) => {
  // TODO: ping DB/Stripe if available; for now return ok:true
  res.json({ ok: true });
});

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
      const requestId = (req as any).request_id;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (requestId) {
        logLine += ` [${requestId}]`;
      }
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Mount auto-discovered routes
  app.use("/api", apiRoutes);
  app.use("/api", srcRoutes);
  
  const server = createServer(app);

  // Add global error handling
  const { createErrorHandler } = await import("./middleware/errorHandler");
  app.use(createErrorHandler());

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // QA finish-line manual acceptance checklist (gate behind env flag)
    if (process.env.NODE_ENV === "development" && process.env.SHOW_QA_CHECKLIST === "1") {
      console.log('\n=== QA FINISH-LINE CHECKLIST ===');
      console.table([
        { item:"Homepage CTA points to /calculator", pass:"TODO" },
        { item:"Calculator shows correct credit with 65% cap", pass:"TODO" },
        { item:"OBBBA expensing banner visible", pass:"TODO" },
        { item:"CTA redirects to Stripe Checkout (test)", pass:"TODO" },
        { item:"Post-payment lands on Dashboard", pass:"TODO" },
        { item:"Intake saves and restores on refresh", pass:"TODO" },
        { item:"Docs generate OR friendly error + retry", pass:"TODO" },
        { item:"Light mode only (no dark artifacts)", pass:"TODO" }
      ]);
      console.log('=== Manually verify each item and update pass status ===\n');
    }
  });
})();
