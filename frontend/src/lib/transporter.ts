import { env } from "@/env";
import nodemailer from "nodemailer";

export const zeptoTransporter = nodemailer.createTransport({
  host: "smtp.zeptomail.com",
  port: 465,
  secure: true,
  auth: {
    user: "emailapikey",
    pass: env.ZEPTO_MAIL_API_KEY,
  },
});
