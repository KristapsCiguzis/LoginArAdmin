import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import AdminPanel from "../components/AdminPanel"

function getAdmins(): string[] {
  return process.env.ADMIN_EMAILS?.split(",") || []
}

export default async function AdminPage() {
  const session = await getServerSession()

  if (!session || !session.user?.email) {
    redirect("/login")
  }

  const admins = getAdmins()
  const isAdmin = admins.includes(session.user.email)

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="text-green-600 font-bold mb-4">Welcome, Admin {session.user.email}!</p>
      <AdminPanel />
    </div>
  )
}

