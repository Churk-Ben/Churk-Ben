import { loadPosts, postsPattern } from "../../../content/posts.mjs";
import type { Post } from "./types.ts";

export declare const data: Post[];

export default { watch: [postsPattern], load: loadPosts };
