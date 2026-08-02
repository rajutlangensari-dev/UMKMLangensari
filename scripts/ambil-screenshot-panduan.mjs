/**
 * Mengambil tangkapan layar nyata untuk halaman /panduan dari server lokal.
 *
 * Jalankan `npm run build`, nyalakan hasil build dengan `npm start`, lalu:
 *   npm run screenshot:panduan
 *
 * Skrip hanya mengirim GET. Form tambah produk dibuka melalui klik di browser,
 * tetapi tidak pernah dikirim. Cookie sesi ditandatangani lokal dan tidak
 * membuat akun atau mengubah data.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ASAL = process.env.UJI_ASAL || 'http://localhost:3000';
const PORT_DEBUG = 9333;
const UKURAN = { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false };

if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(ASAL)) {
  console.error(`Menolak berjalan ke ${ASAL}. Skrip ini hanya untuk localhost.`);
  process.exit(1);
}

const berkasEnv = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(berkasEnv)) {
  console.error('.env.local tidak ditemukan.');
  process.exit(1);
}

for (const baris of fs.readFileSync(berkasEnv, 'utf8').split('\n')) {
  const cocok = baris.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (cocok) process.env[cocok[1]] = cocok[2].replace(/^["']|["']$/g, '');
}

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);
const chromePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));

if (!chromePath) {
  console.error('Chrome atau Edge tidak ditemukan. Atur CHROME_PATH lalu ulangi.');
  process.exit(1);
}

const { buatToken, NAMA_COOKIE } = await import('../lib/auth.ts');
const keluaran = path.join(process.cwd(), 'public', 'panduan');
fs.mkdirSync(keluaran, { recursive: true });

function token(peran, umkmId = '') {
  return buatToken({
    akunId: 'screenshot-panduan',
    namaPengguna: 'contoh-pemilik',
    peran,
    umkmId,
  });
}

async function cariUmkmId() {
  const res = await fetch(`${ASAL}/kelola/umkm`, {
    headers: { Cookie: `${NAMA_COOKIE}=${token('admin')}` },
  });
  if (!res.ok) throw new Error(`Daftar UMKM membalas status ${res.status}.`);

  const html = await res.text();
  return [...html.matchAll(/\/kelola\/umkm\/([a-zA-Z0-9_-]+)(?:["/])/g)]
    .map((cocok) => cocok[1])
    .find((id) => id !== 'baru');
}

function tunggu(ms) {
  return new Promise((selesai) => setTimeout(selesai, ms));
}

async function tungguJson(url, batasMs = 15000) {
  const mulai = Date.now();
  while (Date.now() - mulai < batasMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Chrome masih membuka port debug.
    }
    await tunggu(150);
  }
  throw new Error('Chrome tidak membuka port debug tepat waktu.');
}

async function hubungkanCdp(url) {
  const ws = new WebSocket(url);
  await new Promise((selesai, gagal) => {
    ws.addEventListener('open', selesai, { once: true });
    ws.addEventListener('error', gagal, { once: true });
  });

  let urutan = 0;
  const menunggu = new Map();
  ws.addEventListener('message', (event) => {
    const pesan = JSON.parse(String(event.data));
    if (!pesan.id || !menunggu.has(pesan.id)) return;
    const { selesai, gagal } = menunggu.get(pesan.id);
    menunggu.delete(pesan.id);
    if (pesan.error) gagal(new Error(pesan.error.message));
    else selesai(pesan.result);
  });

  return {
    ws,
    kirim(method, params = {}) {
      const id = ++urutan;
      return new Promise((selesai, gagal) => {
        menunggu.set(id, { selesai, gagal });
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

const profilChrome = fs.mkdtempSync(path.join(os.tmpdir(), 'panduan-umkm-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--hide-scrollbars',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT_DEBUG}`,
    `--user-data-dir=${profilChrome}`,
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true }
);

let cdp;

try {
  await tungguJson(`http://127.0.0.1:${PORT_DEBUG}/json/version`);
  const target = await fetch(
    `http://127.0.0.1:${PORT_DEBUG}/json/new?${encodeURIComponent(`${ASAL}/masuk`)}`,
    { method: 'PUT' }
  ).then((res) => res.json());
  cdp = await hubungkanCdp(target.webSocketDebuggerUrl);

  await cdp.kirim('Page.enable');
  await cdp.kirim('Network.enable');
  await cdp.kirim('Runtime.enable');
  await cdp.kirim('Emulation.setDeviceMetricsOverride', UKURAN);
  await cdp.kirim('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
  });

  async function buka(jalur, sesudahMuat) {
    await cdp.kirim('Page.navigate', { url: `${ASAL}${jalur}` });
    const pathTujuan = new URL(jalur, ASAL).pathname;
    const mulai = Date.now();
    while (Date.now() - mulai < 30000) {
      const hasil = await cdp.kirim('Runtime.evaluate', {
        expression: '({ siap: document.readyState, path: location.pathname })',
        returnByValue: true,
      });
      if (hasil.result.value?.siap === 'complete' && hasil.result.value?.path === pathTujuan) break;
      await tunggu(120);
    }
    await cdp.kirim('Runtime.evaluate', {
      expression: 'document.fonts.ready',
      awaitPromise: true,
      returnByValue: true,
    });
    await tunggu(800);
    if (sesudahMuat) {
      await cdp.kirim('Runtime.evaluate', {
        expression: `(${sesudahMuat.toString()})()`,
        awaitPromise: true,
        returnByValue: true,
      });
      await tunggu(450);
    }
  }

  async function simpan(nama) {
    const hasil = await cdp.kirim('Page.captureScreenshot', {
      format: 'webp',
      quality: 84,
      fromSurface: true,
      captureBeyondViewport: false,
    });
    fs.writeFileSync(path.join(keluaran, nama), Buffer.from(hasil.data, 'base64'));
    console.log(`  OK   ${nama}`);
  }

  console.log('Mengambil tangkapan layar panduan:');
  await buka('/masuk');
  await simpan('01-masuk.webp');

  const umkmId = await cariUmkmId();
  if (!umkmId) throw new Error('Belum ada UMKM yang dapat dipakai untuk tangkapan layar.');

  await cdp.kirim('Network.setCookie', {
    name: NAMA_COOKIE,
    value: token('umkm', umkmId),
    url: ASAL,
    httpOnly: true,
    sameSite: 'Lax',
  });

  await buka('/kelola');
  await simpan('02-dashboard.webp');

  await buka('/kelola/produk', () => {
    const tombol = [...document.querySelectorAll('button')].find(
      (el) => el.textContent?.trim() === 'Tambah produk'
    );
    tombol?.click();
  });
  await simpan('03-produk.webp');

  await buka('/kelola/profil', () => window.scrollTo(0, 420));
  await simpan('04-profil.webp');

  await buka('/kelola/halaman');
  await simpan('05-halaman.webp');

  await buka('/kelola/sandi');
  await simpan('06-sandi.webp');
} finally {
  if (cdp?.ws.readyState === WebSocket.OPEN) cdp.ws.close();
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
  } else {
    chrome.kill('SIGKILL');
  }
  await tunggu(350);
  fs.rmSync(profilChrome, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 });
}
