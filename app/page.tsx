import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

async function getAdminStatus(email: string) {
  const admins = process.env.ADMIN_EMAILS?.split(",") || []
  return admins.includes(email)
}

export default async function Home() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  const isAdmin = await getAdminStatus(session.user?.email || "")

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
      <p>You are logged in as {session.user?.email}</p>
      {isAdmin && <p className="mt-4 text-green-600 font-bold">You have admin privileges</p>}
    </main>
  )
}

