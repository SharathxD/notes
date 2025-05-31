# 📝 Notepad App

> A powerful, modern notepad application built with Next.js and Supabase that works offline and optionally syncs across all your devices.

## ✨ Features

<details>
<summary><strong>🚀 Core Features</strong></summary>

- Start using immediately without registration
- Works completely offline with local storage
- Optional cloud synchronization
- Real-time updates across devices
- Automatic saving
</details>

<details>
<summary><strong>📱 Cross-Device Support</strong></summary>

- Universal access (desktop, tablet, mobile)
- Device tracking and management
- Sync URLs for shared access
- Seamless offline support
</details>

<details>
<summary><strong>💾 Data Management</strong></summary>

- Primary storage in browser's localStorage
- Optional Supabase cloud backup
- Export/Import functionality
- Text and markdown file support
</details>

<details>
<summary><strong>🎨 User Experience</strong></summary>

- Modern, intuitive design
- Full-text search capabilities
- Usage statistics tracking
- Clear sync status indicators
</details>

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for cloud sync)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd notepad-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development server**
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

<details>
<summary><strong>Required Supabase Tables</strong></summary>

```sql
-- Notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT DEFAULT '',
  device_info TEXT,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_deleted BOOLEAN DEFAULT FALSE,
  anonymous_user_id TEXT
);

-- Devices table
CREATE TABLE devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  device_name TEXT,
  device_type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  anonymous_user_id TEXT
);

-- Sync status table
CREATE TABLE sync_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  anonymous_user_id TEXT
);
```
</details>

## 📖 Usage Guide

### Basic Operations
- Create notes with "New Note" button
- Edit by clicking any note
- Automatic saving after 2 seconds
- Search functionality via search bar

### Cloud Features
- Enable sync in settings
- Automatic cross-device synchronization
- Share notes via sync URLs
- Real-time collaborative updates

### Data Management
- Export complete note backups
- Import text/markdown files
- Individual note exports

## 🛠 Technical Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL)
- **Storage**: localStorage + Supabase
- **Real-time**: Supabase subscriptions

## 📁 Project Structure

```
notepad-app/
├── app/                    # Next.js app directory
├── components/            # React components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── public/               # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 💬 Support

- Check [Issues](https://github.com/your-repo/issues)
- Create new issues with details
- Email: support@notepad-app.com

## 🗺 Roadmap

- [ ] Rich text editor with markdown
- [ ] Categories and tags
- [ ] Collaborative editing
- [ ] Note templates
- [ ] Advanced search
- [ ] Client-side encryption
- [ ] PWA support
