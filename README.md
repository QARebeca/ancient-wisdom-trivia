# Ancient Wisdom Trivia

A responsive, standalone trivia game with an ancient-mystical visual theme.

## Files
- `index.html` — page structure
- `styles.css` — design and responsive layout
- `questions.js` — editable question bank
- `app.js` — game logic, scoring, and local leaderboard

## Run locally
Open `index.html` in a modern browser. The Google Fonts connection is optional; the game works with fallback fonts if you are offline.

## Publish publicly with GitHub Pages
1. Sign in to GitHub and create a **new public repository**, for example `ancient-wisdom-trivia`.
2. Upload all four files (`index.html`, `styles.css`, `questions.js`, `app.js`) to the repository's root (the top level).
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then click **Save**.
6. Wait a minute or two. Refresh the Pages settings page; GitHub will show your public website URL, usually:
   `https://YOUR-USERNAME.github.io/ancient-wisdom-trivia/`
7. Open that URL to test the game. Share the URL with anyone you want to invite.

## Editing the questions
Open `questions.js`. Each question has:
- `category`: `Geography`, `Spirituality`, `History`, or `Science & Nature`
- `difficulty`: `Easy`, `Medium`, or `Hard`
- `question`: the prompt
- `answers`: exactly four choices
- `correct`: zero-based answer index (`0` is the first choice)
- `explanation`: the short learning note shown after answering

Keep the JavaScript array syntax and commas valid. The game automatically filters questions by selected category and level. If a selected combination has fewer questions than the chosen round size, it uses all available matching questions.

## Important notes
- The Hall of Wisdom leaderboard is stored in the visitor's browser (`localStorage`). It is **not a shared, global leaderboard** across visitors or devices.
- Anyone can view and play the public website. GitHub Pages hosts static files; it does not provide user accounts or a server-side score database.
- To create a truly shared leaderboard, player accounts, or an admin-managed question database, the app would need a backend service.
- This project uses no tracking or analytics code. Google Fonts are loaded from Google when internet access is available.
