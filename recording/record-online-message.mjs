import { spawn } from 'node:child_process'
import { access, copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ffmpegPath from 'ffmpeg-static'
import { chromium, request } from 'playwright'

const recordingDirectory = path.dirname(fileURLToPath(import.meta.url))
const outputRoot = path.join(recordingDirectory, 'output')
const temporaryRoot = path.join(recordingDirectory, '.tmp')
const runId = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')
const runDirectory = path.join(outputRoot, `private-message-${runId}`)
const temporaryDirectory = path.join(temporaryRoot, runId)

const config = {
  siteUrl: trimTrailingSlash(process.env.RECORD_SITE_URL ?? 'https://ecocampus.teamdsb.online'),
  apiUrl: ensureTrailingSlash(process.env.RECORD_API_URL ?? 'https://ecocampus-api.teamdsb.online/api/v1'),
  conversationId: Number(process.env.RECORD_CONVERSATION_ID ?? '502'),
  senderAccount: process.env.RECORD_SENDER_ACCOUNT ?? '2292024000001',
  receiverAccount: process.env.RECORD_RECEIVER_ACCOUNT ?? '2292024000007',
  password: process.env.RECORD_DEMO_PASSWORD ?? 'demo-password',
  voice: process.env.RECORD_VOICE ?? 'Tingting',
  speechRate: Number(process.env.RECORD_SPEECH_RATE ?? '185'),
  narration: process.env.RECORD_NARRATION !== 'false',
  headless: process.env.RECORD_HEADLESS !== 'false',
  durationSeconds: 38,
}

const storyboard = [
  {
    startMs: 700,
    endMs: 7_800,
    shot: '双端建立镜头：左侧桌面端海风同学，右侧移动端李同学，同时进入线上高数教材会话。',
    narration: '左侧是桌面端海风同学，右侧是移动端李同学。两人已进入同一线上会话。',
  },
  {
    startMs: 8_500,
    endMs: 13_000,
    shot: '桌面端聚焦输入框，输入并发送询问教材与自提的消息。',
    narration: '桌面端现在发送一条关于高数教材的真实私信。',
  },
  {
    startMs: 13_400,
    endMs: 20_200,
    shot: '移动端保持聊天页面打开，等待轮询后自动出现桌面端的新消息。',
    narration: '消息写入线上服务后，移动端在轮询周期内自动收到，无需刷新页面。',
  },
  {
    startMs: 21_000,
    endMs: 27_200,
    shot: '移动端输入回复并发送，桌面端随后自动显示回复。',
    narration: '移动端回复自提时间，桌面端同样自动显示新消息。',
  },
  {
    startMs: 28_000,
    endMs: 36_500,
    shot: '双端同时停留在包含两条新消息的会话结尾，展示闭环结果。',
    narration: '这一段验证了不同用户之间的发送、接收、未读更新和聊天同步。',
  },
]

await main()

async function main() {
  validateConfig()
  await mkdir(runDirectory, { recursive: true })
  await rm(temporaryDirectory, { recursive: true, force: true })
  await mkdir(temporaryDirectory, { recursive: true })

  console.log('1/6 校验线上账号与会话…')
  const onlineSession = await prepareOnlineSession()
  console.log(`   会话 ${config.conversationId}：${onlineSession.sender.nickname} ↔ ${onlineSession.receiver.nickname}`)

  console.log('2/6 同时录制桌面端与移动端…')
  const rawVideos = await recordConversation(onlineSession)

  console.log('3/6 合成双端画面…')
  const silentVideoPath = path.join(runDirectory, 'private-message-online-silent.mp4')
  await composeSplitScreen(rawVideos, silentVideoPath)

  console.log('4/6 生成分镜、字幕与旁白文件…')
  await writeStoryboardFiles(onlineSession.metrics)
  const finalVideoPath = path.join(runDirectory, 'private-message-online.mp4')
  if (config.narration) {
    await generateNarration(silentVideoPath, finalVideoPath)
  } else {
    await copyFile(silentVideoPath, finalVideoPath)
  }

  console.log('5/6 生成预览图…')
  const previewPath = path.join(runDirectory, 'preview.jpg')
  await runCommand(ffmpegPath, [
    '-y',
    '-ss', '18',
    '-i', finalVideoPath,
    '-frames:v', '1',
    '-update', '1',
    '-q:v', '2',
    previewPath,
  ])

  await copyFile(finalVideoPath, path.join(outputRoot, 'private-message-online-latest.mp4'))
  await copyFile(previewPath, path.join(outputRoot, 'private-message-online-latest.jpg'))
  await rm(temporaryDirectory, { recursive: true, force: true })

  console.log('6/6 完成')
  console.log(`   成片：${finalVideoPath}`)
  console.log(`   预览：${previewPath}`)
  console.log(`   桌面到移动同步：${onlineSession.metrics.desktopToMobileMs} ms`)
  console.log(`   移动到桌面同步：${onlineSession.metrics.mobileToDesktopMs} ms`)
}

function validateConfig() {
  if (!Number.isInteger(config.conversationId) || config.conversationId < 1) {
    throw new Error('RECORD_CONVERSATION_ID 必须是正整数')
  }
  if (!Number.isFinite(config.speechRate) || config.speechRate < 80 || config.speechRate > 400) {
    throw new Error('RECORD_SPEECH_RATE 必须在 80 到 400 之间')
  }
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static 未提供当前平台可执行文件')
  }
}

