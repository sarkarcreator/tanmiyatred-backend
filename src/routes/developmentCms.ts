import { Router } from 'express';
import { repository } from '@/data/repository';
import { requireAuth } from '@/middleware/auth';
import type { NewsItem, ProjectItem, TimelineItem, UnitItem } from '@/types';

const router = Router();
const ok = (res: any, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const fail = (res: any, error: unknown, status = 500) => res.status(status).json({ success: false, error: error instanceof Error ? error.message : String(error) });
const id = (req: any) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
const actor = (req: any) => req.user?.email || 'admin@tanmiyatrealestate.com';

// Master Projects
router.patch('/projects/:id', requireAuth, async (req, res) => {
  try {
    const updated = await repository.updateProject(id(req), req.body as Partial<ProjectItem>);
    if (!updated) return fail(res, 'Project not found', 404);
    repository.addAuditLog('CMS_UPDATE_PROJECT', 'Project', updated.id, `CMS updated project "${updated.title}"`, actor(req));
    return ok(res, updated);
  } catch (e) { return fail(res, e); }
});

// Inventory Units. The repository already exposes create/read/status update; the CMS
// safely edits the live object returned by getUnitById so changes are persisted by the
// repository proxy. Delete is implemented as a non-public archive by clearing projectId.
router.get('/units', requireAuth, async (_req, res) => {
  try {
    const units = await repository.getAllUnits();
    return ok(res, units.filter((u: UnitItem) => u.projectId));
  } catch (e) { return fail(res, e); }
});
router.get('/units/:id', requireAuth, async (req, res) => {
  try {
    const unit = await repository.getUnitById(id(req));
    if (!unit || !unit.projectId) return fail(res, 'Unit not found', 404);
    return ok(res, unit);
  } catch (e) { return fail(res, e); }
});
router.post('/units', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.projectId || !b.unitNumber || !b.type) return fail(res, 'Project, unit number and type are required.', 400);
    const unit = await repository.createUnit({
      projectId: String(b.projectId), unitNumber: String(b.unitNumber), type: String(b.type),
      bedrooms: Number(b.bedrooms || 0), bathrooms: Number(b.bathrooms || 0), areaSqFt: Number(b.areaSqFt || 0),
      floor: b.floor === '' || b.floor === undefined ? undefined : Number(b.floor), price: Number(b.price || 0),
      currency: b.currency || 'AED', status: b.status || 'AVAILABLE', floorPlanUrl: b.floorPlanUrl || '',
      images: Array.isArray(b.images) ? b.images.filter(Boolean) : [],
    });
    return ok(res, unit, 201);
  } catch (e) { return fail(res, e); }
});
router.patch('/units/:id', requireAuth, async (req, res) => {
  try {
    const unit = await repository.getUnitById(id(req));
    if (!unit || !unit.projectId) return fail(res, 'Unit not found', 404);
    const b = req.body || {};
    Object.assign(unit, {
      ...(b.projectId !== undefined ? { projectId: String(b.projectId) } : {}),
      ...(b.unitNumber !== undefined ? { unitNumber: String(b.unitNumber) } : {}),
      ...(b.type !== undefined ? { type: String(b.type) } : {}),
      ...(b.bedrooms !== undefined ? { bedrooms: Number(b.bedrooms) } : {}),
      ...(b.bathrooms !== undefined ? { bathrooms: Number(b.bathrooms) } : {}),
      ...(b.areaSqFt !== undefined ? { areaSqFt: Number(b.areaSqFt) } : {}),
      ...(b.floor !== undefined ? { floor: b.floor === '' ? undefined : Number(b.floor) } : {}),
      ...(b.price !== undefined ? { price: Number(b.price) } : {}),
      ...(b.currency !== undefined ? { currency: String(b.currency) } : {}),
      ...(b.status !== undefined ? { status: b.status } : {}),
      ...(b.floorPlanUrl !== undefined ? { floorPlanUrl: String(b.floorPlanUrl) } : {}),
      ...(b.images !== undefined ? { images: Array.isArray(b.images) ? b.images.filter(Boolean) : [] } : {}),
    });
    repository.addAuditLog('CMS_UPDATE_UNIT', 'Unit', unit.id, `CMS updated unit ${unit.unitNumber}`, actor(req));
    return ok(res, unit);
  } catch (e) { return fail(res, e); }
});
router.delete('/units/:id', requireAuth, async (req, res) => {
  try {
    const unit = await repository.getUnitById(id(req));
    if (!unit || !unit.projectId) return fail(res, 'Unit not found', 404);
    unit.projectId = '';
    unit.status = 'SOLD';
    repository.addAuditLog('CMS_DELETE_UNIT', 'Unit', unit.id, `Archived unit ${unit.unitNumber} from CMS`, actor(req));
    return ok(res, { deleted: true });
  } catch (e) { return fail(res, e); }
});

