#!/usr/bin/env node

import { promises as fs, createWriteStream } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const API_BASE = process.env.MINIMAX_API_HOST || 'https://api.minimaxi.com';
const CREATE_URL = `${API_BASE}/v2/video_generation`;
const LIMITS = { image: 30 * 1024 ** 2, video: 50 * 1024 ** 2, audio: 15 * 1024 ** 2 };
const RATIOS = new Set(['adaptive', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16']);
const TERMINAL = new Set(['succeeded', 'failed', 'cancelled', 'expired']);

function fail(message, code = 1) {
  console.error(`Error: ${message}`);
  process.exit(code);
}

function parseArgs(argv) {
  const result = { _: [] };
  const repeatable = new Set(['reference-image', 'reference-video', 'reference-audio']);
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      result._.push(token);
      continue;
    }
    const key = token.slice(2);
    if (['dry-run', 'watermark', 'no-download'].includes(key)) {
      result[key] = true;
      continue;
    }
    const value = argv[++i];
    if (value === undefined || value.startsWith('--')) fail(`--${key} requires a value.`);
    if (repeatable.has(key)) (result[key] ??= []).push(value);
    else result[key] = value;
  }
  return result;
}

function mimeFor(file, kind) {
  const ext = path.extname(file).toLowerCase();
  const maps = {
    image: { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.heic': 'image/heic', '.heif': 'image/heif' },
    video: { '.mp4': 'video/mp4', '.mov': 'video/quicktime' },
    audio: { '.wav': 'audio/wav', '.mp3': 'audio/mpeg' },
  };
  const mime = maps[kind][ext];
  if (!mime) fail(`Unsupported ${kind} file extension: ${ext || '(none)'}.`);
  return mime;
}

async function resolveMedia(input, kind) {
  if (/^(https?:\/\/|data:|mm_file:\/\/)/i.test(input)) return input;
  const file = path.resolve(input);
  const stat = await fs.stat(file).catch(() => null);
  if (!stat?.isFile()) fail(`Media file not found: ${file}`);
  if (stat.size > LIMITS[kind]) fail(`${kind} file exceeds ${LIMITS[kind] / 1024 ** 2} MB: ${file}`);
  const bytes = await fs.readFile(file);
  return `data:${mimeFor(file, kind)};base64,${bytes.toString('base64')}`;
}

function safePayload(payload) {
  const copy = structuredClone(payload);
  for (const item of copy.content || []) {
    const box = item.image_url || item.video_url || item.audio_url;
    if (box?.url?.startsWith('data:')) box.url = `[data-uri omitted; ${box.url.length} chars]`;
  }
  return copy;
}

async function apiJson(url, options = {}) {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) fail('MINIMAX_API_KEY is not set in this process.', 2);
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${key}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) {
    const detail = data?.error?.message || data?.base_resp?.status_msg || data?.raw || response.statusText;
    fail(`MiniMax API ${response.status}: ${detail}`, response.status === 401 ? 2 : 1);
  }
  return data;
}

