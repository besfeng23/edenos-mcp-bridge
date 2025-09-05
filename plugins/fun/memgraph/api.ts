import { BigQuery } from "@google-cloud/bigquery";
import { Router } from "express";

const bq = new BigQuery();
export const memgraphRouter = Router();

memgraphRouter.get("/nodes", async (req, res) => {
  try {
    const table = process.env.BLACKWELL_EMB_TABLE || 'edenos_prod.blackwell_embeddings';
    const [rows] = await bq.query(`SELECT id, label, ts, emb FROM \`${table}\` LIMIT 2000`);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