// News & Insights
router.post('/news', requireAuth, async (req, res) => {
  try { return ok(res, await repository.createNews(req.body as Omit<NewsItem, 'id'>), 201); }
  catch (e) { return fail(res, e); }
});
router.patch('/news/:id', requireAuth, async (req, res) => {
  try {
    const list = await repository.getNews();
    const current = list.find((n) => n.id === id(req));
    if (!current) return fail(res, 'Article not found', 404);
    const live = await repository.getNewsBySlug(current.slug);
    if (!live) return fail(res, 'Article not found', 404);
    Object.assign(live, req.body);
    repository.addAuditLog('CMS_UPDATE_NEWS', 'News', live.id, `CMS updated article "${live.title}"`, actor(req));
    return ok(res, live);
  } catch (e) { return fail(res, e); }
});
router.delete('/news/:id', requireAuth, async (req, res) => {
  try {
    const list = await repository.getNews();
    const current = list.find((n) => n.id === id(req));
    if (!current) return fail(res, 'Article not found', 404);
    const live = await repository.getNewsBySlug(current.slug);
    if (!live) return fail(res, 'Article not found', 404);
    live.isPublished = false;
    repository.addAuditLog('CMS_DELETE_NEWS', 'News', live.id, `Archived article "${live.title}"`, actor(req));
    return ok(res, { deleted: true });
  } catch (e) { return fail(res, e); }
});

// Heritage Timeline. Elements returned by getTimeline are the repository's proxied
// records, so edits are persisted without introducing a second data store.
router.post('/timeline', requireAuth, async (req, res) => {
  try {
    const b = req.body || {};
    const item: TimelineItem = { id: `timeline-${Date.now()}`, year: Number(b.year), title: b.title || '', titleAr: b.titleAr || '', description: b.description || '', descriptionAr: b.descriptionAr || '', imageUrl: b.imageUrl || '' };
    const list = await repository.getTimeline();
    list.push(item);
    repository.addAuditLog('CMS_CREATE_TIMELINE', 'Timeline', item.id, `Created timeline entry ${item.year}`, actor(req));
    return ok(res, item, 201);
  } catch (e) { return fail(res, e); }
});
router.patch('/timeline/:id', requireAuth, async (req, res) => {
  try {
    const list = await repository.getTimeline();
    const item = list.find((t) => t.id === id(req));
    if (!item) return fail(res, 'Timeline entry not found', 404);
    Object.assign(item, req.body);
    repository.addAuditLog('CMS_UPDATE_TIMELINE', 'Timeline', item.id, `Updated timeline entry ${item.year}`, actor(req));
    return ok(res, item);
  } catch (e) { return fail(res, e); }
});
router.delete('/timeline/:id', requireAuth, async (req, res) => {
  try {
    const list = await repository.getTimeline();
    const item = list.find((t) => t.id === id(req));
    if (!item) return fail(res, 'Timeline entry not found', 404);
    item.year = 0;
    item.title = `[ARCHIVED] ${item.title}`;
    item.titleAr = item.titleAr ? `[ARCHIVED] ${item.titleAr}` : item.titleAr;
    repository.addAuditLog('CMS_DELETE_TIMELINE', 'Timeline', item.id, `Archived timeline entry ${item.id}`, actor(req));
    return ok(res, { deleted: true });
  } catch (e) { return fail(res, e); }
});

export default router;
