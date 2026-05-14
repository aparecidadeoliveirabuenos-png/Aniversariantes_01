import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Supabase Initialization
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// API Routes
app.get("/api/config", (req, res) => {
  res.json({
    supabaseConfigured: !!supabase,
  });
});

app.get("/api/birthdays", async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const { data, error } = await supabase
    .from("birthdays")
    .select("*")
    .order("date", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/birthdays", async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const { name, date, status } = req.body;
  const { data, error } = await supabase
    .from("birthdays")
    .insert([{ name, date, status: status || 'não iniciado' }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.patch("/api/birthdays/:id", async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const { id } = req.params;
  const updates = req.body;
  
  const { data, error } = await supabase
    .from("birthdays")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete("/api/birthdays/:id", async (req, res) => {
  if (!supabase) return res.status(503).json({ error: "Supabase not configured" });

  const { id } = req.params;
  const { error } = await supabase
    .from("birthdays")
    .delete()
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

async function start() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
