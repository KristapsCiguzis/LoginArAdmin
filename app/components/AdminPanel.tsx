"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPanel() {
  const [email, setEmail] = useState("")
  const [admins, setAdmins] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    const response = await fetch("/api/admin")
    if (response.ok) {
      const data = await response.json()
      setAdmins(data.admins)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (response.ok) {
      setEmail("")
      fetchAdmins()
      router.refresh()
    }
  }

  const handleRemove = async (emailToRemove: string) => {
    const response = await fetch("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailToRemove }),
    })
    if (response.ok) {
      fetchAdmins()
      router.refresh()
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Add admin email"
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Admin
        </button>
      </form>
      <h2 className="text-xl font-bold mb-2">Current Admins:</h2>
      <ul>
        {admins.map((adminEmail) => (
          <li key={adminEmail} className="flex items-center justify-between mb-2">
            <span>{adminEmail}</span>
            <button onClick={() => handleRemove(adminEmail)} className="bg-red-500 text-white p-1 rounded">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

