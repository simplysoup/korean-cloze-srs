import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './db';
import { hashPassword, verifyPassword } from './password';

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: 'postgresql' }),
	emailAndPassword: {
		enabled: true,
		password: {
			hash: hashPassword,
			verify: verifyPassword
		}
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // update session every 24h
	},
	// 6.4 — Rate limiting: enabled in all environments.
	// BetterAuth applies built-in stricter rules on sign-in / sign-up / change-password
	// endpoints (3 req / 10 s per IP). The global fallback is 100 req / 10 s.
	rateLimit: {
		enabled: true,
		window: 10, // seconds
		max: 100, // global default; sign-in/sign-up are automatically capped at 3
		storage: 'memory'
	}
});
