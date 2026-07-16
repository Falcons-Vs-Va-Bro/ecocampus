import { spawn } from 'node:child_process'
import { access, copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import ffmpegPath from 'ffmpeg-static'
import { chromium, request } from 'playwright'

export const recordingRoot = path.resolve(import.meta.dirname, '..')
export const outputRoot = path.join(recordingRoot, 'output')
export const tempRoot = path.join(recordingRoot, '.tmp')
export const repoRoot = path.resolve(recordingRoot, '..')

export const config = {
  siteUrl: trimTrailingSlash(process.env.RECORD_SITE_URL ?? 'https://ecocampus.teamdsb.online'),
  apiUrl: ensureTrailingSlash(process.env.RECORD_API_URL ?? 'https://ecocampus-api.teamdsb.online/api/v1'),
  password: process.env.RECORD_DEMO_PASSWORD ?? 'demo-password',
  sellerAccount: process.env.RECORD_SELLER_ACCOUNT ?? '2292024000007',
  buyerAccount: process.env.RECORD_BUYER_ACCOUNT ?? '2292024000001',
  adminAccount: process.env.RECORD_ADMIN_ACCOUNT ?? '2292024000900',
  voice: process.env.RECORD_VOICE ?? 'Tingting',
  speechRate: Number(process.env.RECORD_SPEECH_RATE ?? '185'),
  narration: process.env.RECORD_NARRATION !== 'false',
  headless: process.env.RECORD_HEADLESS !== 'false',
}

export function runId() {
  return new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

export async function createRun(scenario) {
  const id = runId()
  const directory = path.join(outputRoot, `${scenario}-${id}`)
  const temporaryDirectory = path.join(tempRoot, `${scenario}-${id}`)
  await mkdir(directory, { recursive: true })
  await rm(temporaryDirectory, { recursive: true, force: true })
  await mkdir(temporaryDirectory, { recursive: true })
  return { id, scenario, directory, temporaryDirectory }
}

export async function openApi() {
  return request.newContext({ extraHTTPHeaders: { 'Content-Type': 'application/json' } })
}

export async function login(api, account, password = config.password) {
  let lastFailure = '未知错误'
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await api.post(apiEndpoint('auth/login'), { data: { account, password } })
    const payload = await readPayload(response)
    if (response.ok() && payload?.code === 'OK' && payload?.data?.accessToken) {
      return { account, accessToken: payload.data.accessToken, user: payload.data.user }
    }
    lastFailure = payload?.message ?? String(response.status())
    if (response.status() < 500 || attempt === 5) break
    await sleep(attempt * 1_200)
  }
  throw new Error(`账号 ${maskAccount(account)} 登录失败：${lastFailure}`)
}

export async function apiGet(api, session, relativePath) {
  return apiRequest(api, session, 'get', relativePath)
}

export async function apiPost(api, session, relativePath, data) {
  return apiRequest(api, session, 'post', relativePath, data)
}

export async function apiDelete(api, session, relativePath) {
  return apiRequest(api, session, 'delete', relativePath)
}

async function apiRequest(api, session, method, relativePath, data) {
  const response = await api[method](apiEndpoint(relativePath), {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    ...(data === undefined ? {} : { data }),
  })
  const payload = await readPayload(response)
  if (!response.ok() || payload?.code !== 'OK') {
    throw new Error(`${method.toUpperCase()} ${relativePath} 失败：${payload?.message ?? response.status()}`)
  }
  return payload.data
}

export function storageState(session) {
  return {
    cookies: [],
    origins: [{
      origin: new URL(config.siteUrl).origin,
      localStorage: [{
        name: 'ecocampus.auth.real.v2',
        value: JSON.stringify({
          state: {
            accessToken: session.accessToken,
            role: session.user.role,
            verificationStatus: session.user.verificationStatus,
          },
          version: 0,
        }),
      }],
    }],
  }
}

export async function launchRecordedContext(browser, run, name, kind, session) {
  const rawDirectory = path.join(run.temporaryDirectory, `${name}-video`)
  await mkdir(rawDirectory, { recursive: true })
  const mobile = kind === 'mobile'
  const viewport = mobile ? { width: 430, height: 932 } : { width: 1366, height: 768 }
  return browser.newContext({
    viewport,
    ...(mobile ? {
      screen: viewport,
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 Version/18.5 Mobile/15E148 Safari/604.1',
    } : {}),
    recordVideo: { dir: rawDirectory, size: viewport },
    ...(session ? { storageState: storageState(session) } : {}),
  })
}

export async function saveRecordedPage(page, context, run, name) {
  const video = page.video()
  await context.close()
  const source = await video.path()
  const target = path.join(run.directory, `${name}.webm`)
  await copyFile(source, target)
  return target
}

export async function showSlate(page, eyebrow, title, description) {
  await page.setContent(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#edf7f2;color:#134e3a;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}
    main{width:min(88vw,760px);padding:42px 28px;border:2px solid #8ac9ae;border-radius:24px;background:#fff;text-align:center;box-shadow:0 18px 48px #0b55351f}
    small{display:block;color:#07845b;font-size:16px;font-weight:700;letter-spacing:.08em}h1{margin:18px 0 12px;font-size:clamp(28px,5vw,48px)}p{margin:0;color:#577268;font-size:clamp(15px,2.6vw,21px);line-height:1.65}
  </style><body><main><small>${escapeHtml(eyebrow)}</small><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></main></body></html>`)
}

export async function finalizeSingle({ run, rawPath, durationSeconds, title, label, storyboard, metadata = {}, previewSecond = 15 }) {
  const silentPath = path.join(run.directory, `${run.scenario}-silent.mp4`)
  const finalPath = path.join(run.directory, `${run.scenario}.mp4`)
  const fontPath = await findFont()
  const draw = fontPath
    ? `,drawtext=fontfile='${escapeFilter(fontPath)}':text='${escapeFilter(title)}':fontcolor=0x123f32:fontsize=42:x=(w-text_w)/2:y=42,drawtext=fontfile='${escapeFilter(fontPath)}':text='${escapeFilter(label)}':fontcolor=0x17664d:fontsize=24:x=(w-text_w)/2:y=106`
    : ''
  await runCommand(ffmpegPath, [
    '-y', '-i', rawPath,
    '-vf', `scale=1440:810:force_original_aspect_ratio=decrease,pad=1440:810:(ow-iw)/2:(oh-ih)/2:color=white,pad=1920:1080:240:170:color=0xf3f8f5${draw}`,
    '-an', '-r', '30', '-t', String(durationSeconds), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silentPath,
  ])
  await finishMedia({ run, silentPath, finalPath, durationSeconds, storyboard, metadata, previewSecond })
  return finalPath
}

export async function finalizeSplit({ run, leftPath, rightPath, rightKind = 'mobile', durationSeconds, title, leftLabel, rightLabel, storyboard, metadata = {}, previewSecond = 18 }) {
  const silentPath = path.join(run.directory, `${run.scenario}-silent.mp4`)
  const finalPath = path.join(run.directory, `${run.scenario}.mp4`)
  const fontPath = await findFont()
  const rightSize = rightKind === 'mobile' ? { width: 400, height: 780, x: 1440 } : { width: 760, height: 720, x: 1080 }
  const leftSize = rightKind === 'mobile' ? { width: 1280, height: 720, x: 80 } : { width: 920, height: 720, x: 80 }
  const titleFilters = fontPath ? [
    `drawtext=fontfile='${escapeFilter(fontPath)}':text='${escapeFilter(title)}':fontcolor=0x123f32:fontsize=42:x=(w-text_w)/2:y=42`,
    `drawtext=fontfile='${escapeFilter(fontPath)}':text='${escapeFilter(leftLabel)}':fontcolor=0x17664d:fontsize=24:x=${leftSize.x}:y=118`,
    `drawtext=fontfile='${escapeFilter(fontPath)}':text='${escapeFilter(rightLabel)}':fontcolor=0x17664d:fontsize=24:x=${rightSize.x}:y=118`,
  ] : []
  const filter = [
    `[0:v]setpts=PTS-STARTPTS,scale=${leftSize.width}:${leftSize.height}:force_original_aspect_ratio=decrease,pad=${leftSize.width}:${leftSize.height}:(ow-iw)/2:(oh-ih)/2:color=white,tpad=stop_mode=clone:stop_duration=${durationSeconds}[left]`,
    `[1:v]setpts=PTS-STARTPTS,scale=${rightSize.width}:${rightSize.height}:force_original_aspect_ratio=decrease,pad=${rightSize.width}:${rightSize.height}:(ow-iw)/2:(oh-ih)/2:color=white,tpad=stop_mode=clone:stop_duration=${durationSeconds}[right]`,
    `color=c=0xf3f8f5:s=1920x1080:d=${durationSeconds}[background]`,
    `[background][left]overlay=${leftSize.x}:170[withleft]`,
    `[withleft][right]overlay=${rightSize.x}:170[canvas]`,
    titleFilters.length ? `[canvas]${titleFilters.join(',')}[video]` : '[canvas]null[video]',
  ].join(';')
  await runCommand(ffmpegPath, [
    '-y', '-i', leftPath, '-i', rightPath, '-filter_complex', filter, '-map', '[video]', '-an', '-r', '30', '-t', String(durationSeconds),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silentPath,
  ])
  await finishMedia({ run, silentPath, finalPath, durationSeconds, storyboard, metadata, previewSecond })
  return finalPath
}

async function finishMedia({ run, silentPath, finalPath, durationSeconds, storyboard, metadata, previewSecond }) {
  await writeFile(path.join(run.directory, 'storyboard.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(), mode: 'online-real-api', siteUrl: config.siteUrl, ...metadata, scenes: storyboard,
  }, null, 2)}\n`)
  await writeFile(path.join(run.directory, 'narration.srt'), createSrt(storyboard))
  if (config.narration) await addNarration(run, silentPath, finalPath, durationSeconds, storyboard)
  else await copyFile(silentPath, finalPath)
  const previewPath = path.join(run.directory, 'preview.jpg')
  await runCommand(ffmpegPath, ['-y', '-ss', String(previewSecond), '-i', finalPath, '-frames:v', '1', '-update', '1', '-q:v', '2', previewPath])
  await copyFile(finalPath, path.join(outputRoot, `${run.scenario}-latest.mp4`))
  await copyFile(previewPath, path.join(outputRoot, `${run.scenario}-latest.jpg`))
  await rm(run.temporaryDirectory, { recursive: true, force: true })
}

async function addNarration(run, videoPath, outputPath, durationSeconds, storyboard) {
  const audioDirectory = path.join(run.temporaryDirectory, 'narration')
  await mkdir(audioDirectory, { recursive: true })
  const inputs = []
  for (const [index, scene] of storyboard.entries()) {
    const audioPath = path.join(audioDirectory, `scene-${index + 1}.aiff`)
    await runCommand('/usr/bin/say', ['-v', config.voice, '-r', String(config.speechRate), '-o', audioPath, scene.narration])
    inputs.push(audioPath)
  }
  const filters = [`anullsrc=r=48000:cl=stereo:d=${durationSeconds}[silence]`]
  const mixes = ['[silence]']
  storyboard.forEach((scene, index) => {
    filters.push(`[${index + 1}:a]aresample=48000,adelay=${scene.startMs}|${scene.startMs}[voice${index}]`)
    mixes.push(`[voice${index}]`)
  })
  filters.push(`${mixes.join('')}amix=inputs=${mixes.length}:duration=longest:normalize=0,apad=whole_dur=${durationSeconds}[audio]`)
  const args = ['-y', '-i', videoPath]
  inputs.forEach((input) => args.push('-i', input))
  args.push('-filter_complex', filters.join(';'), '-map', '0:v:0', '-map', '[audio]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(durationSeconds), '-movflags', '+faststart', outputPath)
  await runCommand(ffmpegPath, args)
}

export function createSrt(scenes) {
  return `${scenes.map((scene, index) => `${index + 1}\n${formatSrt(scene.startMs)} --> ${formatSrt(scene.endMs)}\n${scene.narration}`).join('\n\n')}\n`
}

export async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sleepUntil(startedAt, targetMs) {
  const remaining = targetMs - (Date.now() - startedAt)
  if (remaining > 0) await sleep(remaining)
}

export async function runCommand(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${path.basename(command)} 退出码 ${code}`)))
  })
}

export function apiEndpoint(relativePath) {
  return new URL(relativePath, config.apiUrl).href
}

export function maskAccount(account) {
  return account.length <= 7 ? account : `${account.slice(0, 3)}****${account.slice(-4)}`
}

export function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

export { chromium }

async function readPayload(response) {
  try { return await response.json() } catch { return undefined }
}

function trimTrailingSlash(value) { return value.replace(/\/+$/, '') }
function ensureTrailingSlash(value) { return `${trimTrailingSlash(value)}/` }
function pad(value) { return String(value).padStart(2, '0') }
function formatSrt(ms) {
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1_000)
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${String(ms % 1_000).padStart(3, '0')}`
}
async function findFont() {
  for (const candidate of ['/System/Library/Fonts/PingFang.ttc', '/System/Library/Fonts/STHeiti Medium.ttc', '/Library/Fonts/Arial Unicode.ttf']) {
    try { await access(candidate); return candidate } catch { /* continue */ }
  }
  return undefined
}
function escapeFilter(value) { return String(value).replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'").replaceAll('%', '\\%') }
