---
name: minimax-video-generation
description: Generate and download videos through the MiniMax Video Generation V2 API using MiniMax-H3. Use when the user asks Codex to create text-to-video, first/last-frame image-to-video, or multimodal reference video from local files or URLs, monitor an asynchronous MiniMax task, or retrieve a generated MP4.
---

# MiniMax Video Generation

Use `scripts/minimax_video.mjs` for deterministic API calls. Read `references/api-notes.md` only when selecting media roles, diagnosing validation failures, or checking current limits.

## Workflow

1. Confirm the requested concept, duration, aspect ratio, and whether inputs are frames or references.
2. Check only whether `MINIMAX_API_KEY` exists. Never print, log, or persist the key.
3. Prefer `768P` for inexpensive exploration and `2K` for final output when the API account supports both.
4. Use frame mode when the user needs an exact opening or ending image. Use reference mode when preserving a product, character, motion, or audio reference matters. Never mix frame and reference roles.
5. Run the script. It creates the task, polls until terminal status, downloads the MP4, and writes a JSON task record beside it.
6. Inspect the downloaded video before delivery. Report model, duration, ratio, output path, and any limitations.

## Commands

Configure the API key on Windows without echoing it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\configure_key.ps1
```

Restart Codex after setting the user-level environment variable.

Text to video:

```powershell
node scripts/minimax_video.mjs generate --prompt "Product commercial..." --duration 5 --ratio 9:16 --resolution 768P --output output\video.mp4
```

First and last frame:

```powershell
node scripts/minimax_video.mjs generate --prompt "Camera slowly pushes in..." --first-frame start.png --last-frame end.png --duration 5 --output output\video.mp4
```

Reference mode:

```powershell
node scripts/minimax_video.mjs generate --prompt "Keep the product packaging unchanged..." --reference-image product.png --reference-video motion.mp4 --duration 5 --ratio 9:16 --output output\video.mp4
```

Resume an existing task:

```powershell
node scripts/minimax_video.mjs query --task-id TASK_ID --output output\video.mp4
```

Validate without spending money:

```powershell
node scripts/minimax_video.mjs generate --prompt "Test" --ratio 9:16 --dry-run
```

## Guardrails

- Treat every real generation as a paid external action. Confirm the final prompt and settings when the user has not already approved generation.
- Keep the API key in `MINIMAX_API_KEY`; do not place it in files, commands, screenshots, or chat.
- Local media is encoded as a data URI. Use a public HTTPS URL for large files or when the request would exceed 64 MB.
- Download successful results immediately because generated URLs can expire.
- For product advertising, avoid inventing packaging text, endorsements, efficacy claims, or product features. State preservation requirements explicitly in the prompt.
- If the API returns `401`, fix authentication. For `402`, check balance. For `422`, revise sensitive content. For `429`, retry later.