async function prepareOnlineSession() {
  const api = await request.newContext({ extraHTTPHeaders: { 'Content-Type': 'application/json' } })

  try {
    const [sender, receiver] = await Promise.all([
      login(api, config.senderAccount),
      login(api, config.receiverAccount),
    ])

    if (sender.user.id === receiver.user.id) {
      throw new Error('发送方和接收方不能是同一个用户')
    }
    if (sender.user.verificationStatus !== 'VERIFIED' || receiver.user.verificationStatus !== 'VERIFIED') {
      throw new Error('两个录制账号都必须完成校园认证')
    }

    const [senderConversation, receiverConversation] = await Promise.all([
      findConversation(api, sender, receiver.user.id),
      findConversation(api, receiver, sender.user.id),
    ])

    if (senderConversation.itemId !== receiverConversation.itemId) {
      throw new Error('两个账号读取到的会话商品不一致')
    }
    await ensureMessageCapacity(api, sender)

    return {
      sender: { ...sender, nickname: receiverConversation.targetNickname },
      receiver: { ...receiver, nickname: senderConversation.targetNickname },
      itemTitle: senderConversation.itemTitle,
      metrics: { desktopToMobileMs: 0, mobileToDesktopMs: 0 },
    }
  } finally {
    await api.dispose()
  }
}

async function login(api, account) {
  const response = await api.post(apiEndpoint('auth/login'), {
    data: { account, password: config.password },
  })
  const payload = await response.json()

  if (!response.ok() || payload?.code !== 'OK' || !payload?.data?.accessToken) {
    throw new Error(`线上账号 ${maskAccount(account)} 登录失败：${payload?.message ?? response.status()}`)
  }

  return {
    account,
    accessToken: payload.data.accessToken,
    user: payload.data.user,
  }
}

async function findConversation(api, session, expectedTargetUserId) {
  const response = await api.get(apiEndpoint('conversations?page=1&size=100'), {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })
  const payload = await response.json()
  const conversation = payload?.data?.items?.find((item) => item.id === config.conversationId)

  if (!response.ok() || payload?.code !== 'OK' || !conversation) {
    throw new Error(`账号 ${maskAccount(session.account)} 无法读取会话 ${config.conversationId}`)
  }
  if (conversation.targetUserId !== expectedTargetUserId) {
    throw new Error(`会话 ${config.conversationId} 的对端用户与录制账号不匹配`)
  }

  return conversation
}

