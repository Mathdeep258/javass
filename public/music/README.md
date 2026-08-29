# Local Music

Put mp3 / lrc / cover files in this folder, then add records to `localMusic` in `siteConfig.ts`.

Note: files must be real playable audio. Do not rename NetEase `.ncm` files to `.mp3`; the browser cannot decode them.
Also avoid `;` or `,` in filenames; they can break media URLs. Use plain letters, spaces, `-` or `_`.

NetEase VIP downloads are usually `.ncm` encrypted files. Convert them first:

```bash
python scripts/ncm_to_mp3.py input.ncm
```

- Audio example: `/music/song.mp3`
- Lyrics example: `/music/song.lrc`
- Cover example: `/music/cover.png`
