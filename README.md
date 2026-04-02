# PTE 分数查询工具

> by Alexli — 一站式 PTE 分数要求查询，覆盖英国、澳大利亚、新西兰、加拿大主流院校与移民项目。

---

## 部署步骤（GitHub + Railway）

### 第一步：上传到 GitHub
1. 在 GitHub 新建仓库（如 `pte-finder`）
2. 把这个文件夹里所有文件上传（`.env` 已被 `.gitignore` 排除，不会上传）

### 第二步：部署到 Railway
1. 登录 [railway.app](https://railway.app)
2. 点击 **New Project → Deploy from GitHub repo**
3. 选择刚上传的仓库，Railway 自动部署

### 第三步：配置 API Key
1. Railway 项目页面 → 点击服务 → **Variables** 标签
2. 添加环境变量：
   ```
   QWEN_API_KEY = 你的通义千问APIKey
   ```
3. Railway 自动重启，完成！

Railway 会给你一个公开网址如 `https://pte-finder-xxx.railway.app` 🎉

---

## 功能
- 场景选择：学习 Study / 工作 & 移民 Work / Immigration
- 国家筛选：英国、澳大利亚、新西兰、加拿大
- 院校搜索：中英文模糊匹配，找不到自动 AI 辅助
- 悬浮 AI 小助手：右下角机器人，点击展开聊天窗口

---

## 本地运行
```bash
npm install
cp .env.example .env   # 填入 QWEN_API_KEY
npm start
# 访问 http://localhost:3000
```
