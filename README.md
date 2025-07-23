# Portfolio Dashboard

A modern, secure project portfolio management application built with React, TypeScript, and Supabase.

## 🚀 Features

- **🔐 Secure Authentication**: Email-based registration with confirmation
- **📊 Project Management**: Create, read, update, and delete projects
- **🎨 Modern UI**: Beautiful Notion-inspired dark theme
- **📱 Responsive Design**: Works seamlessly on all devices
- **☁️ Cloud Backend**: Powered by Supabase for reliability and scalability
- **🔄 Real-time Sync**: Instant data synchronization across devices
- **🛡️ Security**: Row Level Security (RLS) policies protect user data

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **State Management**: React Context, TanStack Query
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel, Netlify, or any static host

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AuthPage.tsx    # Authentication wrapper
│   ├── LoginForm.tsx   # User login form
│   ├── RegisterForm.tsx # User registration form
│   ├── EmailConfirmation.tsx # Email confirmation UI
│   ├── ProjectCard.tsx # Individual project display
│   └── AddProjectModal.tsx # Project creation/editing
├── hooks/              # Custom React hooks
│   └── useAuth.tsx     # Authentication state management
├── services/           # API service layers
│   ├── authService.ts  # Authentication operations
│   └── projectService.ts # Project CRUD operations
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client and types
├── pages/              # Application pages
│   └── Index.tsx       # Main dashboard page
└── utils/              # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Evan620/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migrations from `supabase/migrations/` in your Supabase SQL editor
   - Update the Supabase configuration in `src/integrations/supabase/client.ts`

4. **Configure Authentication**
   - In your Supabase dashboard, go to Authentication > Settings
   - Set your site URL (e.g., `http://localhost:5173` for development)
   - Enable email confirmations if desired

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Create an account and start managing your projects!

## 🔧 Configuration

### Supabase Setup

Update the following files with your Supabase project details:

**`src/integrations/supabase/client.ts`**
```typescript
const SUPABASE_URL = "your-project-url";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key";
```

**`supabase/config.toml`**
```toml
project_id = "your-project-id"
```

### Database Schema

The application uses two main tables:

- **`profiles`**: User profile information
- **`projects`**: Project data with user relationships

Both tables have Row Level Security enabled to ensure data privacy.

## 📝 Usage

1. **Register**: Create a new account with email and password
2. **Confirm Email**: Check your inbox and confirm your email address
3. **Sign In**: Log in with your confirmed credentials
4. **Add Projects**: Create new projects with details like name, client, URLs
5. **Manage**: Edit, delete, or search through your projects
6. **Share**: Copy project URLs or GitHub links easily

## 🔒 Security Features

- **Email Confirmation**: Required before account access
- **Row Level Security**: Database-level access control
- **Session Management**: Secure JWT-based authentication
- **Input Validation**: Client and server-side validation
- **Error Handling**: Graceful error management with user feedback

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables if needed
4. Deploy!

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure redirects for SPA routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Lucide](https://lucide.dev) for the clean, consistent icons
