## 设计文档（design.md）

**技术架构**：
技术选择：
- 前端：HTML + Tailwind CSS (为了通过 Vibe Coding 快速搭建好看的 UI)
- 核心逻辑：Vanilla JavaScript + Chrome Extension Manifest V3
- 后台任务：Background Service Worker (负责监控标签页切换)
- 数据流：Chrome.storage.local API 持久化保存“像素小人”的等级和血条信息

页面结构：
- Popup 弹窗界面：显示像素小人动画、生命值/经验条、专注倒计时
- Options 设置页面：用户自定义需要“隔离”的黑名单网站（如B站、微博）、修改专注时长