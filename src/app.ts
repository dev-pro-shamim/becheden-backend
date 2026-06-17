import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import routes from './app/routes';
import { globalErrorHandler, notFoundHandler } from './app/utils';
import config from './app/config';
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
      'https://becheden.com.bd',
      'https://www.becheden.com.bd',
      'https://dashboard.becheden.com.bd',
      'https://www.dashboard.becheden.com.bd',
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

// All main routes
app.use('/api/v1', routes);

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: `${config.preffered_website_name} server is running`,
    version: '1.0.0',
  });
});

// global error handler
app.use(globalErrorHandler);

// all not found handler
app.use(notFoundHandler);

export default app;
