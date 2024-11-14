import dotenv from "dotenv";

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:12345678@localhost:5432/DMSFinal",
  jwtSecret: process.env.JWT_SECRET || "carbonteq",
  linkExpiration: process.env.LINK_EXPIRATION || "15m",
};

export default config;
