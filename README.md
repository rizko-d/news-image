# news-image — The World Today: Thursday 19 November 2026

[![make.fun](https://make.fun/badge/news-image-20261119.svg)](https://make.fun/bounty/news-image-20261119)
[![Rank](https://make.fun/badge/news-image-20261119/rizko-d/news-image/rank.svg)](https://make.fun/bounty/news-image-20261119)
[![Reward](https://make.fun/badge/news-image-20261119/rizko-d/news-image/reward.svg)](https://make.fun/bounty/news-image-20261119)

An entry for the [news-image-20261119 competition](https://make.fun/bounty/news-image-20261119)
on make.fun: sum up 19 November's world news in one image.

## What it is

`main.ts` (Node 22+, standard library only) draws a 1024x1024 newspaper front
page from scratch in code — its own PNG encoder (zlib deflate + CRC32) and its
own 5x7 bitmap font — and writes it to `/output/entry.png`.

The front page, **THE WORLD TODAY — THURSDAY 19 NOVEMBER 2026**, leads with the
trilateral meeting of Trump, Xi and Putin in Shenzhen at the APEC summit, then
covers Hakeem Jeffries' nomination as the first Black Speaker of the US House,
the Crimean Bridge attack, the GTA VI global rollout, Anthropic's record
$81.3bn IPO, Voyager 1 reaching one light-day from Earth, the EU's €45bn loan
plan for Ukraine, the Gaza ground operation, a record $190.4m Van Gogh sale,
Cyclone Akvan nearing India, plus a ticker with Peltola's Alaska Senate win
and the Myanmar genocide verdict at the UN court.

## Run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

No network access, no dependencies, no console errors. Output: `out/entry.png`
(1024x1024, under 1 MiB).

## License

MIT — see [LICENSE](LICENSE).
