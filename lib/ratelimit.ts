import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 cubaan per minit per IP
  analytics: true,
});