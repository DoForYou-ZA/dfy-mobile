// Switch between local and production by changing LOCAL_DEV
const LOCAL_DEV = false

const ENV = LOCAL_DEV
  ? {
      // Local development — phone must use your Mac's LAN IP, not localhost
      apiUrl: 'http://10.61.85.66:5001/api/v1',
      signalRUrl: 'http://10.61.85.66:5001',
    }
  : {
      // Production
      apiUrl: 'https://dfy-be.onrender.com/api/v1',
      signalRUrl: 'https://dfy-be.onrender.com',
    }

export default {
  ...ENV,
  appName: 'DoForYou',
  whatsappNumber: '27795258611',
  contactEmail: 'info@doforyou.co.za',
  supportPhone: '0795258611',
}
