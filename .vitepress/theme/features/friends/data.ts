import type { DefaultTheme } from "vitepress";
import { githubSvg, linkSvg } from "../../assets/icons.ts";
import erhjiuAvatar from "./assets/erhjiu.jpg";

export const friends: DefaultTheme.TeamMember[] = [
  {
    avatar: erhjiuAvatar,
    name: "Erhjiu",
    links: [
      { icon: { svg: linkSvg }, link: "https://erhjiu.com" },
      { icon: { svg: githubSvg }, link: "https://github.com/erhjiu" },
    ],
  },
  {
    avatar: "/img/fe-mm.png",
    name: "茂茂物语",
    links: [{ icon: { svg: linkSvg }, link: "https://notes.fe-mm.com" }],
  },
];
