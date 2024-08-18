import nodemailer from 'nodemailer';
import nodemailerSendGrid from 'nodemailer-sendgrid';

export default nodemailer.createTransport(
    nodemailerSendGrid({
        apiKey: process.env.SENDGRID_API_KEY!,
    }),
);
