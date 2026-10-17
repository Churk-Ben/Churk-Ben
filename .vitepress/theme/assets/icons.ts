import { icon } from "@fortawesome/fontawesome-svg-core";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faAndroid,
  faApple,
  faBilibili,
  faCss3Alt,
  faDiscord,
  faGitee,
  faGithub,
  faHtml5,
  faJava,
  faJs,
  faLinux,
  faMastodon,
  faNodeJs,
  faNpm,
  faPython,
  faQq,
  faReact,
  faReddit,
  faSteam,
  faTelegram,
  faVuejs,
  faWeibo,
  faWeixin,
  faWindows,
  faXTwitter,
  faYoutube,
  faZhihu,
} from "@fortawesome/free-brands-svg-icons";
import {
  faBlog,
  faBook,
  faCode,
  faEnvelope,
  faGlobe,
  faHeart,
  faHome,
  faLink,
  faRss,
  faRocket,
  faStar,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

function toSvg(definition: IconDefinition) {
  return icon(definition).html.join("");
}

/* 社交与开发者平台 */
export const githubSvg = toSvg(faGithub);
export const bilibiliSvg = toSvg(faBilibili);
export const zhihuSvg = toSvg(faZhihu);
export const qqSvg = toSvg(faQq);
export const weixinSvg = toSvg(faWeixin);
export const weiboSvg = toSvg(faWeibo);
export const xSvg = toSvg(faXTwitter);
export const youtubeSvg = toSvg(faYoutube);
export const discordSvg = toSvg(faDiscord);
export const telegramSvg = toSvg(faTelegram);
export const giteeSvg = toSvg(faGitee);
export const steamSvg = toSvg(faSteam);
export const mastodonSvg = toSvg(faMastodon);
export const redditSvg = toSvg(faReddit);
export const npmSvg = toSvg(faNpm);
export const nodeSvg = toSvg(faNodeJs);
export const vueSvg = toSvg(faVuejs);
export const reactSvg = toSvg(faReact);
export const pythonSvg = toSvg(faPython);
export const javaSvg = toSvg(faJava);
export const linuxSvg = toSvg(faLinux);
export const appleSvg = toSvg(faApple);
export const windowsSvg = toSvg(faWindows);
export const androidSvg = toSvg(faAndroid);
export const html5Svg = toSvg(faHtml5);
export const css3Svg = toSvg(faCss3Alt);
export const javascriptSvg = toSvg(faJs);

/* 通用图标 */
export const linkSvg = toSvg(faLink);
export const globeSvg = toSvg(faGlobe);
export const rssSvg = toSvg(faRss);
export const mailSvg = toSvg(faEnvelope);
export const blogSvg = toSvg(faBlog);
export const bookSvg = toSvg(faBook);
export const codeSvg = toSvg(faCode);
export const starSvg = toSvg(faStar);
export const homeSvg = toSvg(faHome);
export const userSvg = toSvg(faUser);
export const heartSvg = toSvg(faHeart);
export const rocketSvg = toSvg(faRocket);

/** 数据文件（如 data/links.json）可用的图标名。 */
export const siteIcons = {
  github: githubSvg,
  bilibili: bilibiliSvg,
  zhihu: zhihuSvg,
  qq: qqSvg,
  weixin: weixinSvg,
  wechat: weixinSvg,
  weibo: weiboSvg,
  x: xSvg,
  twitter: xSvg,
  youtube: youtubeSvg,
  discord: discordSvg,
  telegram: telegramSvg,
  gitee: giteeSvg,
  steam: steamSvg,
  mastodon: mastodonSvg,
  reddit: redditSvg,
  npm: npmSvg,
  node: nodeSvg,
  vue: vueSvg,
  react: reactSvg,
  python: pythonSvg,
  java: javaSvg,
  linux: linuxSvg,
  apple: appleSvg,
  windows: windowsSvg,
  android: androidSvg,
  html5: html5Svg,
  css3: css3Svg,
  javascript: javascriptSvg,
  link: linkSvg,
  globe: globeSvg,
  website: globeSvg,
  rss: rssSvg,
  mail: mailSvg,
  email: mailSvg,
  blog: blogSvg,
  book: bookSvg,
  code: codeSvg,
  star: starSvg,
  home: homeSvg,
  user: userSvg,
  heart: heartSvg,
  rocket: rocketSvg,
} as const;

export type SiteIconName = keyof typeof siteIcons;

export const siteIconNames = Object.keys(siteIcons) as SiteIconName[];

export const defaultSiteIcon = linkSvg;

/** 按名称取图标，未知名称回退为通用链接图标。 */
export function resolveSiteIcon(name?: SiteIconName | string) {
  return name ? ((siteIcons as Record<string, string>)[name] ?? defaultSiteIcon) : defaultSiteIcon;
}
