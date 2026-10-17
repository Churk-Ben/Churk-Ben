import type { NavData } from "./types";

export const NAV_DATA: NavData[] = [
  {
    title: "常用工具",
    items: [
      {
        icon: "/icons/nav/caniuse.com-favicon-128.png",
        title: "Can I use",
        desc: "前端 API 兼容性查询",
        link: "https://caniuse.com",
      },
      {
        icon: "/icons/nav/squoosh.app-logo.png",
        title: "Squoosh",
        desc: "基于浏览器的本地图片压缩工具（支持自定义参数和格式转换）",
        link: "https://squoosh.app",
      },
      {
        icon: "/icons/nav/tinypng.com-apple-touch-icon.png",
        title: "TinyPNG",
        desc: "在线图片压缩工具",
        link: "https://tinypng.com",
      },
      {
        title: "Carbon",
        desc: "代码图片生成",
        link: "https://carbon.now.sh",
      },
      {
        title: "npm trends",
        desc: "比较 npm package 的大小、下载数据、github 数据等",
        link: "https://npmtrends.com",
      },
      {
        icon: "/icons/nav/npm.devtool.tech-logo.png",
        title: "npm 库在线执行",
        desc: "在浏览器控制台中在线运行调试与测试 npm 中的库",
        link: "https://npm.devtool.tech",
      },
      {
        icon: "/icons/nav/devtool.tech-logo.png",
        title: "开发者武器库",
        desc: "开发者武器库，做开发者最专业最好用的专业工具箱",
        link: "https://devtool.tech",
      },
      {
        icon: "/icons/nav/tool.lu-favicon.ico",
        title: "在线工具",
        desc: "开发人员的工具箱",
        link: "https://tool.lu",
      },
      {
        title: "Json 中文网",
        desc: "JSON 在线解析及格式化验证",
        link: "https://www.json.cn",
      },
      {
        icon: "/icons/nav/transform.tools-favicon.png",
        title: "transform",
        desc: "一个支持多语言的在线转换器",
        link: "https://transform.tools/json-schema-to-typescript",
      },
      {
        title: "Excalidraw",
        desc: "手绘风格流程图",
        link: "https://excalidraw.com",
      },
      {
        icon: "/icons/nav/processon.com-favicon.ico",
        title: "ProcessOn",
        desc: "免费在线流程图思维导图",
        link: "https://www.processon.com",
      },
      {
        title: "Shields.io",
        desc: "制作简洁、一致、易读的徽章",
        link: "https://shields.io",
      },
      {
        title: "懒人 Excel",
        desc: "Excel 函数公式、操作技巧、数据分析、图表模板、VBA、数据透视表教程",
        link: "https://www.lanrenexcel.com",
      },
      {
        icon: "/icons/nav/wenshushu.cn-favicon.ico",
        title: "文叔叔",
        desc: "在线文件分享工具",
        link: "https://www.wenshushu.cn",
      },
    ],
  },
  {
    title: "高质量周刊与博客",
    items: [
      {
        badge: "周一更新",
        title: "Frontend Weekly",
        desc: "前端周刊",
        link: "https://frontender-ua.medium.com",
      },
      {
        badge: "周五更新",
        title: "科技爱好者周刊",
        desc: "阮一峰的科技爱好者周刊",
        link: "https://www.ruanyifeng.com/blog/archives.html",
      },
      {
        badge: "周五更新",
        icon: "/icons/nav/s0.ssl.qhres2.com-3444fd94a3c31e92.png",
        title: "奇舞周刊",
        desc: "领略前端技术 阅读奇舞周刊（360 前端团队）",
        link: "https://weekly.75.team",
      },
      {
        badge: "周一更新",
        icon: "/icons/nav/img.alicdn.com-O1CN01uKTVpD1UK8BCxFBwo__6000000002498-2-tps-500-500.webp",
        title: "MDH Weekly",
        desc: "云谦的前端周刊",
        link: "https://mdhweekly.com/weekly",
      },
      {
        badge: "每周更新",
        title: "前端食堂技术周刊",
        desc: "周周尝鲜，人工筛选前端圈每周最新资讯",
        link: "https://hungryturbo.zhubai.love",
        // link: 'https://github.com/Geekhyt/weekly'
      },
      {
        icon: "/icons/nav/overreacted.io-icon-96x96.png",
        title: "Overreacted",
        desc: "Dan Abramov 的个人博客",
        link: "https://overreacted.io/zh-hans",
      },
      {
        icon: "/icons/nav/xiaolincoding.com-logo.webp",
        title: "小林coding",
        desc: "小林 x 图解计算机基础（计算机网络、操作系统、计算机组成、数据库）",
        link: "https://xiaolincoding.com",
      },
      {
        icon: "/icons/nav/antfu.me-favicon.svg",
        title: "Blog - Anthony Fu",
        desc: "Vue, Vite, Nuxt 核心团队成员 | VueUse, Slidev, Vitest, UnoCSS 作者",
        link: "https://antfu.me/posts",
      },
      {
        icon: "/icons/nav/cdn.zhangxinxu.com-zxx_ico.png",
        title: "鑫空间-鑫生活",
        desc: "张鑫旭的个人博客",
        link: "https://www.zhangxinxu.com/wordpress",
      },
      {
        title: "前端精读周刊",
        desc: "帮你理解最前沿、实用的技术",
        link: "https://github.com/ascoders/weekly",
      },
      {
        title: "冴羽博客",
        desc: "四个系列：JavaScript深入系列、JavaScript专题系列、ES6系列、React系列",
        link: "https://github.com/mqyqingfeng/Blog",
      },
    ],
  },
  {
    title: "AI 导航",
    items: [
      {
        badge: "对话",
        title: "ChatGPT（最强）",
        link: "https://chat.openai.com/chat",
      },
      {
        badge: "对话",
        icon: "/icons/nav/kimi.moonshot.cn-favicon.ico",
        title: "Kimi.ai",
        desc: "超长文本对话",
        link: "https://kimi.moonshot.cn",
      },
      {
        badge: "对话",
        icon: "/icons/nav/chatglm.cn-favicon.png",
        title: "智谱清言",
        desc: "超长文本对话",
        link: "https://chatglm.cn",
      },
      {
        badge: "对话",
        icon: "/icons/nav/yiyan.baidu.com-favicon.ico",
        title: "文心一言",
        link: "https://yiyan.baidu.com",
      },
      {
        badge: "对话",
        title: "豆包",
        link: "https://www.doubao.com",
      },
      {
        badge: "对话",
        icon: "/icons/nav/tongyi.aliyun.com-favicon.png",
        title: "通义千问",
        link: "https://tongyi.aliyun.com",
      },
      {
        title: "ChatGPT 镜像站点列表",
        link: "https://github.com/xx025/carrot",
      },
      {
        badge: "笔记",
        icon: "/icons/nav/notion.so-logo-ios.png",
        title: "Notion AI",
        link: "https://www.notion.so",
      },
      {
        badge: "绘画",
        icon: "/icons/nav/midjourney.com-apple-touch-icon.png",
        title: "Midjourney",
        link: "https://www.midjourney.com",
      },
      {
        badge: "绘画",
        icon: "/icons/nav/stablediffusionweb.com-favicon.png",
        title: "Stable Diffusion",
        link: "https://stablediffusionweb.com",
      },
    ],
  },
  {
    title: "茂茂的站点导航",
    items: [
      {
        icon: "/icons/nav/fe-mm.png",
        title: "前端日常笔记",
        desc: "日常笔记记录（零零散散啥都记系列）",
        link: "https://github.com/maomao1996/daily-notes",
      },
      {
        icon: "/icons/nav/fe-mm.png",
        title: "前端思维导图",
        desc: "用思维导图的方式总结个人所学知识",
        link: "https://mindmap.fe-mm.com",
      },
      {
        icon: "/icons/nav/qwerty.fe-mm.com-apple-touch-icon.png",
        title: "Qwerty Learner",
        desc: "为键盘工作者设计的单词记忆与英语肌肉记忆锻炼软件",
        link: "https://qwerty.fe-mm.com",
      },
      {
        icon: "/icons/nav/fe-mm.png",
        title: "mmPlayer",
        desc: "mmPlayer 在线音乐播放器",
        link: "https://netease-music.fe-mm.com",
      },
    ],
  },
  {
    title: "React 生态",
    items: [
      {
        icon: "/icons/nav/zh-hans.reactjs.org-favicon.ico",
        title: "React",
        desc: "用于构建用户界面的 JavaScript 库",
        link: "https://zh-hans.reactjs.org",
      },
      {
        icon: "/icons/nav/reactrouter.com-favicon-light.png",
        title: "React Router",
        desc: "React 的声明式路由",
        link: "https://reactrouter.com",
      },
      {
        icon: "/icons/nav/nextjs.org-safari-pinned-tab.ico",
        title: "Next.js",
        desc: "一个用于 Web 的 React 框架",
        link: "https://nextjs.org",
      },
      {
        icon: "/icons/nav/img.alicdn.com-TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg",
        title: "UmiJS",
        desc: "插件化的企业级前端应用框架",
        link: "https://umijs.org",
      },
      {
        icon: "/icons/nav/gw.alipayobjects.com-rlpTLlbMzTNYuZGGCVYM.png",
        title: "Ant Design",
        desc: "一套企业级 UI 设计语言和 React 组件库",
        link: "https://ant.design",
      },
      {
        icon: "/icons/nav/gw.alipayobjects.com-69a27fcc-ce52-4f27-83f1-c44541e9b65d.svg",
        title: "Ant Design Mobile",
        desc: "构建移动 WEB 应用程序的 React 组件库",
        link: "https://mobile.ant.design",
      },
      {
        title: "Material UI",
        desc: "基于 Google Material Design 设计语言的 React 组件库",
        link: "https://mui.com",
      },
      {
        title: "Mantine UI",
        desc: "一套功能齐全的 React 组件库",
        link: "https://mantine.dev",
      },
      {
        icon: "/icons/nav/docs.pmnd.rs-apple-touch-icon.png",
        title: "Zustand",
        desc: "一个小型、快速、可扩展的 React 状态管理解决方案",
        link: "https://docs.pmnd.rs/zustand/getting-started/introduction",
      },
      {
        icon: "/icons/nav/valtio.pmnd.rs-favicon.ico",
        title: "Valtio",
        desc: "makes proxy-state simple for React and Vanilla",
        link: "https://valtio.pmnd.rs",
      },
      {
        icon: "/icons/nav/jotai.org-favicon.svg",
        title: "Jotai",
        desc: "primitive and flexible state management for React",
        link: "https://jotai.org",
      },
      {
        icon: "/icons/nav/cn.redux.js.org-redux.svg",
        title: "Redux",
        desc: "JavaScript 应用的状态容器，提供可预测的状态管理",
        link: "https://cn.redux.js.org",
      },
      {
        icon: "/icons/nav/zh.mobx.js.org-mobx.png",
        title: "MobX",
        desc: "一个小型、快速、可扩展的 React 状态管理解决方案",
        link: "https://zh.mobx.js.org",
      },
      {
        icon: "/icons/nav/ahooks.js.org-simple-logo.svg",
        title: "ahooks",
        desc: "一套高质量可靠的 React Hooks 库",
        link: "https://ahooks.js.org/zh-CN",
      },
    ],
  },
  {
    title: "Vue 生态",
    items: [
      {
        icon: "/icons/nav/cn.vuejs.org-logo.svg",
        title: "Vue 3",
        desc: "渐进式 JavaScript 框架",
        link: "https://cn.vuejs.org",
      },
      {
        icon: "/icons/nav/cn.vuejs.org-logo.svg",
        title: "Vue 2",
        desc: "渐进式 JavaScript 框架",
        link: "https://v2.cn.vuejs.org",
      },
      {
        icon: "/icons/nav/cn.vuejs.org-logo.svg",
        title: "Vue Router",
        desc: "Vue.js 的官方路由\n为 Vue.js 提供富有表现力、可配置的、方便的路由",
        link: "https://router.vuejs.org/zh",
      },
      {
        icon: "/icons/nav/pinia.vuejs.org-logo.jpg",
        title: "Pinia",
        desc: "符合直觉的 Vue.js 状态管理库",
        link: "https://pinia.vuejs.org/zh",
      },
      {
        icon: "/icons/nav/nuxt.com-icon.png",
        title: "Nuxt.js",
        desc: "一个基于 Vue.js 的通用应用框架",
        link: "https://nuxt.com",
      },
      {
        icon: "/icons/nav/vueuse.org-favicon.svg",
        title: "VueUse",
        desc: "Vue Composition API 的常用工具集",
        link: "https://vueuse.org",
      },
      {
        icon: "/icons/nav/element-plus.org-element-plus-logo-small.svg",
        title: "Element Plus",
        desc: "基于 Vue 3，面向设计师和开发者的组件库",
        link: "https://element-plus.org",
      },
      {
        icon: "/icons/nav/antdv.com-logo.1ef800a8.svg",
        title: "Ant Design Vue",
        desc: "Ant Design 的 Vue 实现，开发和服务于企业级后台产品",
        link: "https://antdv.com",
      },
      {
        icon: "/icons/nav/fastly.jsdelivr.net-logo.png",
        title: "Vant",
        desc: "轻量、可定制的移动端 Vue 组件库",
        link: "https://vant-ui.github.io/vant",
      },
      {
        icon: "/icons/nav/webapp.didistatic.com-Cube-UI_logo.ico",
        title: "Cube UI",
        desc: "基于 Vue.js 实现的精致移动端组件库",
        link: "https://didi.github.io/cube-ui",
      },
      {
        icon: "/icons/nav/img14.360buyimg.com-e09d8f9a8bf4c0ef.png",
        title: "NutUI",
        desc: "京东风格的轻量级移动端组件库",
        link: "https://nutui.jd.com",
      },
    ],
  },
  {
    title: "JavaScript 框架类库",
    items: [
      {
        icon: "/icons/nav/svelte.dev-svelte-logo-horizontal.svg",
        title: "Svelte",
        desc: "将声明性组件转换为精准高效更新 DOM 的 JavaScript 代码",
        link: "https://svelte.dev",
      },
      {
        // icon: 'https://simpleicons.org/icons/jquery.svg',
        title: "jQuery API 中文文档",
        desc: "一个兼容多浏览器的 JavaScript 框架",
        link: "https://jquery.cuishifeng.cn",
      },
    ],
  },
  {
    title: "CSS 相关",
    items: [
      {
        icon: "/icons/nav/postcss.org-logo-3e39b0aa.png",
        title: "PostCSS",
        desc: "一个用 JavaScript 转换 CSS 的工具",
        link: "https://postcss.org",
      },
      {
        title: "Sass",
        desc: "一个成熟，稳定，功能强大的专业级 CSS 扩展语言",
        link: "https://sass-lang.com",
      },
      {
        title: "TailwindCSS 中文网",
        desc: "一个功能类优先的 CSS 框架",
        link: "https://www.tailwindcss.cn",
      },
      {
        icon: "/icons/nav/unocss.dev-logo.svg",
        title: "UnoCSS",
        desc: "一个即时的原子化 CSS 引擎",
        link: "https://unocss.dev",
      },
      {
        title: "You-need-to-know-css",
        desc: "Web开发者应该掌握的CSS tricks",
        link: "https://lhammer.cn/You-need-to-know-css/#/zh-cn/",
      },
      {
        title: "CSS 常用样式",
        desc: "CSS 常用样式和奇技淫巧总结",
        link: "https://qishaoxuan.github.io/css_tricks/",
      },
      {
        title: "CSS 常见布局",
        desc: "CSS 各种常见的布局实现",
        link: "https://sweet-kk.github.io/css-layout/",
      },
      {
        title: "Houdini.how",
        desc: "CSS Houdini worklets 的社区驱动资源库",
        link: "https://houdini.how",
      },
    ],
  },
  {
    title: "小程序相关",
    items: [
      {
        icon: "/icons/nav/res.wx.qq.com-OTE0YTAw.png",
        title: "微信小程序文档",
        desc: "微信小程序官方开发者文档",
        link: "https://developers.weixin.qq.com/miniprogram/dev/framework/",
      },
      {
        title: "支付宝小程序文档",
        desc: "支付宝小程序官方开发者文档",
        link: "https://opendoc.alipay.com/mini/",
      },
    ],
  },
  {
    title: "跨平台",
    items: [
      {
        title: "Electron",
        desc: "使用 Web 技术构建跨平台桌面应用程序",
        link: "https://www.electronjs.org/zh/",
      },
      {
        title: "Tauri",
        desc: "使用 Web 技术构建更小、更快、更安全的桌面应用程序",
        link: "https://tauri.app/zh-cn/",
      },
      {
        title: "Taro",
        desc: "多端统一开发解决方案",
        link: "https://taro.jd.com",
      },
      {
        icon: "/icons/nav/web-assets.dcloud.net.cn-icon.png",
        title: "uni-app",
        desc: "一个使用 Vue.js 开发所有前端应用的框架",
        link: "https://uniapp.dcloud.net.cn",
      },
      {
        icon: "/icons/nav/mpxjs.cn-favicon.ico",
        title: "Mpx",
        desc: "增强型跨端小程序框架",
        link: "https://mpxjs.cn",
      },
      {
        title: "tmui",
        desc: "Uni App通用组件库跨端组件库",
        link: "https://tmui.design",
      },
    ],
  },
  {
    title: "Node 相关",
    items: [
      {
        title: "Node.js",
        desc: "Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境",
        link: "https://nodejs.org/zh-cn",
      },
      {
        icon: "/icons/nav/npmjs.com-favicon-32x32.png",
        title: "npm",
        desc: "JavaScript 的包管理和分发工具",
        link: "https://www.npmjs.com",
      },
      {
        title: "pnpm",
        desc: "快速的、节省磁盘空间的包管理工具",
        link: "https://pnpm.io",
      },
      {
        icon: "/icons/nav/expressjs.com-favicon.ico",
        title: "Express",
        desc: "基于 Node.js 平台，快速、开放、极简的 Web 开发框架",
        link: "https://expressjs.com",
      },
      {
        title: "Koa",
        desc: "基于 Node.js 平台的下一代 web 开发框架",
        link: "https://koajs.com",
      },
      {
        icon: "/icons/nav/eggjs.org-favicon.png",
        title: "Egg",
        desc: "为企业级框架和应用而生",
        link: "https://www.eggjs.org/zh-CN",
      },
      {
        icon: "/icons/nav/d33wubrfki0l68.cloudfront.net-logo-small.ede75a6b.svg",
        title: "Nest.js 中文文档",
        desc: "用于构建高效且可伸缩的服务端应用程序的渐进式 Node.js 框架",
        link: "https://docs.nestjs.cn",
      },
    ],
  },
  {
    title: "可视化",
    items: [
      {
        title: "ECharts",
        desc: "一个基于 JavaScript 的开源可视化图表库",
        link: "https://echarts.apache.org/zh/index.html",
      },
      {
        title: "AntV",
        desc: "蚂蚁集团全新一代数据可视化解决方案，致力于提供一套简单方便、专业可靠、无限可能的数据可视化最佳实践。",
        link: "https://antv.vision/zh/",
      },
      {
        icon: "/icons/nav/d3js.org-favicon.png",
        title: "D3.js",
        desc: "一个遵循 Web 标准用于可视化数据的 JavaScript 库",
        link: "https://d3js.org",
      },
      {
        icon: "/icons/nav/chartjs.org-favicon.ico",
        title: "Chart.js",
        desc: "一个简单而灵活的 JavaScript 图表库",
        link: "https://www.chartjs.org",
      },
      {
        icon: "/icons/nav/threejs.org-favicon.ico",
        // icon: 'https://threejs.org/files/favicon_white.ico',
        title: "Three.js",
        desc: "JavaScript 3d 库",
        link: "https://threejs.org",
      },
    ],
  },
  {
    title: "编译&构建&打包",
    items: [
      {
        icon: "/icons/nav/webpackjs.com-icon_180x180.png",
        title: "Webpack 中文网",
        desc: "一个用于现代 JavaScript 应用程序的静态模块打包工具",
        link: "https://www.webpackjs.com",
      },
      {
        icon: "/icons/nav/cn.vitejs.dev-logo.svg",
        title: "Vite 中文文档",
        desc: "下一代前端工具链",
        link: "https://cn.vitejs.dev",
      },
      {
        icon: "/icons/nav/rollupjs.com-favicon.png",
        title: "Rollup",
        desc: "Rollup 是一个 JavaScript 模块打包器",
        link: "https://www.rollupjs.com",
      },
      {
        icon: "/icons/nav/rspack.dev-favicon.png",
        title: "Rspack",
        desc: "基于 Rust 的高性能 Web 打包工具（使用兼容 API 无缝替换 webpack）",
        link: "https://rspack.dev",
      },
      {
        icon: "/icons/nav/turbo.build-apple-touch-icon.png",
        title: "Turbo",
        desc: "Turbo is an incremental bundler and build system optimized for JavaScript and TypeScript, written in Rust",
        link: "https://turbo.build",
      },
      {
        icon: "/icons/nav/babeljs.cn-favicon.png",
        title: "Babel",
        desc: "Babel 是一个 JavaScript 编译器",
        link: "https://www.babeljs.cn",
      },
      {
        icon: "/icons/nav/esbuild.github.io-favicon.svg",
        title: "esbuild",
        desc: "An extremely fast bundler for the web",
        link: "https://esbuild.github.io",
      },
      {
        icon: "/icons/nav/swc.rs-apple-touch-icon.png",
        title: "SWC",
        desc: "Rust-based platform for the Web",
        link: "https://swc.rs",
      },
    ],
  },
  {
    title: "图标库",
    items: [
      {
        icon: "/icons/nav/img.alicdn.com-O1CN01Z5paLz1O0zuCC7osS__6000000001644-55-tps-83-82.svg",
        title: "iconfont",
        desc: "国内功能很强大且图标内容很丰富的矢量图标库，提供矢量图标下载、在线存储、格式转换等功能",
        link: "https://www.iconfont.cn",
      },
      {
        icon: "/icons/nav/lf1-cdn2-tos.bytegoofy.com-logo.svg",
        title: "IconPark 图标库",
        desc: "IconPark图标库是一个通过技术驱动矢量图标样式的开源图标库，可以实现根据单一 SVG 源文件变换出多种主题， 具备丰富的分类、更轻量的代码和更灵活的使用场景；致力于构建高质量、统一化、可定义的图标资源，让大多数人都能够选择适合自己的风格图标",
        link: "https://iconpark.oceanengine.com/official",
      },
      {
        title: "Iconify",
        desc: "一个开源的图标集合和图标工具",
        link: "https://iconify.design",
      },
      {
        icon: "/icons/nav/icones.js.org-favicon.svg",
        title: "Icônes",
        desc: "基于 Iconify 的图标浏览器",
        link: "https://icones.js.org",
      },
      {
        title: "Simple Icons",
        desc: "包含 2457 种流行品牌的免费 SVG 图标库",
        link: "https://simpleicons.org",
      },
      {
        icon: "/icons/nav/icons.pqoqubbw.dev-favicon.png",
        title: "Animated icons",
        desc: "自带动画的 Icon 图标库",
        link: "https://icons.pqoqubbw.dev",
      },
      {
        icon: "/icons/nav/emoji.muan.co-appicon.webp",
        title: "Emoji searcher",
        desc: "emoji 表情大全",
        link: "https://emoji.muan.co",
      },
      {
        icon: "/icons/nav/webfx.com-favicon.webp",
        title: "Emoji Cheat Sheet",
        desc: "可以在 GitHub 中使用的 emoji 表情",
        link: "https://www.webfx.com/tools/emoji-cheat-sheet",
      },
      {
        icon: "/icons/nav/gitmoji.dev-apple-icon-144x144.png",
        title: "gitmoji",
        desc: "可以在 git 中使用的 emoji 表情",
        link: "https://gitmoji.dev",
      },
    ],
  },
  {
    title: "前端学习资料",
    items: [
      {
        icon: "/icons/nav/developer.mozilla.org-apple-touch-icon.6803c6f0.png",
        title: "MDN | Web 开发者指南",
        desc: "Mozilla 的开发者平台，提供了大量关于 HTML、CSS 和 JavaScript 的详细文档以及广泛的 Web API 参考资",
        link: "https://developer.mozilla.org/zh-CN",
      },
      {
        icon: "/icons/nav/static.runoob.com-favicon.png",
        title: "菜鸟教程",
        desc: "学的不仅是技术，更是梦想！",
        link: "https://www.runoob.com",
      },
      {
        title: "ES6 入门教程",
        desc: "阮一峰的网络日志",
        link: "http://es6.ruanyifeng.com",
      },
      {
        badge: "官网",
        icon: "/icons/nav/typescriptlang.org-icon-72x72.png",
        title: "TypeScript",
        desc: "TypeScript 是具有类型语法的 JavaScript",
        link: "https://www.typescriptlang.org/zh/",
      },
      {
        icon: "/icons/nav/typescriptlang.org-icon-72x72.png",
        title: "TypeScript 教程",
        desc: "阮一峰 TypeScript 开源教程，介绍基本概念和用法，面向初学者",
        link: "https://wangdoc.com/typescript",
      },
    ],
  },
  {
    title: "社区",
    items: [
      {
        title: "GitHub",
        icon: "/icons/nav/github.com-favicon.ico",
        desc: "一个面向开源及私有软件项目的托管平台",
        link: "https://github.com",
      },
      {
        icon: "/icons/nav/cdn.sstatic.net-apple-touch-icon.png",
        title: "Stack Overflow",
        desc: "全球最大的技术问答网站",
        link: "https://stackoverflow.com",
      },
      {
        title: "稀土掘金",
        icon: "/icons/nav/lf3-cdn-tos.bytescm.com-apple-touch-icon.png",
        desc: "面向全球中文开发者的技术内容分享与交流平台",
        link: "https://juejin.cn",
      },
      {
        title: "V2EX",
        icon: "/icons/nav/v2ex.com-icon-192.png",
        desc: "一个关于分享和探索的地方",
        link: "https://www.v2ex.com",
      },
      {
        title: "SegmentFault 思否",
        icon: "/icons/nav/static.segmentfault.com-touch-icon.ico",
        desc: "技术问答开发者社区",
        link: "https://segmentfault.com",
      },
      {
        title: "博客园",
        // icon: 'https://common.cnblogs.com/favicon.ico',
        desc: "博客园是一个面向开发者的知识分享社区",
        link: "https://www.cnblogs.com",
      },
      {
        title: "知乎",
        icon: "/icons/nav/static.zhihu.com-apple-touch-icon-60.362a8eac.png",
        desc: "中文互联网高质量的问答社区和创作者聚集的原创内容平台",
        link: "https://www.zhihu.com",
      },
    ],
  },
  {
    title: "摸鱼专用",
    items: [
      {
        icon: "/icons/nav/momoyu.cc-icon-192.png",
        title: "摸摸鱼热榜",
        // desc: '聚合每日热门、搞笑、有趣、适合摸鱼的资讯',
        link: "https://momoyu.cc",
      },
      {
        icon: "/icons/nav/v.qq.com-favicon.ico",
        title: "腾讯视频",
        // desc: '中国领先的在线视频媒体平台，海量高清视频在线观看',
        link: "https://v.qq.com",
      },
      {
        icon: "/icons/nav/static.hdslb.com-512.png",
        title: "哔哩哔哩",
        // desc: '',
        link: "https://www.bilibili.com",
      },
      {
        icon: "/icons/nav/youtube.com-favicon_48x48.png",
        title: "YouTube",
        // desc: '',
        link: "https://www.youtube.com",
      },
      {
        title: "Twitter",
        // desc: '',
        link: "https://twitter.com",
      },
      {
        title: "Pixiv",
        // desc: '',
        link: "https://www.pixiv.net",
      },
    ],
  },
];
