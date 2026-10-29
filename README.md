# SUCCESS ACADEMY TECH: Setup (free plan, no Firebase Storage)

This version needs NO Firebase Storage and NO paid plan. Photos, screenshots and your resume are added as links instead of uploads. Firebase Authentication and Firestore stay on the free Spark plan. You do not need Node.js on your computer: Netlify builds the site for you.

## 1. Firebase
1. console.firebase.google.com > Create a project.
2. Build > Authentication > Get started > Email/Password > enable > Save.
3. Build > Firestore Database > Create database > production mode.
4. Gear > Project settings > scroll to Your apps > click `</>` > register a web app. Copy these FIVE values: apiKey, authDomain, projectId, messagingSenderId, appId.
5. Firestore > Rules: delete everything, paste the contents of `firestore.rules`, click Publish. (Skip Storage completely.)

## 2. First administrator
1. Authentication > Users > Add user: your email and a strong password. Copy the User UID.
2. Firestore > Data > Start collection > ID `admins` > Document ID = paste the UID > field `role`, string, `admin` > Save.

## 3. GitHub and Netlify
1. Unzip the project. On github.com create a repository and upload all the files (not the zip).
2. netlify.com > Add new site > Import from Git > choose the repository.
3. Environment variables, add five: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
4. Deploy. Copy your address (something.netlify.app).
5. Firebase > Authentication > Settings > Authorized domains > Add domain > paste the address without https://.
6. Replace YOUR-SITE in `public/sitemap.xml` and `public/robots.txt` with the address, commit, and Netlify redeploys.

## 4. Adding photos and your resume (links)
Photos and screenshots go on Cloudinary (free, no card). The resume PDF stays on Google Drive.

### Photos, thumbnails, screenshots: Cloudinary
1. Go to cloudinary.com and sign up for the Free plan (Google sign-in works).
2. Open Media Library > Upload and choose your picture.
3. Click the uploaded picture, then copy its URL (it starts with https://res.cloudinary.com/).
4. Paste it in /admin: Profile photo link (Homepage section), Thumbnail link, or Screenshot links (one per line).
5. Press Save homepage or Save project.

### Resume PDF: Google Drive
1. Upload the PDF to Google Drive.
2. Tap Share > General access > Anyone with the link > Copy link.
3. Paste it in /admin > Resume > Resume PDF link, then Save resume. The site converts the Drive link automatically.

### Check every link first
Open the link in your phone browser. If you only see the picture or PDF, it will work. If you see a login or access-denied page, the file is not public yet.

## Local testing (optional, needs Node.js LTS)
`npm install`, copy `.env.example` to `.env` and fill it in, then `npm run dev`.

Never commit your `.env` file. The Firebase values are public identifiers; the Firestore rules protect your data.
