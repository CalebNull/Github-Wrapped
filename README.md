# GitHub Wrapped

A Spotify-Wrapped-style year in review for any GitHub account - commits, streaks, languages, and top repos, presented as a swipeable story you can share.

---

## What it does

Enter a GitHub username (or paste a profile URL) and get a recap of that user's last year:

- **Total contributions** - commits, pull requests, and reviews
- **Longest streak** and biggest single day
- **Busiest month**
- **Top languages** by commit volume
- **Most active repository**

The recap renders as a full-screen card story with keyboard, click, and swipe navigation.

## Roadmap

- [x] Data layer + landing flow
- [x] Swipeable card story
- [x] Language + weekday charts (Recharts)
- [x] Full-year contribution heatmap
- [ ] Dynamic Open Graph share image (`next/og`)
- [ ] "Developer persona" classifier
- [ ] Redis caching + per-IP rate limiting
- [x] Unit tests for `computeStats`

## Notes

- Uses **public data only**. Private contributions require an OAuth login flow, which isn't implemented yet.
- Commit-time-of-day stats (night owl vs. early bird) are approximate - the contribution calendar doesn't expose commit timestamps.
- A user with no activity in the target year gets an empty recap rather than an error.
