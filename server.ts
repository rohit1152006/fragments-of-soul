import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  // API - Live health check
  app.get("/api/health", (req, res) => {
    return res.json({ status: "healthy", database: "supabase-only" });
  });

  // Vite Assets Serving and Routing Rules
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
