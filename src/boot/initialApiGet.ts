// import { defineBoot } from '#q-app/wrappers'
// import axios from 'axios'
// import type { People } from 'src/components/models'

// // "async" is optional;
// // more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
// export default defineBoot(async ({ app }) => {
//   // something to do
//   const authOtpData = {
//     mobile: '0987654321',
//     idCode: '0001',
//   }
//   try {
//     const [announcementsResponse, authOtpResponse] = await axios.all([
//       axios.get<People[]>('https://apidev.hiscloud.tw/api/announcements/?isActive=true'),
//       axios.get(
//         `https://apidev.hiscloud.tw/api/auth/otp?mobile=${authOtpData.mobile}&idCode=${authOtpData.idCode}`,
//       ),
//     ])

//     const datas: People[] = await announcementsResponse.data.map(
//       ({ id, content }: { id: number; content: string }) => ({
//         id,
//         content,
//       }),
//     )

//     app.config.globalProperties.$announcements = datas
//   } catch (error) {
//     console.error('Error fetching data:', error)
//   }
// })