async function ensureMessageCapacity(api, session) {
  const response = await api.get(apiEndpoint(`conversations/${config.conversationId}/messages?page=1&size=1`), {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })
  const payload = await response.json()
  const total = payload?.data?.total

  if (!response.ok() || payload?.code !== 'OK' || !Number.isInteger(total)) {
    throw new Error(`无法确认会话 ${config.conversationId} 的消息数量`)
  }
  if (total >= 48) {
    throw new Error(`会话 ${config.conversationId} 已有 ${total} 条消息；请更换录制会话，避免超过页面当前 50 条加载上限`)
  }
}

async function recordConversation(session) {
  const browser = await chromium.launch({ headless: config.headless })
  const desktopRawDirectory = path.join(temporaryDirectory, 'desktop-video')
  const mobileRawDirectory = path.join(temporaryDirectory, 'mobile-video')
  await Promise.all([
    mkdir(desktopRawDirectory, { recursive: true }),
    mkdir(mobileRawDirectory, { recursive: true }),
  ])

  const [desktopContext, mobileContext] = await Promise.all([
    browser.newContext({
      viewport: { width: 1366, height: 768 },
      recordVideo: { dir: desktopRawDirectory, size: { width: 1366, height: 768 } },
      storageState: createStorageState(session.sender),
    }),
    browser.newContext({
      viewport: { width: 390, height: 844 },
      screen: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 Version/18.5 Mobile/15E148 Safari/604.1',
      recordVideo: { dir: mobileRawDirectory, size: { width: 390, height: 844 } },
      storageState: createStorageState(session.receiver),
    }),
  ])

  let desktopPage
  let mobilePage
  const recordingStartedAt = Date.now()

  try {
    ;[desktopPage, mobilePage] = await Promise.all([desktopContext.newPage(), mobileContext.newPage()])
    await Promise.all([
      showSlate(desktopPage, '桌面端 · 海风同学', session.itemTitle),
      showSlate(mobilePage, '移动端 · 李同学', session.itemTitle),
    ])

    await sleepUntil(recordingStartedAt, 2_200)
    const conversationUrl = `${config.siteUrl}/messages/${config.conversationId}?recording=${runId}`
    await Promise.all([
      desktopPage.goto(conversationUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 }),
      mobilePage.goto(conversationUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 }),
    ])
    await Promise.all([
      desktopPage.getByRole('heading', { name: '私信详情' }).waitFor({ timeout: 20_000 }),
      mobilePage.getByRole('heading', { name: '私信详情' }).waitFor({ timeout: 20_000 }),
    ])

    const desktopInput = desktopPage.getByLabel('输入消息')
    const mobileInput = mobilePage.getByLabel('输入消息')
    await Promise.all([desktopInput.scrollIntoViewIfNeeded(), mobileInput.scrollIntoViewIfNeeded()])

    const timeLabel = new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date())
    const desktopMessage = `【线上演示 ${timeLabel}】李同学，高数教材还在吗？`
    const mobileMessage = `【线上演示 ${timeLabel}】还在，明天下午嘉庚三楼大厅自提。`

    await sleepUntil(recordingStartedAt, 8_400)
    await desktopInput.pressSequentially(desktopMessage, { delay: 28 })
    await sleepUntil(recordingStartedAt, 11_200)
    const desktopSentAt = Date.now()
    await desktopPage.getByRole('button', { name: '发送' }).click()
    await messageBubble(desktopPage, desktopMessage).waitFor({ state: 'visible', timeout: 8_000 })

    await messageBubble(mobilePage, desktopMessage).waitFor({ state: 'visible', timeout: 10_000 })
    session.metrics.desktopToMobileMs = Date.now() - desktopSentAt

    await sleepUntil(recordingStartedAt, 20_500)
    await mobileInput.pressSequentially(mobileMessage, { delay: 28 })
    await sleepUntil(recordingStartedAt, 23_500)
    const mobileSentAt = Date.now()
    await mobilePage.getByRole('button', { name: '发送' }).click()
    await messageBubble(mobilePage, mobileMessage).waitFor({ state: 'visible', timeout: 8_000 })

    await messageBubble(desktopPage, mobileMessage).waitFor({ state: 'visible', timeout: 10_000 })
    session.metrics.mobileToDesktopMs = Date.now() - mobileSentAt
    await sleepUntil(recordingStartedAt, config.durationSeconds * 1_000)

    const desktopVideo = desktopPage.video()
    const mobileVideo = mobilePage.video()
    await Promise.all([desktopContext.close(), mobileContext.close()])

    const [desktopSource, mobileSource] = await Promise.all([
      desktopVideo.path(),
      mobileVideo.path(),
    ])
    const desktopPath = path.join(runDirectory, 'desktop.webm')
    const mobilePath = path.join(runDirectory, 'mobile.webm')
    await Promise.all([
      copyFile(desktopSource, desktopPath),
      copyFile(mobileSource, mobilePath),
    ])

    return { desktopPath, mobilePath }
  } catch (error) {
    await Promise.allSettled([desktopContext.close(), mobileContext.close()])
    throw error
  } finally {
    await browser.close()
  }
}

