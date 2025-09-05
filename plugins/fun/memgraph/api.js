"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memgraphRouter = void 0;
const bigquery_1 = require("@google-cloud/bigquery");
const express_1 = require("express");
const bq = new bigquery_1.BigQuery();
exports.memgraphRouter = (0, express_1.Router)();
exports.memgraphRouter.get("/nodes", async (req, res) => {
    try {
        const table = process.env.BLACKWELL_EMB_TABLE || 'edenos_prod.blackwell_embeddings';
        const [rows] = await bq.query(`SELECT id, label, ts, emb FROM \`${table}\` LIMIT 2000`);
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
