import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

function getAdmins(): string[] {
  return process.env.ADMIN_EMAILS?.split(",") || []
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token }) {
      const admins = getAdmins()
      token.isAdmin = admins.includes(token.email!)
      return token
    },
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin
      return session
    },
  },
})

export { handler as GET, handler as POST }

