# 机场node · jichangnode.wiki

包含29个品牌、150篇文章、27个专题、三份前十名单与11个本轮提供的优惠码。无需安装第三方依赖，使用Node.js 22或更高版本。

## 使用

运行 `npm run build` 生成完整静态网站，`npm run check` 检查内容、TDK、链接与品牌顺序，`npm start` 启动本地预览。输出目录是 `dist/`，可部署到支持静态网站的服务器。

## 修改资料

- `data/brands.json`：旧项目原始套餐底稿，不改变品牌ID。
- `scripts/build.mjs`：本轮品牌顺序、展示名称、推广链接和优惠码。
- `data/new-guides.mjs`：27篇新增指南。
- `data/articles.mjs` 及其引用文件：123篇继承的套餐研究与场景指南。
- `assets/site.css`：动画背景与响应式视觉。
- `assets/site.js`：搜索、筛选、对比、复制与动画暂停。
- `TDK清单.json`：所有页面标题、描述、关键词口径与canonical目录。

## GitHub与域名

目标仓库为 https://github.com/ksugiono187/jichangnode.git 。已提供GitHub Pages工作流。将源码提交至该仓库main分支后，在仓库Settings → Pages选择GitHub Actions。自定义域名填写jichangnode.wiki；DNS配置及域名验证按GitHub Pages当前控制台说明完成。`dist/CNAME` 已写入域名，但文件本身不会自动修改DNS。

## 编辑口径

机场推荐前十严格采用站长顺序。便宜榜比较可比的常规月付起价，排除争议与运营疑点。稳定严选前十是观察候选，未取得真实测试，不提供虚构稳定率或测速评分。套餐来自站长旧项目底稿，每行保留原始日期；本轮未完成当前结账验证。优惠码由站长提供，复制不等于验证有效。推广入口含归因参数，可能产生佣金。

站点已生成独立HTML文章、TDK、canonical、结构化数据、XML/HTML站点地图、RSS及robots.txt。搜索引擎收录和关键词排名需要网站公开上线后的真实抓取与内容质量评估，无法由代码保证。

## 专业版界面

专业版首页与内容增强由 scripts/professional.mjs 提供，编辑样式位于 assets/professional.css；独立指南案例位于 data/guide-cases.mjs。
