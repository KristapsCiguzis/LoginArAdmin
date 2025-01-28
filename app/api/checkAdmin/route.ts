import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const ADMINS_FILE = path.join(process.cwd(), "data", "admins.json")

function getAdmins() {
  const data = fs.readFileSync(ADMINS_FILE, "utf8")
  return JSON.parse(data).admins
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const admins = getAdmins()
  const isAdmin = admins.includes(email)

  return NextResponse.json({ isAdmin })
}

