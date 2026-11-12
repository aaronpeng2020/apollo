// Local dev chat client: simulates the ESP32 device over the Apollo protocol.
// Usage: bun chat.mjs   (agent must be running: cd apps/agent && bun run dev)
// Replies arrive as mock speech bytes (UTF-8 text) because ELEVENLABS_API_KEY
// is empty locally — see the fallback in apps/agent/src/agents/runtime.ts.
import readline from 'node:readline';

const serverBase = process.env.APOLLO_URL ?? 'ws://127.0.0.1:8787';
const token = process.env.APOLLO_TOKEN ?? 'dev-apollo-test';
const instance = process.env.APOLLO_INSTANCE ?? 'desk';

const url = `${serverBase}/agents/apollo/${instance}?token=${encodeURIComponent(token)}`;
const ws = new WebSocket(url);
ws.binaryType = 'arraybuffer';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const promptNext = () => rl.prompt();
rl.setPrompt('你> ');

let speechChunks = [];
let speechBytes = 0;

const pendingLines = [];

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'hello', deviceId: 'sim-desk', ts: Date.now() }));
  console.log('已连接 Apollo(输入内容回车发送,Ctrl+C 退出)');
  for (const text of pendingLines.splice(0)) {
    ws.send(JSON.stringify({ type: 'text_input', text, ts: Date.now() }));
  }
  promptNext();
};

ws.onmessage = (event) => {
  if (typeof event.data !== 'string') {
    speechChunks.push(new Uint8Array(event.data));
    speechBytes += event.data.byteLength ?? 0;
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(event.data);
  } catch {
    return;
  }
  if (parsed.type === 'ui_state' && parsed.state === 'thinking' && parsed.caption) {
    console.log(`  …${parsed.caption}`);
  } else if (parsed.type === 'timer' && parsed.durationSeconds) {
    console.log(`  ⏲ 计时器已设:${parsed.durationSeconds}s`);
  } else if (parsed.type === 'reminder') {
    console.log(`  🔔 提醒:${JSON.stringify(parsed).slice(0, 160)}`);
  } else if (parsed.type === 'error') {
    console.log(`  ✗ ${parsed.code}: ${parsed.message}`);
    promptNext();
  } else if (parsed.type === 'turn_end') {
    const merged = new Uint8Array(speechBytes);
    let offset = 0;
    for (const chunk of speechChunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    if (speechBytes > 0) {
      console.log(`Apollo> ${new TextDecoder().decode(merged)}`);
    }
    speechChunks = [];
    speechBytes = 0;
    promptNext();
  }
};

ws.onclose = () => {
  console.log('连接已断开');
  process.exit(0);
};

rl.on('line', (line) => {
  const text = line.trim();
  if (text.length === 0) {
    promptNext();
    return;
  }
  if (ws.readyState !== WebSocket.OPEN) {
    pendingLines.push(text);
    return;
  }
  ws.send(JSON.stringify({ type: 'text_input', text, ts: Date.now() }));
});

rl.on('SIGINT', () => {
  ws.close();
  process.exit(0);
});
