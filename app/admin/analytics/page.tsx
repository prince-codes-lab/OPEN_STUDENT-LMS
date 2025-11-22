import dynamic from "next/dynamic"

const AdminAnalyticsPage = dynamic(() => import("./analytics-content"), { ssr: true })

export const revalidate = 0

export default AdminAnalyticsPage
