# Majlis Haji Ebrahim Aldaqaq - Quran Majlis Tracker & Scheduler

A production-ready web application for tracking and scheduling Ramadan Quran Majlis readings.

## 🌙 Features

### Primary Features (Priority Order)
1. **Calendar Tracking & Scheduling** - Full Ramadan calendar with daily Surah schedules
2. **Majlis Progress Tracking** - Track current reading, Juz, and completion percentage
3. **Manual Surah Switching** - Controllers can update current reading in real-time
4. **Role-based Access Control** - Different roles with specific permissions

### Secondary Feature
5. **Radio Streaming** - Optional live audio streaming integration (Icecast)

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** MongoDB Atlas
- **ORM:** Prisma
- **Authentication:** Better Auth
- **Sessions:** Cookie-based with JWT
- **Deployment:** Vercel

## 📁 Project Structure

```
majlis/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/
│   │   ├── schedules/
│   │   ├── status/
│   │   └── users/
│   ├── calendar/
│   ├── dashboard/
│   │   ├── admin/
│   │   ├── controller/
│   │   └── majlis/
│   ├── login/
│   ├── logout/
│   ├── progress/
│   ├── radio/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CalendarDay.tsx
│   ├── CalendarGrid.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── LiveIndicator.tsx
│   ├── ProgressBar.tsx
│   ├── RadioPlayer.tsx
│   ├── ScheduleBox.tsx
│   ├── SurahDisplay.tsx
│   └── WindowBox.tsx
├── lib/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── auth-server.ts
│   ├── date-utils.ts
│   ├── prisma.ts
│   └── surah-data.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
```

## 🚀 Deployment Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Vercel account

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a free account or sign in

2. **Create a New Cluster**
   - Click "Build a Database"
   - Select "M0 FREE" tier
   - Choose your preferred region
   - Click "Create"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Vercel deployment)
   - Or add specific IPs for more security

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `majlis`

   Example:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/majlis?retryWrites=true&w=majority
   ```

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd majlis
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/majlis?retryWrites=true&w=majority"
   BETTER_AUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

   Generate BETTER_AUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

3. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed Database**
   ```bash
   npm run db:seed
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `DATABASE_URL` - Your MongoDB connection string
     - `BETTER_AUTH_SECRET` - Your generated secret
     - `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL (e.g., https://majlis.vercel.app)

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

4. **Seed Production Database**
   After deployment, seed the database using Vercel CLI or by temporarily adding a seed endpoint.

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| USER | View calendar, progress, and radio (public) |
| MAJLIS_CONTROLLER | Create/edit schedules, update progress |
| MAJLIS | Update radio stream URL, toggle live status |
| ADMIN | Full access, manage users |
| CUSTOM_ROLE | Configurable permissions |

## 🔐 Default Credentials

After seeding:

| Email | Password | Role |
|-------|----------|------|
| admin@majlis.local | admin123 | ADMIN |
| controller@majlis.local | controller123 | MAJLIS_CONTROLLER |
| majlis@majlis.local | majlis123 | MAJLIS |

**⚠️ Change these passwords immediately in production!**

## 📻 Icecast Setup (Optional)

### Installing Icecast

1. **Ubuntu/Debian:**
   ```bash
   sudo apt-get install icecast2
   ```

2. **Configure Icecast:**
   Edit `/etc/icecast2/icecast.xml`:
   ```xml
   <source-password>your-source-password</source-password>
   <admin-password>your-admin-password</admin-password>
   ```

3. **Start Icecast:**
   ```bash
   sudo systemctl start icecast2
   ```

### Broadcasting with BUTT

1. Download [BUTT](https://danielnoethen.de/butt/)
2. Configure server settings:
   - Server: your-server-ip
   - Port: 8000
   - Password: your-source-password
   - Mount: /stream
3. Click "Play" to start streaming

### Updating Stream URL

1. Login as MAJLIS or ADMIN
2. Go to Dashboard → Radio Management
3. Enter stream URL: `http://your-server:8000/stream`
4. Toggle "Go LIVE" when broadcasting

## 🎨 UI Design

The application uses a Windows 95/XP inspired design with:
- Flat colors (no gradients)
- Square borders (`border-2 border-black`)
- Simple backgrounds (`bg-white`, `bg-gray-100`, `bg-green-100`)
- No shadows or rounded corners
- Functional, traditional appearance

### Custom Fonts
- Arabic Surah names: `common-quran-common`
- English Surah names: `v4-surah-name`

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with today's schedule and progress |
| `/calendar` | Full Ramadan calendar grid |
| `/progress` | Detailed progress tracking |
| `/radio` | Radio streaming page |
| `/login` | User login |
| `/logout` | User logout |
| `/dashboard` | Dashboard home |
| `/dashboard/controller` | Calendar and progress management |
| `/dashboard/majlis` | Radio stream management |
| `/dashboard/admin` | User management |

## 🔧 API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/*` | GET, POST | Better Auth authentication |
| `/api/schedules` | GET, POST | List/create schedules |
| `/api/schedules/[id]` | GET, PUT, DELETE | Single schedule operations |
| `/api/status` | GET, PUT | Majlis status (progress, radio) |
| `/api/users` | GET, POST | List/create users (admin only) |
| `/api/users/[id]` | GET, PUT, DELETE | Single user operations |

## 📄 License

This project is created for Majlis Haji Ebrahim Aldaqaq.

## 🤲 Ramadan Mubarak!

May Allah accept your recitation and worship during the blessed month of Ramadan.
