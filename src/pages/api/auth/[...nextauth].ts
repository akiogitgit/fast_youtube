import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export default NextAuth({
    providers: [
        // http://localhost:3000/api/auth/providersで、callback分かる
        // http://sinple-post.vercel.app/api/auth/providersで、callback分かる
        // https://simple-post-git-main-akiogitgit.vercel.app/api/auth/providers
        GoogleProvider({
            clientId: String(process.env.GOOGLE_CLIENT_ID),
            clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
        }),
    ],
    // adapter: PrismaAdapter(prisma),
    secret: "secret",
})