"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chaos = void 0;
exports.chaosMiddleware = chaosMiddleware;
let failureRate = parseInt(process.env.CHAOS_FAIL_PERCENT || "0", 10);
exports.chaos = {
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
function chaosMiddleware(req, res, next) {
    if (exports.chaos.shouldFail()) {
        return res.status(503).json({ error: "Chaos induced failure" });
    }
    next();
}
