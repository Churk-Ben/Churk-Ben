import type { DefaultTheme } from "vitepress";
import { githubSvg, linkSvg } from "../../icons";
import erhjiuAvatar from "./erhjiu.jpg";

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
    avatar: "https://notes.fe-mm.com/logo.png",
    name: "茂茂物语",
    links: [{ icon: { svg: linkSvg }, link: "https://notes.fe-mm.com" }],
  },
];
