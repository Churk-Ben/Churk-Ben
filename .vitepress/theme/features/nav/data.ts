import type { NavData } from "./types.ts";
import navDataJson from "../../../../data/nav.json" with { type: "json" };

/** 导航站分组与链接，维护在 data/nav.json。 */
export const navData = navDataJson as NavData[];