async function buildPayload(args) {
  let prompt = args.prompt || '';
  if (args['prompt-file']) prompt = await fs.readFile(path.resolve(args['prompt-file']), 'utf8');
  if (!prompt.trim()) fail('Provide --prompt or --prompt-file.');
  if (prompt.length > 7000) fail('Prompt exceeds 7000 characters.');

  const duration = Number(args.duration ?? 5);
  if (!Number.isInteger(duration) || duration < 4 || duration > 15) fail('--duration must be an integer from 4 to 15.');
  const resolution = args.resolution ?? '2K';
  if (!['768P', '2K'].includes(resolution)) fail('--resolution must be 768P or 2K.');

  const frameInputs = [args['first-frame'], args['last-frame']].filter(Boolean);
  const refImages = args['reference-image'] ?? [];
  const refVideos = args['reference-video'] ?? [];
  const refAudios = args['reference-audio'] ?? [];
  if (frameInputs.length && (refImages.length || refVideos.length || refAudios.length)) fail('Frame inputs and reference inputs cannot be mixed.');
  if (refImages.length > 9 || refVideos.length > 3 || refAudios.length > 3) fail('Too many reference inputs.');
  if (refAudios.length && !refImages.length && !refVideos.length) fail('Reference audio requires a reference image or video.');

  const content = [{ type: 'text', text: prompt }];
  if (args['first-frame']) content.push({ type: 'image_url', image_url: { url: await resolveMedia(args['first-frame'], 'image') }, role: 'first_frame' });
  if (args['last-frame']) content.push({ type: 'image_url', image_url: { url: await resolveMedia(args['last-frame'], 'image') }, role: 'last_frame' });
  for (const input of refImages) content.push({ type: 'image_url', image_url: { url: await resolveMedia(input, 'image') }, role: 'reference_image' });
  for (const input of refVideos) content.push({ type: 'video_url', video_url: { url: await resolveMedia(input, 'video') }, role: 'reference_video' });
  for (const input of refAudios) content.push({ type: 'audio_url', audio_url: { url: await resolveMedia(input, 'audio') }, role: 'reference_audio' });

  const hasFrames = frameInputs.length > 0;
  const hasReferences = refImages.length + refVideos.length + refAudios.length > 0;
  const ratio = hasFrames ? 'adaptive' : (args.ratio ?? (hasReferences ? 'adaptive' : '16:9'));
  if (!RATIOS.has(ratio)) fail(`Unsupported ratio: ${ratio}`);
  if (!hasFrames && !hasReferences && ratio === 'adaptive') fail('Text-to-video requires a concrete ratio.');

  const payload = { model: 'MiniMax-H3', content, resolution, duration, ratio };
  if (args['callback-url']) payload.callback_url = args['callback-url'];
  if (args.watermark) payload.aigc_watermark = true;
  const bytes = Buffer.byteLength(JSON.stringify(payload));
  if (bytes > 64 * 1024 ** 2) fail(`Request body is ${(bytes / 1024 ** 2).toFixed(1)} MB; use public URLs.`);
  return payload;
}

async function queryTask(taskId) {
  return apiJson(`${API_BASE}/v2/query/video_generation/${encodeURIComponent(taskId)}`);
}

async function waitForTask(taskId, intervalSeconds, timeoutSeconds) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  let lastStatus;
  while (Date.now() < deadline) {
    const response = await queryTask(taskId);
    const task = response.task ?? response;
    const status = String(task.status || 'unknown').toLowerCase();
    if (status !== lastStatus) console.error(`Task ${taskId}: ${status}`);
    lastStatus = status;
    if (TERMINAL.has(status)) return task;
    await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
  }
  fail(`Timed out waiting for task ${taskId}. Resume with the query command.`);
}

async function download(url, output) {
  await fs.mkdir(path.dirname(output), { recursive: true });
  const response = await fetch(url);
  if (!response.ok || !response.body) fail(`Video download failed: HTTP ${response.status}`);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(output));
}

async function saveRecord(output, record) {
  const target = `${output}.json`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return target;
}

function defaultOutput() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.resolve('minimax-output', `minimax-${stamp}.mp4`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] ?? 'generate';
  const output = path.resolve(args.output ?? defaultOutput());
  const interval = Number(args['poll-interval'] ?? 10);
  const timeout = Number(args.timeout ?? 1800);
  if (!(interval > 0) || !(timeout > 0)) fail('Polling interval and timeout must be positive numbers.');

  let taskId = args['task-id'];
  let request;
  if (command === 'generate') {
    request = await buildPayload(args);
    if (args['dry-run']) {
      console.log(JSON.stringify({ create_url: CREATE_URL, output, request: safePayload(request) }, null, 2));
      return;
    }
    const created = await apiJson(CREATE_URL, { method: 'POST', body: JSON.stringify(request) });
    taskId = created.task_id;
    if (!taskId) fail(`Create response did not contain task_id: ${JSON.stringify(created)}`);
    console.error(`Created task: ${taskId}`);
  } else if (command === 'query') {
    if (!taskId) fail('query requires --task-id.');
  } else {
    fail(`Unknown command: ${command}`);
  }

  const task = await waitForTask(taskId, interval, timeout);
  const status = String(task.status || '').toLowerCase();
  const record = { task_id: taskId, status, output, request: request ? safePayload(request) : undefined, task };
  if (status !== 'succeeded') {
    await saveRecord(output, record);
    fail(`Task ended with status ${status}: ${task.error?.message || task.error?.code || 'no reason supplied'}`);
  }
  const videoUrl = task.content?.url;
  if (!videoUrl) fail('Succeeded task did not provide content.url.');
  if (!args['no-download']) await download(videoUrl, output);
  const recordPath = await saveRecord(output, record);
  console.log(JSON.stringify({ ok: true, task_id: taskId, status, output: args['no-download'] ? null : output, task_record: recordPath, video_url: videoUrl }, null, 2));
}

main().catch(error => fail(error?.message || String(error)));
