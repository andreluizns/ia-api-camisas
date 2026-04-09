import "dotenv/config";
import { z } from "zod";

const envShcema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().min(1).default(3333),
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
});

const parseEnv = envShcema.safeParse(process.env);

if (!parseEnv.success) {
  throw new Error("TA FALTANDO VARIAVEL!");
}

export const env = parseEnv.data;
