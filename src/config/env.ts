// Set EXPO_PUBLIC_DFY_API_URL and optionally EXPO_PUBLIC_DFY_SIGNALR_URL
// in the build environment to target staging or production without editing source.
// The API URL must include the /api/v1 prefix because API wrappers use relative routes.
const DEFAULT_API_URL = 'https://dfy-be.onrender.com/api/v1'
const DEFAULT_SIGNALR_URL = 'https://dfy-be.onrender.com'

const configuredApiUrl = process.env.EXPO_PUBLIC_DFY_API_URL?.trim()
const configuredSignalRUrl = process.env.EXPO_PUBLIC_DFY_SIGNALR_URL?.trim()

const apiUrl = configuredApiUrl || DEFAULT_API_URL
const signalRUrl = configuredSignalRUrl || apiUrl.replace(/\/api\/v1\/?$/, '')

export default {
  apiUrl,
  signalRUrl,
  appName: 'DoForYou',
  whatsappNumber: '27795258611',
  contactEmail: 'info@doforyou.co.za',
  supportPhone: '0795258611',
}
