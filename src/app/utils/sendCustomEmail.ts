import httpStatus from 'http-status';
import nodemailer from 'nodemailer';
import config from '../config';
import AppError from './AppError';

type TEmailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

const sendCustomEmail = async ({
  email,
  subject,
  message,
  attachments = [],
}: {
  email: string;
  subject: string;
  message: string;
  attachments?: TEmailAttachment[];
}) => {
  try {
    const transporter = nodemailer.createTransport({
      // host: 'smtp.gmail.com',
      // port: 587,
      // secure: false, // true for 465, false for other ports
      service: 'gmail',
      auth: {
        user: config.nodemailer.email,
        pass: config.nodemailer.password,
      },
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>
          <div>
            <p>${message}</p>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `${config.preffered_website_name} <${config.nodemailer.email}>`,
      to: email,
      subject,
      html: htmlTemplate,
      attachments,
    };

    await transporter.sendMail(mailOptions);
  } catch {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to send email',
    );
  }
};

export default sendCustomEmail;
