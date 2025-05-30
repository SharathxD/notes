# Notepad App

A powerful, modern notepad application built with Next.js and Supabase that works offline and optionally syncs across all your devices.

## Features

### 🚀 Core Features
- **No Sign-up Required** - Start using immediately without any registration
- **Offline First** - Works completely offline with local storage
- **Optional Cloud Sync** - Enable cloud synchronization when you need cross-device access
- **Real-time Updates** - See changes instantly across all connected devices
- **Auto-save** - Never lose your work with automatic saving

### 📱 Cross-Device Support
- **Universal Access** - Works on desktop, tablet, and mobile devices
- **Device Tracking** - See which device created or modified each note
- **Sync URLs** - Share links to access your notes on other devices
- **Offline Support** - Continue working offline, sync when reconnected

### 💾 Data Management
- **Local Storage** - Primary storage in browser's localStorage
- **Cloud Backup** - Optional Supabase cloud storage
- **Export/Import** - Backup and restore your notes
- **File Support** - Import text files and markdown documents

### 🎨 User Experience
- **Clean Interface** - Modern, intuitive design
- **Search & Filter** - Find notes quickly with full-text search
- **Statistics** - Track note count, word count, and sync status
- **Visual Indicators** - Clear sync status and device information

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for cloud sync features)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd notepad-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Add your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The app requires the following Supabase tables:

\`\`\`sql
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
\`\`\`

## Usage

### Basic Usage
1. **Create Notes** - Click "New Note" to create a new note
2. **Edit Content** - Click on any note to start editing
3. **Auto-save** - Changes are automatically saved after 2 seconds
4. **Search** - Use the search bar to find specific notes

### Cloud Sync
1. **Enable Sync** - Click the settings button and enable cloud sync
2. **Cross-device Access** - Your notes will automatically sync across devices
3. **Share Access** - Generate sync URLs to access notes on other devices
4. **Real-time Updates** - See changes from other devices instantly

### Import/Export
1. **Export All** - Download a complete backup of your notes
2. **Import Files** - Import text files, markdown, or backup files
3. **Individual Export** - Export single notes as text files

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Storage**: Browser localStorage + Supabase cloud storage
- **Real-time**: Supabase real-time subscriptions

## Project Structure

\`\`\`
notepad-app/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── empty-state.tsx   # Empty state component
│   ├── note-editor.tsx   # Note editing interface
│   ├── note-list.tsx     # Notes list component
│   ├── settings-dialog.tsx # Settings modal
│   └── sidebar.tsx       # Application sidebar
├── hooks/                # Custom React hooks
│   ├── use-notes.ts      # Notes management hook
│   ├── use-realtime.ts   # Real-time updates hook
│   └── use-toast.ts      # Toast notifications hook
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
└── public/               # Static assets
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact support at support@notepad-app.com

## Roadmap

- [ ] Rich text editor with markdown support
- [ ] Note categories and tags
- [ ] Collaborative editing
- [ ] Note templates
- [ ] Advanced search and filtering
- [ ] Client-side encryption
- [ ] PWA support for offline installation
