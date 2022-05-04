import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

interface Session {
  user: {
    name: string
    email: string | null
    image: string
  }
  expires: string
}

interface Token {
  user: {
    name: string
    email: string | null
    image: string
  }
  account: {
    provider: 'github'
    type: string
    id: number
    refreshToken?: string
    accessToken: string
    accessTokenExpires: string
  }
  iat: number
  expt: number
}

// export default NextAuth({
//   providers: [
//     // http://localhost:3000/api/auth/providersで、callback分かる
//     // http://sinple-post.vercel.app/api/auth/providersで、callback分かる
//     // https://simple-post-git-main-akiogitgit.vercel.app/api/auth/providers
//     GoogleProvider({
//       clientId: String(process.env.GOOGLE_CLIENT_ID),
//       clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
//     }),
//   ],
//   secret: 'secret',
// })

const options = {
  site: process.env.SITE || 'http://localhost:3000',

  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: String(process.env.GOOGLE_CLIENT_ID),
      clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
    }),
  ],

  // A database is optional, but required to persist accounts in a database
  database: process.env.DATABASE_URL,
  // callbacks: {
  //   session: async (session: Session, token: Token) => {
  //     return Promise.resolve({
  //       ...session,
  //       accessToken: token.account.accessToken,
  //     })
  //   },
  callbacks: {
    async session({ session, user, token }) {
      session.accessToken = token.accessToken
      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (account) token.accessToken = account.access_token
      return token
    },
  },
}

export default (req, res) => NextAuth(req, res, options)
