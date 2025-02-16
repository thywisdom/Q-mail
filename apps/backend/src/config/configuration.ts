export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  auth: {
    sessionDuration: 60 * 60 * 24 * 7, // 1 week
    refreshTokenDuration: 60 * 60 * 24 * 30 // 30 days
  }
}) 