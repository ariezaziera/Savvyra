import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          image: user.image,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id       = user.id;
        token.provider = account?.provider ?? "credentials";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id       = token.id;
        (session.user as any).provider = token.provider;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (existingUser && !existingUser.googleId) {
          await prisma.user.update({
            where: { email: user.email! },
            data:  { googleId: user.id, image: user.image },
          });
        }
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/`;
    },
  },

  pages: {
    signIn:  "/login",
    signOut: "/login",
    error:   "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// ── MUST be default export — this is what Next.js pages API requires ──
export default NextAuth(authOptions);