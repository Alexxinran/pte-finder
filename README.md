# PTE 分数查询工具 v2

> by Alexli — AI 实时查询版，直连官网数据，告别静态数据库！

## 升级亮点

v2 相比 v1 的核心变化：搜索不再依赖后台固定数据库，而是用户每次搜索时，AI（通义千问）实时联网查询目标院校官网，返回最新的 PTE 分数要求。

## 部署步骤（GitHub + Railway）

### 第一步：上传到 GitHub
把这个文件夹所有文件上传到你的 pte-finder 仓库（覆盖旧文件）

### 第二步：Railway 自动重新部署
推送后 Railway 会自动检测变化并重新部署

### 第三步：确认环境变量
Railway Variables 里确保有：
```
QWEN_API_KEY = 你的通义千问APIKey
```

## 本地运行
```bash
npm install
cp .env.example .env  # 填入 QWEN_API_KEY
npm start
# 访问 http://localhost:3000
```
