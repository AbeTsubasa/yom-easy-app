import { defineConfig } from 'vite';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * Vite dev server (sirv) は public/dict/*.dat.gz を Content-Encoding: gzip で
 * 配信してしまい、ブラウザが自動解凍 → kuromoji は中身が「展開済み」になった
 * バイナリを pako.inflate しようとして無限待ちになる。
 *
 * Accept-Encoding を消すだけでは sirv の判定をすり抜けられないため、
 * dict ファイルだけは middleware が直接ファイルを read して返し、
 * 静的サーバには渡さない（= Content-Encoding が付かない）。
 *
 * 本番ビルドでは GitHub Pages 等の静的サーバが配信するので、この middleware は
 * dev 時のみ動けばよい。
 */
const serveDictRaw = {
  name: 'serve-dict-raw',
  configureServer(server: import('vite').ViteDevServer) {
    const dictDir = resolve(server.config.root, 'public/dict');
    const pathRegex = /\/dict\/([A-Za-z0-9_-]+\.dat\.gz)$/;
    server.middlewares.use(async (req, res, next) => {
      const url = req.url ?? '';
      const match = url.match(pathRegex);
      if (!match) {
        next();
        return;
      }
      try {
        const filePath = resolve(dictDir, match[1]);
        const data = await readFile(filePath);
        res.statusCode = 200;
        res.setHeader('content-type', 'application/octet-stream');
        res.setHeader('content-length', String(data.length));
        // 重要：Content-Encoding は付けない。ファイルは既に gzip だが
        // kuromoji 側で pako.inflate するので、ブラウザに解凍されると困る。
        res.end(data);
      } catch {
        next();
      }
    });
  },
};

export default defineConfig({
  base: '/yom-easy-app/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  server: {
    port: 5173,
    host: true,
  },
  plugins: [serveDictRaw],
});
