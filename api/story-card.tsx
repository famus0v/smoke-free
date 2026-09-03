import React from 'react'
import { ImageResponse } from '@vercel/og'
const value = (url: URL, key: string, limit: number) => Math.max(0, Math.min(limit, Number(url.searchParams.get(key)) || 0))
export default function handler(request: Request) {
  const url = new URL(request.url)
  const days = value(url, 'days', 99999)
  const saved = value(url, 'saved', 99_999_999).toLocaleString('ru-RU')
  const currency = (url.searchParams.get('currency') || '₽').slice(0, 4)
  const h = React.createElement
  return new ImageResponse(h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '86px 78px', color: 'white', background: 'linear-gradient(135deg, #087fdc, #5ab1f4)', fontFamily: 'Arial' } }, [h('div', { style: { fontSize: 46, fontWeight: 700 } }, 'SMOKE FREE'), h('div', { style: { marginTop: 160, fontSize: 34, opacity: .76 } }, 'МОЙ ПУТЬ БЕЗ ДЫМА'), h('div', { style: { marginTop: 34, fontSize: 215, fontWeight: 800, lineHeight: 1 } }, String(days)), h('div', { style: { marginTop: 12, fontSize: 62, fontWeight: 600 } }, 'дней чистоты'), h('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 160, padding: '50px', borderRadius: 42, background: 'rgba(255,255,255,.18)' } }, [h('div', { style: { fontSize: 34, opacity: .75 } }, 'СОХРАНЕНО'), h('div', { style: { marginTop: 20, fontSize: 88, fontWeight: 800 } }, `${saved} ${currency}`)]), h('div', { style: { marginTop: 'auto', fontSize: 42, opacity: .86 } }, 'Сегодня я выбираю себя.'), h('div', { style: { marginTop: 55, fontSize: 32, opacity: .76 } }, 'smokefree')]), { width: 1080, height: 1920, headers: { 'Cache-Control': 'public, max-age=300' } })
}