import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Cloudflare API Helper
  const cfApi = axios.create({
    baseURL: "https://api.cloudflare.com/client/v4",
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  console.log("Server: Cloudflare API Token present:", !!process.env.CLOUDFLARE_API_TOKEN);

  const safeCreateRecord = async (zoneId: string, data: any) => {
    try {
      console.log(`Server: Creating DNS record for ${data.name} (${data.type})...`);
      const response = await cfApi.post(`/zones/${zoneId}/dns_records`, data);
      console.log(`Server: DNS record created successfully for ${data.name}`);
      return response;
    } catch (error: any) {
      const cfErrors = error.response?.data?.errors || [];
      const alreadyExists = cfErrors.some((e: any) => e.code === 81058);
      if (alreadyExists) {
        console.log(`Server: DNS Record already exists for ${data.name} (${data.type}), skipping...`);
        return { data: { success: true, result: "already_exists" } };
      }
      console.error(`Server: Cloudflare API Error for ${data.name}:`, error.response?.data || error.message);
      throw error;
    }
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // List Cloudflare Zones
  app.get("/api/cloudflare/zones", async (req, res) => {
    try {
      if (!process.env.CLOUDFLARE_API_TOKEN) {
        return res.status(400).json({ error: "CLOUDFLARE_API_TOKEN is not set" });
      }
      const response = await cfApi.get("/zones");
      res.json(response.data);
    } catch (error: any) {
      console.error("Cloudflare Zones Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || error.message });
    }
  });

  // Setup DNS for a Zone (MX and SPF)
  app.post("/api/cloudflare/setup-dns", async (req, res) => {
    const { zoneId, domainName } = req.body;
    if (!zoneId || !domainName) {
      return res.status(400).json({ error: "zoneId and domainName are required" });
    }

    try {
      if (!process.env.CLOUDFLARE_API_TOKEN) {
        return res.status(400).json({ error: "CLOUDFLARE_API_TOKEN is not set" });
      }

      // 1. Create MX record
      const mxRecord = await safeCreateRecord(zoneId, {
        type: "MX",
        name: "@",
        content: "mx.devmail.hub",
        priority: 10,
        ttl: 3600,
      });

      // 2. Create SPF record (TXT)
      const spfRecord = await safeCreateRecord(zoneId, {
        type: "TXT",
        name: "@",
        content: "v=spf1 include:spf.devmail.hub ~all",
        ttl: 3600,
      });

      res.json({
        success: true,
        records: [mxRecord.data, spfRecord.data],
      });
    } catch (error: any) {
      console.error("Cloudflare DNS Setup Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || error.message });
    }
  });

  // Verify DNS records for a zone
  app.get("/api/cloudflare/verify-dns/:zoneId", async (req, res) => {
    const { zoneId } = req.params;
    try {
      if (!process.env.CLOUDFLARE_API_TOKEN) {
        return res.status(400).json({ error: "CLOUDFLARE_API_TOKEN is not set" });
      }
      const response = await cfApi.get(`/zones/${zoneId}/dns_records`);
      const records = response.data.result;
      
      const mxRecord = records.find((r: any) => r.type === "MX" && r.content === "mx.devmail.hub");
      const spfRecord = records.find((r: any) => r.type === "TXT" && r.content.includes("v=spf1 include:spf.devmail.hub"));
      
      res.json({
        mxValid: !!mxRecord,
        spfValid: !!spfRecord,
      });
    } catch (error: any) {
      console.error("Cloudflare DNS Verify Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || error.message });
    }
  });

  // Create a subdomain (CNAME) for a zone
  app.post("/api/cloudflare/create-subdomain", async (req, res) => {
    const { zoneId, subdomain, target } = req.body;
    if (!zoneId || !subdomain || !target) {
      return res.status(400).json({ error: "zoneId, subdomain, and target are required" });
    }

    try {
      if (!process.env.CLOUDFLARE_API_TOKEN) {
        return res.status(400).json({ error: "CLOUDFLARE_API_TOKEN is not set" });
      }

      const response = await safeCreateRecord(zoneId, {
        type: "CNAME",
        name: subdomain,
        content: target,
        ttl: 3600,
        proxied: true,
      });

      res.json(response.data);
    } catch (error: any) {
      console.error("Cloudflare Subdomain Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || error.message });
    }
  });

  // Vite middleware for development
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

startServer();