function createStorageState(session) {
  return {
    cookies: [],
    origins: [
      {
        origin: new URL(config.siteUrl).origin,
        localStorage: [
          {
            name: 'ecocampus.auth.real.v2',
            value: JSON.stringify({
              state: {
                accessToken: session.accessToken,
                role: session.user.role,
                verificationStatus: session.user.verificationStatus,
              },
              version: 0,
            }),
          },
        ],
      },
    ],
  }
}

async function showSlate(page, endpointLabel, itemTitle) {
  await page.setContent(`<!doctype html>
    <html lang="zh-CN">
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #edf7f2; color: #134e3a; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; }
        main { width: min(88vw, 720px); padding: 42px 28px; border: 2px solid #8ac9ae; border-radius: 24px; background: white; text-align: center; box-shadow: 0 18px 48px #0b55351f; }
        small { display: block; color: #07845b; font-size: 16px; font-weight: 700; letter-spacing: .08em; }
        h1 { margin: 18px 0 12px; font-size: clamp(28px, 5vw, 48px); }
        p { margin: 0; color: #577268; font-size: clamp(16px, 2.6vw, 22px); }
      </style>
      <body><main><small>线上真实私信同步</small><h1>${escapeHtml(endpointLabel)}</h1><p>${escapeHtml(itemTitle)}</p></main></body>
    </html>`)
}

function messageBubble(page, content) {
  return page.locator('.message-bubble-row p').filter({ hasText: content }).last()
}

async function composeSplitScreen(rawVideos, outputPath) {
  const fontPath = await findFont()
  const titleFilters = fontPath
    ? [
        `drawtext=fontfile='${escapeFilterValue(fontPath)}':text='线上私信 · 双账号同步验收':fontcolor=0x123f32:fontsize=42:x=(w-text_w)/2:y=48`,
        `drawtext=fontfile='${escapeFilterValue(fontPath)}':text='桌面端 · 海风同学':fontcolor=0x17664d:fontsize=25:x=80:y=126`,
        `drawtext=fontfile='${escapeFilterValue(fontPath)}':text='移动端 · 李同学':fontcolor=0x17664d:fontsize=25:x=1440:y=126`,
      ]
    : []
  const filter = [
    `[0:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=white,tpad=stop_mode=clone:stop_duration=${config.durationSeconds}[desktop]`,
    `[1:v]setpts=PTS-STARTPTS,scale=400:780:force_original_aspect_ratio=decrease,pad=400:780:(ow-iw)/2:(oh-ih)/2:color=white,tpad=stop_mode=clone:stop_duration=${config.durationSeconds}[mobile]`,
    `color=c=0xf3f8f5:s=1920x1080:d=${config.durationSeconds}[background]`,
    '[background][desktop]overlay=80:170[withdesktop]',
    '[withdesktop][mobile]overlay=1440:170[canvas]',
    titleFilters.length > 0 ? `[canvas]${titleFilters.join(',')}[video]` : '[canvas]null[video]',
  ].join(';')

  await runCommand(ffmpegPath, [
    '-y',
    '-i', rawVideos.desktopPath,
    '-i', rawVideos.mobilePath,
    '-filter_complex', filter,
    '-map', '[video]',
    '-an',
    '-r', '30',
    '-t', String(config.durationSeconds),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outputPath,
  ])
}

