import type { DefaultTheme } from "vitepress";
import { githubSvg, linkSvg } from "../../assets/icons.ts";

// Avatars
import erhjiuAvatar from "./assets/erhjiu.jpg";
import feMmAvatar from "./assets/fe-mm.png";

export const friends: DefaultTheme.TeamMember[] = [
  {
    avatar: erhjiuAvatar,
    name: "Erhjiu",
    links: [{ icon: { svg: githubSvg }, link: "https://github.com/erhjiu" }],
  },
  {
    avatar: feMmAvatar,
    name: "茂茂物语",
    links: [{ icon: { svg: linkSvg }, link: "https://notes.fe-mm.com" }],
  },
];
