# bugAI - 《鞭打AI》网站

一个幽默、解压的互动平台，让用户以游戏化方式宣泄对AI的不满情绪，同时建立AI错误案例库和用户互助社区。

## 📋 项目简介

用户在与AI对话时常遇到AI重复犯错、逻辑混乱、答非所问等问题，产生强烈的挫败感。本项目旨在提供一个情绪出口，让用户通过虚拟互动释放压力，同时积累AI错误模式，形成有价值的学习资源。

### 核心价值
- **情绪价值**：为受挫AI用户提供情绪出口
- **娱乐价值**：游戏化互动体验，黑色幽默风格
- **实用价值**：积累AI错误模式，提供改进建议
- **社区价值**：形成用户共鸣，分享应对策略

## ✨ 功能特点

### 核心互动模块
- **3D鞭打互动系统**：可旋转、缩放的AI模型，根据击打显示不同表情和状态
- **武器库系统**：多种武器选择，每种武器有独特音效和视觉效果
- **物理反馈系统**：基于击打力度和部位的实时反馈
- **连击系统**：连续击打触发Combo，解锁特殊动画

### 错误案例提交系统
- 支持纯文本粘贴和截图上传（OCR自动识别）
- 主流AI身份选择和错误类型标签
- 智能高亮错误点和相似案例匹配

### 内容生成与分享
- 刑场证书生成器：个性化证书样式和动画效果
- 短视频自动生成：适配抖音、B站、微信等平台

### 社区与排行榜
- 实时排行榜系统：今日热门、经典罪案、神修正案例
- 案例详情页：完整对话展示、互动区和相关推荐

### 实用工具
- AI对话诊断器：自动分析对话质量和错误模式
- Prompt优化实验室：交互式优化提问方式

## 🛠 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **3D引擎**：Three.js + React Three Fiber
- **动画**：Framer Motion + GSAP
- **UI组件**：Ant Design / Tailwind CSS
- **状态管理**：Zustand
- **构建工具**：Vite

### 后端
- **框架**：Nest.js (Node.js)
- **数据库**：SQLite (开发环境) / PostgreSQL (生产环境)
- **API**：RESTful API
- **构建工具**：TypeScript + ts-node

## 📦 安装与运行

### 前置要求
- Node.js 16+ 
- npm 8+

### 安装步骤

1. **克隆仓库**
```bash
git clone <repository-url>
cd bugAI
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 运行项目

#### 开发环境

1. **启动后端服务**
```bash
cd backend
npm run start:dev
```
后端服务将运行在 `http://localhost:3000`

2. **启动前端开发服务器**
```bash
cd frontend
npm run dev
```
前端服务将运行在 `http://localhost:5173`

#### 生产环境

1. **构建前端**
```bash
cd frontend
npm run build
```

2. **启动后端生产服务**
```bash
cd backend
npm run build
npm run start:prod
```

## 📁 项目结构

```
bugAI/
├── backend/              # 后端代码
│   ├── src/              # 源代码
│   │   ├── modules/      # 功能模块
│   │   ├── app.module.ts # 应用模块
│   │   └── main.ts       # 入口文件
│   ├── .env              # 环境变量
│   └── package.json      # 依赖配置
├── frontend/             # 前端代码
│   ├── src/              # 源代码
│   │   ├── components/   # React组件
│   │   ├── store/        # 状态管理
│   │   ├── types/        # TypeScript类型定义
│   │   ├── App.tsx       # 应用组件
│   │   └── main.tsx      # 入口文件
│   └── package.json      # 依赖配置
├── PROJECT.MD            # 项目需求文档
└── README.md             # 项目说明文档
```

## 🚀 使用说明

1. **访问网站**
   打开浏览器访问 `http://localhost:5173`

2. **浏览AI错误案例**
   - 在首页查看热门案例
   - 使用搜索功能查找特定案例
   - 点击案例卡片查看详情

3. **鞭打AI**
   - 选择武器
   - 拖拽鼠标击打AI模型
   - 观察AI的反应和状态变化

4. **提交案例**
   - 点击"提交错误"按钮
   - 填写对话内容和错误类型
   - 上传截图（可选）
   - 提交案例

5. **生成证书和分享**
   - 在案例详情页点击"生成证书"
   - 选择证书样式
   - 保存或分享证书

## 🤝 贡献指南

欢迎大家参与项目贡献！

### 开发流程
1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用TypeScript进行开发
- 遵循ESLint和Prettier的代码风格
- 为新功能添加测试用例
- 更新文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📧 联系方式

如果您有任何问题或建议，请通过以下方式联系我们：

- 项目作者：[Your Name]
- 邮箱：[your.email@example.com]
- 项目地址：[GitHub Repository URL]

---

感谢使用 bugAI - 《鞭打AI》网站！希望它能为您带来乐趣和帮助！ 🎉