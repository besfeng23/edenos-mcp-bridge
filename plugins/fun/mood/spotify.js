import fetch from "node-fetch";
import { Router } from "express";
export const moodRouter = Router();
async function token() {
    const r = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Authorization": "Basic " + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: process.env.SPOTIFY_REFRESH_TOKEN || ""
        })
    });
    return (await r.json()).access_token;
}
moodRouter.get("/now", async (_, res) => {
    try {
        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) {
            return res.json({ mood: "neutral" });
        }
        const t = await token();
        const r = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: `Bearer ${t}` }
        });
        const j = r.status === 204 ? {} : await r.json();
        const track = j.item?.name || "";
        const artists = (j.item?.artists || []).map((a) => a.name).join(", ");
        const mood = /synth|retro|wave/i.test(track + artists) ? "synth" :
            /bach|mozart|chopin|beethoven/i.test(track + artists) ? "classical" :
                "neutral";
        res.json({ track, artists, mood });
    }
    catch (e) {
        res.json({ mood: "neutral" });
    }
});
