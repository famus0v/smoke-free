import { Resvg } from '@resvg/resvg-js'
import { fileURLToPath } from 'node:url'

const fontFile = fileURLToPath(new URL('./fonts/NotoSans-Variable.ttf', import.meta.url))

const number = (url, key, limit) => Math.max(0, Math.min(limit, Number(url.searchParams.get(key)) || 0))
const escapeXml = (text) => String(text).replace(/[&<>"']/g, (symbol) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[symbol]))

export default async function handler(request, response) {
  const url = new URL(request.url, `https://${request.headers.host || 'anti-smoke-nine.vercel.app'}`)
  const days = number(url, 'days', 99_999)
  const saved = number(url, 'saved', 99_999_999).toLocaleString('ru-RU')
  const currency = (url.searchParams.get('currency') || '₽').slice(0, 4)
  const width = 1080
  const height = 1920
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#087fdc"/><stop offset="1" stop-color="#5ab1f4"/></linearGradient></defs>
    <rect width="1080" height="1920" fill="url(#bg)"/>
    <circle cx="965" cy="1645" r="340" fill="#fff" fill-opacity=".08"/>
    <text x="78" y="130" fill="#fff" font-family="Noto Sans, sans-serif" font-size="46" font-weight="700">SMOKE FREE</text>
    <text x="78" y="405" fill="#fff" fill-opacity=".76" font-family="Noto Sans, sans-serif" font-size="34" font-weight="700">МОЙ ПУТЬ БЕЗ ДЫМА</text>
    <text x="78" y="655" fill="#fff" font-family="Noto Sans, sans-serif" font-size="215" font-weight="800">${days}</text>
    <text x="78" y="750" fill="#fff" font-family="Noto Sans, sans-serif" font-size="62" font-weight="600">дней чистоты</text>
    <rect x="78" y="950" width="924" height="292" rx="42" fill="#fff" fill-opacity=".18"/>
    <text x="128" y="1040" fill="#fff" fill-opacity=".75" font-family="Noto Sans, sans-serif" font-size="34" font-weight="700">СОХРАНЕНО</text>
    <text x="128" y="1165" fill="#fff" font-family="Noto Sans, sans-serif" font-size="88" font-weight="800">${escapeXml(saved)} ${escapeXml(currency)}</text>
    <text x="78" y="1690" fill="#fff" fill-opacity=".86" font-family="Noto Sans, sans-serif" font-size="42" font-weight="600">Сегодня я выбираю себя.</text>
    <text x="78" y="1775" fill="#fff" fill-opacity=".76" font-family="Noto Sans, sans-serif" font-size="32">smokefree</text>
  </svg>`
  const image = new Resvg(svg, {
    font: { fontFiles: [fontFile], loadSystemFonts: false },
  }).render().asPng()
  response.setHeader('Content-Type', 'image/png')
  response.setHeader('Cache-Control', 'public, max-age=300')
  response.status(200).send(image)
}