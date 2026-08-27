import { NextResponse } from 'next/server'
import { siteConfig } from '../../../siteConfig'

export async function GET() {
  const playlist = ((siteConfig as any).localMusic || []).map(
    (song: any, index: number) => ({
      id: song.id || String(index + 1),
      title: song.title || '未知歌曲',
      artist: song.artist || '未知歌手',
      cover: song.cover || '/music/cover-placeholder.svg',
      src: song.src,
      lrc: song.lrc || '',
    })
  )

  return NextResponse.json(playlist)
}
