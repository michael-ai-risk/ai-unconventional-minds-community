import { connect } from "node:tls";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

// Let Workers resolve the public hostname itself instead of passing Nodemailer's
// custom DNS lookup/address-family options into its socket proxy.
export const gmailSocket: NonNullable<SMTPTransport.Options["getSocket"]> = (_options, done) => {
  let settled = false;
  const socket = connect({
    host: "smtp.gmail.com",
    port: 465,
    servername: "smtp.gmail.com",
    rejectUnauthorized: true,
  });
  const timeout = setTimeout(() => {
    if (settled) return;
    settled = true;
    socket.destroy();
    done(Object.assign(new Error("SMTP connection timeout"), { code: "ETIMEDOUT" }), {});
  }, 10_000);
  socket.once("secureConnect", () => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    done(null, { connection: socket, secured: true });
  });
  socket.once("error", (error) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    socket.destroy();
    done(error, {});
  });
};
