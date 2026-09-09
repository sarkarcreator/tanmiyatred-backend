import { Router, type Request, type Response } from 'express';
import { repository } from '@/data/repository';
import { requireAuth, requireRoles, issueToken, optionalAuth } from '@/middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const fail = (res: Response, error: unknown, status = 500) => res.status(status).json({ success: false, error: error instanceof Error ? error.message : String(error) });
const q = (req: Request, key: string) => typeof req.query[key] === 'string' ? req.query[key] as string : undefined;
const param = (req: Request, key: string) => {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
};
const currentActor = (req: Request) => req.user?.email || 'public@tanmiyatrealestate.com';

// Authentication
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return fail(res, 'Email and password are required.', 400);
    const adminEmail = process.env.ADMIN_EMAIL;
    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!adminEmail || !hash) return fail(res, 'Admin authentication is not configured.', 503);
    const valid = email.toLowerCase() === adminEmail.toLowerCase() && await bcrypt.compare(password, hash);
    if (!valid) return fail(res, 'Invalid administrator credentials.', 401);
    const token = issueToken({ email: adminEmail, role: 'SUPER_ADMIN' });
    res.cookie('tanmiyat_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60 * 1000, path: '/' });
    return ok(res, { email: adminEmail, role: 'SUPER_ADMIN' });
  } catch (e) { return fail(res, e); }
});
router.post('/auth/logout', (req, res) => { res.clearCookie('tanmiyat_session', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' }); return ok(res, { loggedOut: true }); });
router.get('/auth/me', requireAuth, (req, res) => ok(res, req.user));

// Dashboard
router.get('/admin/stats', requireAuth, requireRoles('SUPER_ADMIN','ADMIN','SALES_MANAGER','CRM_MANAGER','VIEWER'), async (_req,res)=>{ try{return ok(res,await repository.getDashboardStats())}catch(e){return fail(res,e)} });

// Projects / developments
router.get('/projects', async (_req,res)=>{ try{return ok(res,await repository.getProjects())}catch(e){return fail(res,e)} });
router.get('/projects/:id', async(req,res)=>{try{const x=await repository.getProjectById(param(req, 'id'))||await repository.getProjectBySlug(param(req, 'id'));if(!x)return fail(res,'Project not found',404);return ok(res,x)}catch(e){return fail(res,e)}});
router.post('/projects', requireAuth, async (req,res)=>{ try{return ok(res,await repository.createProject(req.body),201)}catch(e){return fail(res,e)} });

// Properties
router.get('/properties', optionalAuth, async (req,res)=>{ try{
  const result=await repository.getProperties({purpose:q(req,'purpose'),community:q(req,'community'),propertyType:q(req,'propertyType'),bedrooms:q(req,'bedrooms'),bathrooms:q(req,'bathrooms'),minPrice:q(req,'minPrice')?Number(q(req,'minPrice')):undefined,maxPrice:q(req,'maxPrice')?Number(q(req,'maxPrice')):undefined,furnished:q(req,'furnished'),search:q(req,'search'),sort:q(req,'sort'),status:q(req,'status'),workflowStatus:q(req,'workflowStatus'),agentId:q(req,'agentId'),isPublic:req.user ? (q(req,'isPublic') === 'true' ? true : undefined) : true,page:q(req,'page')?Number(q(req,'page')):1,limit:Math.min(q(req,'limit')?Number(q(req,'limit')):12,50)});
  return res.json({success:true,data:result.properties,meta:{total:result.total,page:result.page,limit:result.limit,totalPages:result.totalPages}});
 }catch(e){return fail(res,e)}});
router.get('/properties/:id', async(req,res)=>{try{const p=await repository.getPropertyById(param(req, 'id'))||await repository.getPropertyBySlug(param(req, 'id')); if(!p)return fail(res,'Property not found',404); return ok(res,p)}catch(e){return fail(res,e)}});
router.post('/properties', optionalAuth, async(req,res)=>{try{
  const isPublicSubmission=Boolean(req.body?.publicSubmission);
  if(!isPublicSubmission && !req.user) return fail(res,'Authentication required.',401);
  const body={...req.body};
  if(isPublicSubmission){body.workflowStatus='IN_REVIEW';body.verificationStatus='PENDING_VERIFICATION';body.verified=false;body.status='AVAILABLE';body.featured=false;body.exclusive=false;}
  const p=await repository.createProperty(body,currentActor(req)); return ok(res,p,201);
}catch(e){return fail(res,e)}});
router.patch('/properties/:id', requireAuth, async(req,res)=>{try{const id=param(req, 'id');let updated;
  if(req.body.action==='DUPLICATE') updated=await repository.duplicateProperty(id,currentActor(req));
  else if(req.body.action==='WORKFLOW_CHANGE') updated=await repository.updatePropertyWorkflow(id,req.body.workflowStatus,currentActor(req));
  else updated=await repository.updateProperty(id,req.body,currentActor(req));
  if(!updated)return fail(res,'Property not found',404);return ok(res,updated);
}catch(e){return fail(res,e)}});
router.delete('/properties/:id', requireAuth, requireRoles('SUPER_ADMIN','ADMIN'), async(req,res)=>{try{const d=await repository.deleteProperty(param(req, 'id'),currentActor(req));if(!d)return fail(res,'Property not found',404);return ok(res,{deleted:true})}catch(e){return fail(res,e)}});

// Agents
router.get('/agents', async(req,res)=>{try{return ok(res,await repository.getAgents({status:q(req,'status'),area:q(req,'area'),featured:q(req,'featured')==='true'?true:undefined}))}catch(e){return fail(res,e)}});
router.post('/agents', requireAuth, async(req,res)=>{try{if(!req.body.name||!req.body.email||!req.body.brn)return fail(res,'Name, email, and BRN are required.',400);return ok(res,await repository.createAgent(req.body,currentActor(req)),201)}catch(e){return fail(res,e)}});
router.get('/agents/:slug', async(req,res)=>{try{const a=await repository.getAgentBySlug(param(req, 'slug'));if(!a)return fail(res,'Agent not found',404);return ok(res,a)}catch(e){return fail(res,e)}});

// Customers
router.get('/customers', requireAuth, async(req,res)=>{try{return ok(res,await repository.getCustomers({type:q(req,'type'),agentId:q(req,'agentId')}))}catch(e){return fail(res,e)}});
router.post('/customers', requireAuth, async(req,res)=>{try{return ok(res,await repository.createCustomer(req.body,currentActor(req)),201)}catch(e){return fail(res,e)}});

// Inquiries - public create, protected read/update
router.get('/inquiries', requireAuth, async(_req,res)=>{try{return ok(res,await repository.getInquiries())}catch(e){return fail(res,e)}});
router.post('/inquiries', async(req,res)=>{try{const b=req.body;if(!b.name||!b.email||!b.phone)return fail(res,'Full name, email address, and phone number are required.',400);return ok(res,await repository.createInquiry({name:b.name,email:b.email,phone:b.phone,country:b.country||'UAE',interestedProject:b.interestedProject||'General Portfolio',propertyType:b.propertyType||'Any',message:b.message||'',type:b.type||'GENERAL'}),201)}catch(e){return fail(res,e)}});
router.patch('/inquiries/:id', requireAuth, async(req,res)=>{try{const x=await repository.updateInquiryStatus(param(req, 'id'),req.body.status,req.body.notes);if(!x)return fail(res,'Inquiry not found',404);return ok(res,x)}catch(e){return fail(res,e)}});

// Leads
router.get('/leads', requireAuth, async(req,res)=>{try{return ok(res,await repository.getLeads({stage:q(req,'stage'),priority:q(req,'priority'),agentId:q(req,'agentId'),source:q(req,'source'),search:q(req,'search')}))}catch(e){return fail(res,e)}});
router.get('/leads/:id', requireAuth, async(req,res)=>{try{const x=await repository.getLeadById(param(req, 'id'));if(!x)return fail(res,'Lead not found',404);return ok(res,x)}catch(e){return fail(res,e)}});
router.post('/leads', async(req,res)=>{try{if(!req.body.customerName||!req.body.customerPhone)return fail(res,'Customer name and phone number are required.',400);const b=req.body;return ok(res,await repository.createLead({customerName:b.customerName,customerEmail:b.customerEmail||'',customerPhone:b.customerPhone,customerType:b.customerType||'BUYER',source:b.source||'WEBSITE_PROPERTY',propertyId:b.propertyId,propertyTitle:b.propertyTitle,agentId:b.agentId,stage:b.stage||'NEW',priority:b.priority||'MEDIUM',budgetMin:b.budgetMin?Number(b.budgetMin):undefined,budgetMax:b.budgetMax?Number(b.budgetMax):undefined,preferredLocation:b.preferredLocation,notes:b.notes||b.message},b.initialNote,currentActor(req)),201)}catch(e){return fail(res,e)}});
router.patch('/leads/:id', requireAuth, async(req,res)=>{try{const x=req.body.stage?await repository.updateLeadStage(param(req, 'id'),req.body.stage,req.body.note,currentActor(req)):await repository.updateLead(param(req, 'id'),req.body,currentActor(req));if(!x)return fail(res,'Lead not found',404);return ok(res,x)}catch(e){return fail(res,e)}});

// Viewings
router.get('/viewings', requireAuth, async(req,res)=>{try{return ok(res,await repository.getViewings({agentId:q(req,'agentId'),status:q(req,'status'),propertyId:q(req,'propertyId')}))}catch(e){return fail(res,e)}});
router.post('/viewings', async(req,res)=>{try{const b=req.body;if(!b.customerName||!b.customerPhone||!b.date||!b.time)return fail(res,'Customer name, phone, date and time are required.',400);return ok(res,await repository.createViewing({propertyId:b.propertyId||'',propertyTitle:b.propertyTitle||'General Consultation',customerName:b.customerName,customerPhone:b.customerPhone,customerEmail:b.customerEmail||'',agentId:b.agentId||'agent-1',agentName:b.agentName||'Tanmiyat Advisory',date:b.date,time:b.time,location:b.location||'On-site Sales Gallery',status:b.status||'REQUESTED',viewingType:b.viewingType||'PHYSICAL',notes:b.notes},currentActor(req)),201)}catch(e){return fail(res,e)}});
router.patch('/viewings/:id', requireAuth, async(req,res)=>{try{const x=await repository.updateViewingStatus(param(req, 'id'),req.body.status,req.body.notes,currentActor(req));if(!x)return fail(res,'Viewing not found',404);return ok(res,x)}catch(e){return fail(res,e)}});

// Offers
router.get('/offers', requireAuth, async(req,res)=>{try{return ok(res,await repository.getOffers({propertyId:q(req,'propertyId'),agentId:q(req,'agentId'),status:q(req,'status')}))}catch(e){return fail(res,e)}});
router.post('/offers', async(req,res)=>{try{if(!req.body.propertyId||!req.body.offerAmount||!req.body.buyerName)return fail(res,'Property ID, offer amount, and buyer name are required',400);return ok(res,await repository.createOffer(req.body,currentActor(req)),201)}catch(e){return fail(res,e)}});
router.patch('/offers/:id', requireAuth, async(req,res)=>{try{const x=await repository.updateOfferStatus(param(req, 'id'),req.body.status,req.body.notes,currentActor(req));if(!x)return fail(res,'Offer not found',404);return ok(res,x)}catch(e){return fail(res,e)}});

// Deals
router.get('/deals', requireAuth, async(req,res)=>{try{return ok(res,await repository.getDeals({agentId:q(req,'agentId'),status:q(req,'status'),dealType:q(req,'dealType')}))}catch(e){return fail(res,e)}});
router.post('/deals', requireAuth, async(req,res)=>{try{if(!req.body.propertyId||!req.body.dealValue||!req.body.agentId)return fail(res,'Property ID, deal value, and agent ID are required',400);return ok(res,await repository.createDeal(req.body,currentActor(req)),201)}catch(e){return fail(res,e)}});
router.patch('/deals/:id', requireAuth, async(req,res)=>{try{const x=await repository.updateDeal(param(req, 'id'),req.body,currentActor(req));if(!x)return fail(res,'Deal not found',404);return ok(res,x)}catch(e){return fail(res,e)}});

// Commissions
router.get('/commissions', requireAuth, async(req,res)=>{try{return ok(res,await repository.getCommissions({agentId:q(req,'agentId'),status:q(req,'status')}))}catch(e){return fail(res,e)}});
router.patch('/commissions/:id', requireAuth, async(req,res)=>{try{const x=await repository.updateCommissionStatus(param(req, 'id'),req.body.status,req.body.paidDate,currentActor(req));if(!x)return fail(res,'Commission not found',404);return ok(res,x)}catch(e){return fail(res,e)}});
router.patch('/commissions', requireAuth, async(req,res)=>{try{const x=await repository.updateCommissionStatus(req.body.id,req.body.status,req.body.paidDate,currentActor(req));if(!x)return fail(res,'Commission not found',404);return ok(res,x)}catch(e){return fail(res,e)}});

// News / careers / timeline / public content
router.get('/news', async(_req,res)=>{try{return ok(res,await repository.getNews())}catch(e){return fail(res,e)}});
router.get('/news/:slug', async(req,res)=>{try{const x=await repository.getNewsBySlug(param(req, 'slug'));if(!x)return fail(res,'Article not found',404);return ok(res,x)}catch(e){return fail(res,e)}});
router.get('/timeline', async(_req,res)=>{try{return ok(res,await repository.getTimeline())}catch(e){return fail(res,e)}});
router.get('/careers', async(_req,res)=>{try{return ok(res,await repository.getCareers())}catch(e){return fail(res,e)}});

export default router;



