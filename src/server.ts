import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import api from '@/routes/api';
import crmActions from '@/routes/crmActions';
import uploads from '@/routes/uploads';
import { initRepository } from '@/data/repository';

const app = express();
const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0';
const uploadRoot = path.resolve(process.env.MEDIA_UPLOAD_DIR || path.join(process.cwd(), 'uploads'));

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map(v => v.trim()) || ['http://localhost:3000'], credentials: true }));
app.use(cookieParser());

const apiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => req.path === '/api/auth/login',
});
const loginRateLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please try again later.' },
});

app.use(apiRateLimit);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/health', (_req,res)=>res.json({status:'ok',service:'tanmiyat-api',timestamp:new Date().toISOString()}));
app.use('/uploads', express.static(uploadRoot, { maxAge: '30d', immutable: true }));
app.use('/api/uploads', uploads);
app.use('/api', crmActions);
app.use('/api/auth/login', loginRateLimit);
app.use('/api', api);
app.use((_req,res)=>res.status(404).json({success:false,error:'API route not found'}));
app.use((err: unknown,_req: express.Request,res: express.Response,_next: express.NextFunction)=>{
  console.error('[Tanmiyat API]',err);
  res.status(500).json({success:false,error:'Internal server error'});
});

initRepository().then(() => {
  app.listen(port, host, () => console.log(`[Tanmiyat API] listening on http://${host}:${port}`));
}).catch((error) => {
  console.error('[Tanmiyat API] Startup failed:', error);
  process.exit(1);
});
