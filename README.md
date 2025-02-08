# Create a detailed README.md first
echo "# Q-Mail

A modern email application built with Vue 3, NestJS, and Supabase.

## Features

- User Authentication
  - Email/Password Login
  - Google OAuth Integration
  - Password Reset Functionality
  - Email Verification

## Tech Stack

- Frontend:
  - Vue 3
  - Vite
  - Pinia
  - TailwindCSS
  - TypeScript

- Backend:
  - NestJS
  - TypeScript
  - Supabase

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/q-mail.git
cd q-mail
\`\`\`

2. Install dependencies
\`\`\`bash
# Install frontend dependencies
cd apps/frontend
npm install

# Install backend dependencies
cd ../backend
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:3000
PORT=3001
\`\`\`

4. Run the application
\`\`\`bash
# Start frontend (in apps/frontend)
npm run dev

# Start backend (in apps/backend)
npm run start:dev
\`\`\`

## Project Structure

\`\`\`
q-mail/
├── apps/
│   ├── frontend/     # Vue 3 frontend application
│   └── backend/      # NestJS backend application
├── database/         # Database schemas and migrations
└── README.md
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
" > README.md

# Add and commit README
git add README.md
git commit -m "Add detailed README"
