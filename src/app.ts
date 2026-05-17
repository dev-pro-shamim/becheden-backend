import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import routes from './app/routes';
import { globalErrorHandler, notFoundHandler } from './app/utils';
import os from 'os';
import config from './app/config';
import serverHomePage, { getMonitorStats } from './app/helpers/serverHomePage';
import { responseTimeLogger } from './app/middlewares/logger';

const app: Application = express();

// (3)
// response time logger
app.use(responseTimeLogger);

// CORS configuration
app.use(
  cors({
    // credentials: true,
    origin: [
      'https://recyclemart.com.bd',
      'https://www.recyclemart.com.bd',
      'https://dashboard.recyclemart.com.bd',
      'https://www.dashboard.recyclemart.com.bd',
    ],
  }),
);

// all parsers
// cookie parser
app.use(cookieParser());

// logger
app.use(morgan('dev'));

// json parser
app.use(express.json());

// form data parser
app.use(express.urlencoded({ extended: true }));

// for static files
// app.use('/public', express.static('public'));

// All main routes
app.use('/api/v1', routes);

// Testing
// app.get('/', (req: Request, res: Response, next: NextFunction) => {
//   res.send({ message: 'Server is running like a Rabit!' });
// });

app.get('/', (req: Request, res: Response) => {
  const currentDateTime = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();

  // GitHub contributors avatar HTML
  const contributorsHTML = `
    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
    <a href="https://github.com/khaledssbd">
      <img src="https://avatars.githubusercontent.com/khaledssbd" width="40" style="border-radius: 50%;" />
    </a>
      <a href="https://github.com/nurulla-hasan">
        <img src="https://avatars.githubusercontent.com/nurulla-hasan" width="40" style="border-radius: 50%;" />
      </a>
    </div>
  `;

  // Send full HTML response
  res.send(`
    <html>
      <head><title>${config.preffered_website_name} APIs</title></head>
      <body style="font-family: sans-serif; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h1>🏪 Welcome to ${config.preffered_website_name} APIs</h1>
        <p><strong>Version:</strong> 1.0.0</p>
        <h2>📧 Developer Contact</h2>
        <ul>
        <li>khaledssbd@gmail.com</li>
        <li>nurullahasan.dev@gmail.com</li>
        </ul>
        <h2>👥 Contributors</h2>
        ${contributorsHTML}
        <div style="border-top: 2px solid black; width: 20%; margin: 20px 0 0;"></div>
        <div style="border-top: 2px solid black; width: 30%; margin: 5px 0;"></div>
        <div style="border-top: 2px solid black; width: 40%; margin: 0 20px 0;"></div>

        <h2>🧑‍💻 Client Details</h2>
        <ul>
          <li><strong>IP Address:</strong> ${clientIp}</li>
          <li><strong>Accessed At:</strong> ${currentDateTime}</li>
        </ul>
        <h2>🖥 Server Details</h2>
        <ul>
          <li><strong>Hostname:</strong> ${serverHostname}</li>
          <li><strong>Platform:</strong> ${serverPlatform}</li>
          <li><strong>Uptime:</strong> ${Math.floor(
            serverUptime / 60 / 60,
          )} hours ${Math.floor((serverUptime / 60) % 60)} minutes</li>
        </ul>

      </body>
    </html>
  `);
});

app.get('/info', (req: Request, res: Response) => {
  const currentDateTime = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();
  res.send({
    success: true,
    message: `Welcome to ${config.preffered_website_name} Server`,
    version: '1.0.0',
    clientDetails: {
      ipAddress: clientIp,
      accessedAt: currentDateTime,
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
        (serverUptime / 60) % 60,
      )} minutes`,
    },
    developerContact: [
      {
        name: 'Khaled Siddique',
        email: 'khaledssbd@gmail.com',
        github: 'https://github.com/khaledssbd',
        website: 'https://khaled-siddique.vercel.app',
      },
      {
        name: 'Nurulla Hasan',
        email: 'nurullahasan.dev@gmail.com',
        github: 'https://github.com/nurulla-hasan',
        website: 'not-available',
      },
    ],
  });
});

app.get('/monitor', async (req: Request, res: Response) => {
  const htmlContent = await serverHomePage();
  res.send(htmlContent);
});

app.get('/monitor/data', (req: Request, res: Response) => {
  const data = getMonitorStats();
  res.json(data);
});

// global error handler
app.use(globalErrorHandler);

// all not found handler
app.use(notFoundHandler);

export default app;
