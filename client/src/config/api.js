// Dynamic API Base URL pointing to deployed Render backend by default and configurable via VITE_API_URL
export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.endsWith('/') ? import.meta.env.VITE_API_URL.slice(0, -1) : import.meta.env.VITE_API_URL)
  : 'https://freightiq-backend-a9cn.onrender.com'

