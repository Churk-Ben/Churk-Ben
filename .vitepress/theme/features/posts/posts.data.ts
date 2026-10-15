import { loadPosts, postsPattern } from "../../../content/posts.mjs";
import type { Post } from "./posts";

export declare const data: Post[];

export default { watch: [postsPattern], load: loadPosts };
