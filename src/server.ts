import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import api from '@/routes/api';
import uploads from '@/routes/uploads';
import { initRepository } from '@/data/repository';

const app = express();
const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0';
const uploadRoot = path.resolve(process.env.MEDIA_UPLOAD_DIR || path.join(process.cwd(), 'uploads'));

app.disable('x-powered-by');
// Hostinger places the Node app behind a reverse proxy and forwards the client IP.
// Trust the first proxy hop so express-rate-limit can safely use X-Forwarded-For.
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map(v => v.trim()) || ['http://localhost:3000'], credentials: true }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60_000, limit: 240, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/health', (_req,res)=>res.json({status:'ok',service:'tanmiyat-api',timestamp:new Date().toISOString()}));
app.use('/uploads', express.static(uploadRoot, { maxAge: '30d', immutable: true }));
app.use('/api/uploads', uploads);
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
