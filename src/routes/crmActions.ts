import { Router } from 'express';
import { repository } from '@/data/repository';
import { requireAuth, requireRoles } from '@/middleware/auth';

const router = Router();
const actor = (req: Parameters<typeof requireAuth>[0]) => req.user?.email || 'admin@tanmiyatrealestate.com';
const idOf = (req: { params: Record<string,string|string[]> }, key='id') => { const v=req.params[key]; return Array.isArray(v)?v[0]:v; };
const errorMessage = (e: unknown) => e instanceof Error ? e.message : String(e);

router.delete('/projects/:id', requireAuth, requireRoles('SUPER_ADMIN','ADMIN'), async (req,res)=>{ try { const ok=await repository.deleteProject(idOf(req)); if(!ok)return res.status(404).json({success:false,error:'Project not found'}); return res.json({success:true,data:{deleted:true}}); } catch(e){return res.status(500).json({success:false,error:errorMessage(e)})} });
router.delete('/inquiries/:id', requireAuth, requireRoles('SUPER_ADMIN','ADMIN'), async (req,res)=>{ try { const x=await repository.updateInquiryStatus(idOf(req),'CLOSED_LOST'); if(!x)return res.status(404).json({success:false,error:'Inquiry not found'}); return res.json({success:true,data:x}); } catch(e){return res.status(500).json({success:false,error:errorMessage(e)})} });
router.delete('/leads/:id', requireAuth, requireRoles('SUPER_ADMIN','ADMIN','CRM_MANAGER'), async (req,res)=>{ try { const x=await repository.updateLeadStage(idOf(req),'LOST','Archived by administrator',actor(req)); if(!x)return res.status(404).json({success:false,error:'Lead not found'}); return res.json({success:true,data:x}); } catch(e){return res.status(500).json({success:false,error:errorMessage(e)})} });
router.delete('/viewings/:id', requireAuth, requireRoles('SUPER_ADMIN','ADMIN','CRM_MANAGER'), async (req,res)=>{ try { const x=await repository.updateViewingStatus(idOf(req),'CANCELLED','Cancelled/archived by administrator',actor(req)); if(!x)return res.status(404).json({success:false,error:'Viewing not found'}); return res.json({success:true,data:x}); } catch(e){return res.status(500).json({success:false,error:errorMessage(e)})} });
router.delete('/offers/:id', requireAuth, requireRoles('SUPER_ADMIN','ADMIN','CRM_MANAGER'), async (req,res)=>{ try { const x=await repository.updateOfferStatus(idOf(req),'REJECTED','Archived by administrator',actor(req)); if(!x)return res.status(404).json({success:false,error:'Offer not found'}); return res.json({success:true,data:x}); } catch(e){return res.status(500).json({success:false,error:errorMessage(e)})} });
router.delete('/deals/:id', requireAuth, requireRoles('SUPER_ADMIN','ADMIN'), async (req,res)=>{ try { const x=await repository.updateDeal(idOf(req),{stage:'CANCELLED',status:'OPEN'},actor(req)); if(!x)return res.status(404).json({success:false,error:'Deal not found'}); return res.json({success:true,data:x}); } catch(e){return res.status(500).json({success:false,error:errorMessage(e)})} });
router.delete('/commissions/:id', requireAuth, requireRoles('SUPER_ADMIN','ADMIN'), async (req,res)=>{ try { const x=await repository.updateCommissionStatus(idOf(req),'PENDING_APPROVAL',undefined,actor(req)); if(!x)return res.status(404).json({success:false,error:'Commission not found'}); return res.json({success:true,data:x}); } catch(e){return res.status(500).json({success:false,error:errorMessage(e)})} });

export default router;
