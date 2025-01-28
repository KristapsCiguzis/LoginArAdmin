import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { getToken } from "next-auth/jwt"
import { headers } from "next/headers"
import { LRUCache } from "lru-cache"

const rateLimit = new LRUCache({
  max: 500,
  ttl: 60 * 1000, // 1 minute
})

function rateLimiter(ip: string) {
  const tokenCount = rateLimit.get(ip) || [0]
  if (tokenCount[0] === 0) {
    rateLimit.set(ip, [1, Date.now()])
    return true
  }
  const currentTime = Date.now()
  const timeDiff = currentTime - tokenCount[1]
  if (timeDiff < 60 * 1000) {
    if (tokenCount[0] >= 5) return false
    tokenCount[0]++
    rateLimit.set(ip, tokenCount)
    return true
  }
  rateLimit.set(ip, [1, currentTime])
  return true
}

function getAdmins(): string[] {
  return process.env.ADMIN_EMAILS?.split(",") || []
}

function saveAdmins(admins: string[]) {
  process.env.ADMIN_EMAILS = admins.join(",")
}

async function verifyToken(request: Request) {
  const token = await getToken({ req: request as any })
  if (!token || !token.isAdmin) {
    throw new Error("Unauthorized")
  }
}

export async function POST(request: Request) {
  try {
    await verifyToken(request)
    const ip = headers().get("x-forwarded-for") ?? "unknown"
    if (!rateLimiter(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }
    const { email } = await request.json()
    const admins = getAdmins()
    if (!admins.includes(email)) {
      admins.push(email)
      saveAdmins(admins)
    }

    return NextResponse.json({ message: "Admin added successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function DELETE(request: Request) {
  try {
    await verifyToken(request)
    const ip = headers().get("x-forwarded-for") ?? "unknown"
    if (!rateLimiter(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }
    const { email } = await request.json()
    const admins = getAdmins()
    const updatedAdmins = admins.filter((admin: string) => admin !== email)
    saveAdmins(updatedAdmins)

    return NextResponse.json({ message: "Admin removed successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function GET(request: Request) {
  try {
    await verifyToken(request)
    const ip = headers().get("x-forwarded-for") ?? "unknown"
    if (!rateLimiter(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }
    const admins = getAdmins()
    return NextResponse.json({ admins })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

