let failureRate = parseInt(process.env.CHAOS_FAIL_PERCENT || "0", 10);
export const chaos = {
    shouldFail() {
        return Math.random() * 100 < failureRate;
    },
    setFailureRate(p) {
        failureRate = Math.max(0, Math.min(100, p));
    },
    getFailureRate() {
        return failureRate;
    }
};
export function chaosMiddleware(req, res, next) {
    if (chaos.shouldFail()) {
        return res.status(503).json({ error: "Chaos induced failure" });
    }
    next();
}
