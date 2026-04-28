import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Mock "Real" Task Tracking
  // In a real app, this would connect to 3rd party APIs (Farcaster, DEXs, etc.)
  let taskLogs: any[] = [
    { id: 'initial-1', timestamp: new Date().toLocaleTimeString(), message: "System initialized. Waiting for production deployment.", type: 'system' }
  ];

  app.get("/api/tasks/logs", (req, res) => {
    res.json(taskLogs);
  });

  app.post("/api/tasks/simulate", (req, res) => {
    const { taskType } = req.body;
    const newMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      message: `Executing ${taskType} strategy... Connection established with Base mainnet endpoint.`,
      type: 'info'
    };
    taskLogs.push(newMessage);
    if (taskLogs.length > 50) taskLogs.shift();
    res.json(newMessage);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
