# AI 抖音内容电商实战课程 Skills

课程固定版本：`2026-09-06-v1.0`

本仓库包含两套可安装到 Codex 的 Skill，用于课程现场演示和课后复用。

## 包含内容

### 1. 电商商品深度拆解与分析

路径：`skills/ecommerce-product-replication`

读取商品链接、页面截图、SKU、详情页、评价和其他商品资料，建立证据账本，完成竞品拆解、商品机会判断、内容承接分析与经营策略输出。

### 2. MiniMax 视频生成

路径：`skills/minimax-video-generation`

调用 MiniMax-H3 完成文生视频、首尾帧视频和多模态参考视频生成，下载 MP4，并保存任务记录。正式生成属于付费外部调用，必须先完成 Dry Run 并由使用者确认。

## 推荐安装方式

把下面这段话完整复制给 Codex：

```text
请使用 skill-installer，从当前 GitHub 仓库安装以下两个 Codex Skill：

1. skills/ecommerce-product-replication
2. skills/minimax-video-generation

安装到默认 Codex Skills 目录。如果存在同名 Skill，不要覆盖，先报告现有目录和版本。安装后检查两个目录均包含 SKILL.md，并检查 SKILL.md 引用的 scripts、references 和 assets 文件是否完整。本轮不要运行商品分析，不调用 MiniMax API，不产生付费任务。完成后告诉我两个 Skill 的安装路径，并提醒我在下一轮对话中进行调用验证。
```

也可以直接复制 [`01_安装提示词.txt`](./01_安装提示词.txt) 的完整内容，文件中已经写入本公开仓库地址。

## 安装后验收

1. 完成安装后，新开一轮 Codex 对话。
2. 复制 [`02_统一验收提示词.txt`](./02_统一验收提示词.txt) 的内容。
3. 商品 Skill 第一轮使用课程统一离线物料，避免平台登录状态不同。
4. 视频 Skill 先检查运行环境并执行 Dry Run，正式生成前必须二次确认。

## 安全边界

- 不覆盖本机已经存在的同名 Skill。
- 不在提示词、截图、PPT、代码或仓库中保存 API Key。
- MiniMax API Key 仅通过环境变量 `MINIMAX_API_KEY` 配置。
- 商品抓取结果受登录状态、页面权限和网络环境影响；证据不足时必须明确标注事实边界。
- 课程版本冻结后不直接修改；后续调整发布新版本和新标签。

版本说明见 [`03_课程版本说明.txt`](./03_课程版本说明.txt)。
