# 🐆 James Franklin Smith (JFS) PTA Jog-a-Thon Leaderboard

A live, responsive donation leaderboard and event hub built specifically for the **James Franklin Smith Elementary PTA Jog-a-Thon** (running for three weeks with the culmination celebration on **Friday, Nov 13th**).

---

## 🌟 Key Features

1. **🏆 Overall Individual Leaderboard**:
   - Olympic-style podium for the Top 3 fundraisers (🥇 Gold, 🥈 Silver, 🥉 Bronze).
   - Real-time search by student name, teacher, or grade.
   - Filter by Grade (Kindergarten through 6th Grade) or Teacher.
   - Sort by Total Donations, Week 1, Week 2, Week 3, or Student Name.
   - **Student Privacy Mode Toggle**: easily switch between full name and *First Name + Last Initial* (e.g., "Maya S.") for school privacy / COPPA compliance.

2. **📅 Weekly Sprint Leaders (Weeks 1, 2, and 3)**:
   - Dedicated tab highlighting the weekly momentum.
   - Week 1 Kickoff, Week 2 Midpoint, and Week 3 Final Push views.
   - Spotlights the leading fundraiser for the active week and top weekly performers.

3. **🏫 Classroom & Teacher Competition**:
   - Class rankings showing which teacher's classroom is leading in total donations.
   - Average donation per student and participation count.
   - Grade-Level progress bars (Kindergarten to 6th Grade).

4. **💛 Official Donation Portal Integration**:
   - Direct high-visibility "Donate Now" buttons.
   - Embedded preview iframe with security fallback.
   - Quick "Copy Donation Link" button.
   - Corporate Employer Matching tip (Benevity, Apple, Google, Cisco, Intel, Adobe, etc.).
   - Configurable donation URL (customizable in the Admin Settings).

5. **📋 Event Details & Volunteer Hub**:
   - Embedded official **JFS PTA Jog-a-Thon flyer**.
   - Campaign schedule leading up to **Friday, Nov 13th**.
   - Direct button to the volunteer sign-up form (`https://forms.gle/8XA8oq5FmHDBwYHFA`).
   - Contact info for Fundraising Chair **Poonam Sidhu** (`poonam.jolly@gmail.com`).

6. **⚙️ Admin & Data Management**:
   - **CSV Upload**: Organizers can upload a new CSV each week to update all stats instantly.
   - **Template Download**: 1-click download of a pre-formatted CSV template.
   - **Data Export**: Export the live data back to CSV anytime.
   - **Google Sheets Live Sync**: Option to paste a Google Sheets "Published to web (CSV)" link for instant, zero-upload weekly updates.
   - **Local Storage Persistence**: All data is automatically preserved in the browser.

---

## 🚀 How to Deploy to Vercel

The project is pure modern HTML5, CSS3, and JavaScript with zero build dependencies, so it deploys on Vercel instantly.

### Option 1: Via GitHub (Recommended)
1. Create a repository on GitHub (e.g. `jfs-jogathon-leaderboard`).
2. Push this local directory to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/jfs-jogathon-leaderboard.git
   git branch -M main
   git push -u origin main
   ```
3. Go to [vercel.com/new](https://vercel.com/new), select your GitHub repository, and click **Deploy**.
4. Your site will be live on a `*.vercel.app` URL within 15 seconds!

### Option 2: Drag & Drop on Vercel
1. Log into your dashboard at [vercel.com](https://vercel.com).
2. Go to **Add New... &rarr; Project**.
3. Drag and drop this folder (`/Users/kiranjitsidhu/.gemini/antigravity/scratch/jfs-jogathon-leaderboard`) into the Vercel import box.
4. Click **Deploy**.

### Option 3: Via Vercel CLI
If you have Node/npm installed on your machine:
```bash
npx vercel
```
Follow the prompts to link and deploy.

---

## 📊 How to Update the Weekly Data

### Method A: Upload a CSV File (Easiest for Excel / Sheets users)
1. Click the **⚙️ Data & Settings** button in the header.
2. Click **📥 Download Sample CSV Template** to see the expected columns:
   ```csv
   Student Name,Grade,Teacher,Week 1,Week 2,Week 3,Laps Run
   Maya Sidhu,3,Mr. Davis,150,120,160,36
   Aarav Patel,4,Mrs. Anderson,130,140,125,34
   ```
3. Fill in your weekly numbers in Excel or Google Sheets, export as CSV, and drag-and-drop it into the upload box.
4. The entire leaderboard and class standings update immediately!

### Method B: Live Google Sheets Auto-Sync (Zero Uploads)
1. Keep your student master list in a Google Sheet.
2. In Google Sheets, click **File &rarr; Share &rarr; Publish to web**.
3. Select **Comma-separated values (.csv)** as the format and click **Publish**.
4. Copy the published link, open the **⚙️ Data & Settings** modal on the leaderboard website, paste the URL in the Google Sheets box, and click **Sync Now**.

---

## 🐾 School Theme
- **Mascot**: Jaguars
- **Primary Color**: JFS Royal Blue (`#0B4EA2`)
- **Accent Color**: Jaguar Athletic Gold (`#FFB800`)
- **Target Event Date**: Friday, November 13th
