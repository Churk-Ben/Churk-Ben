import type { DefaultTheme } from "vitepress";
import { githubSvg, linkSvg } from "../../assets/icons.ts";

export const friendLinks: DefaultTheme.TeamMember[] = [
  {
    avatar: "/links/erhjiu.jpg",
    name: "Erhjiu",
    links: [{ icon: { svg: githubSvg }, link: "https://github.com/erhjiu" }],
  },
  {
    avatar: "/links/fe-mm.png",
    name: "茂茂物语",
    links: [{ icon: { svg: linkSvg }, link: "https://notes.fe-mm.com" }],
  },
];
