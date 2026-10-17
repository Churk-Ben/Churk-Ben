import type { Recommendation } from "./types.ts";
import homeData from "../../../../data/home.json" with { type: "json" };

/** 首页推荐阅读，维护在 data/home.json。 */
export const recommendations: Recommendation[] = homeData;