async function generateNarration(videoPath, outputPath) {
  const audioDirectory = path.join(temporaryDirectory, 'narration')
  await mkdir(audioDirectory, { recursive: true })
  const audioPaths = []

  for (const [index, scene] of storyboard.entries()) {
    const audioPath = path.join(audioDirectory, `scene-${index + 1}.aiff`)
    await runCommand('/usr/bin/say', [
      '-v', config.voice,
      '-r', String(config.speechRate),
      '-o', audioPath,
      scene.narration,
    ])
    audioPaths.push(audioPath)
  }

  const filterParts = [`anullsrc=r=48000:cl=stereo:d=${config.durationSeconds}[silence]`]
  const mixedInputs = ['[silence]']
  storyboard.forEach((scene, index) => {
    const inputIndex = index + 1
    filterParts.push(`[${inputIndex}:a]aresample=48000,adelay=${scene.startMs}|${scene.startMs}[voice${index}]`)
    mixedInputs.push(`[voice${index}]`)
  })
  filterParts.push(`${mixedInputs.join('')}amix=inputs=${mixedInputs.length}:duration=longest:normalize=0,apad=whole_dur=${config.durationSeconds}[audio]`)

  const args = ['-y', '-i', videoPath]
  for (const audioPath of audioPaths) {
    args.push('-i', audioPath)
  }
  args.push(
    '-filter_complex', filterParts.join(';'),
    '-map', '0:v:0',
    '-map', '[audio]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-t', String(config.durationSeconds),
    '-movflags', '+faststart',
    outputPath,
  )
  await runCommand(ffmpegPath, args)
}

async function writeStoryboardFiles(metrics) {
  const metadata = {
    generatedAt: new Date().toISOString(),
    mode: 'online-real-api',
    siteUrl: config.siteUrl,
    conversationId: config.conversationId,
    senderAccount: maskAccount(config.senderAccount),
    receiverAccount: maskAccount(config.receiverAccount),
    narrationVoice: config.narration ? config.voice : null,
    metrics,
    scenes: storyboard,
  }
  await writeFile(path.join(runDirectory, 'storyboard.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  await writeFile(path.join(runDirectory, 'narration.srt'), createSrt(storyboard))
}

function createSrt(scenes) {
  return `${scenes.map((scene, index) => [
    index + 1,
    `${formatSrtTime(scene.startMs)} --> ${formatSrtTime(scene.endMs)}`,
    scene.narration,
  ].join('\n')).join('\n\n')}\n`
}

function formatSrtTime(milliseconds) {
  const hours = Math.floor(milliseconds / 3_600_000)
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
  const seconds = Math.floor((milliseconds % 60_000) / 1_000)
  const ms = milliseconds % 1_000
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${String(ms).padStart(3, '0')}`
}

async function findFont() {
  const candidates = [
    '/System/Library/Fonts/PingFang.ttc',
    '/System/Library/Fonts/STHeiti Medium.ttc',
    '/Library/Fonts/Arial Unicode.ttf',
  ]
  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Try the next installed font.
    }
  }
  return undefined
}

async function sleepUntil(startedAt, targetMs) {
  const remaining = targetMs - (Date.now() - startedAt)
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining))
  }
}

async function runCommand(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${path.basename(command)} 退出码 ${code}`))
      }
    })
  })
}

function apiEndpoint(relativePath) {
  return new URL(relativePath, config.apiUrl).href
}

function maskAccount(account) {
  return account.length > 6 ? `${account.slice(0, 4)}****${account.slice(-3)}` : '****'
}

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`
}

function trimTrailingSlash(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function escapeFilterValue(value) {
  return value.replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'")
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function pad(value) {
  return String(value).padStart(2, '0')
}
