# Commitly Admin Panel

A standalone Next.js admin dashboard for managing the Commitly platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Navigate to the admin directory:
```bash
cd Commitly/Commitly/admin
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The admin panel will be available at [http://localhost:3001](http://localhost:3001)

### Build for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## 📁 Project Structure

```
admin/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   │   └── admin-layout.tsx
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
│   └── use-mobile.tsx    # Mobile detection hook
├── lib/                  # Utility functions
│   └── utils.ts          # Helper utilities
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 📜 Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm start` - Start production server on port 3001
- `npm run lint` - Run ESLint

## ✨ Features

- **Dashboard Overview**: System metrics and statistics
- **User Management**: View and manage all users
- **Analytics**: Detailed system analytics and insights
- **Content Management**: Manage content and media
- **Security**: Security monitoring and access control
- **Settings**: System configuration options

## 🎨 Tech Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS 3.4.18
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts

## 🔧 Configuration

### Port Configuration

The admin panel runs on port 3001 by default. To change this, update the `scripts` section in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p YOUR_PORT",
    "start": "next start -p YOUR_PORT"
  }
}
```

### Environment Variables

Create a `.env.local` file in the admin directory for environment-specific configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 🛡️ Security

This is an admin panel with elevated privileges. Ensure proper authentication and authorization are implemented before deploying to production.

## 🐛 Troubleshooting

### Port Already in Use

If port 3001 is already in use, the dev server will automatically try the next available port, or you can manually specify a different port:

```bash
npm run dev -- -p 3002
```

### Build Errors

If you encounter build errors, try:

1. Delete the `.next` folder and `node_modules`:
```bash
rm -rf .next node_modules
```

2. Reinstall dependencies:
```bash
npm install
```

3. Rebuild:
```bash
npm run build
```

### TypeScript Errors

TypeScript strict mode is enabled. If you need to temporarily disable type checking during builds, update `next.config.ts`:

```typescript
typescript: {
  ignoreBuildErrors: true,
}
```

## 📝 Development Notes

- The admin layout wraps all pages and provides navigation sidebar
- All UI components are located in `components/ui/`
- Custom hooks go in the `hooks/` directory
- Utility functions belong in `lib/utils.ts`

## 🚢 Deployment

The admin panel is configured with `output: "standalone"` for optimized deployment. You can deploy to:

- Vercel (recommended)
- Docker containers
- Node.js servers
- Static hosting (with ISR support)

## 📄 License

Part of the Commitly project.

## 🤝 Contributing

This is a standalone admin application within the Commitly project. For contribution guidelines, refer to the main project README.