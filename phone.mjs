// Serves phone.html on the LAN so a phone browser can chat with the local
// Apollo agent (which must be running on 0.0.0.0:8787).
// Usage: bun phone.mjs
const page = await Bun.file(new URL('./phone.html', import.meta.url)).text();

Bun.serve({
  hostname: '0.0.0.0',
  port: 8788,
  fetch() {
    return new Response(page, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  },
});

console.log('phone chat page: http://0.0.0.0:8788 (open from your phone via this machine\'s LAN IP)');
