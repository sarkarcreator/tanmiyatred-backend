import mysql, { Pool } from 'mysql2/promise';
import {
  ProjectItem, UnitItem, InquiryItem, NewsItem, CareerItem, TimelineItem,
  PaymentItem, SiteSettings, AuditLogItem, JobApplicationItem, PropertyItem,
  ListingItem, AgentItem, OwnerItem, CustomerItem, LeadItem, ViewingItem,
  OfferItem, DealItem, CommissionItem, DocumentRecord,
} from '@/types';
import {
  initialProjects, initialUnits, initialTimeline, initialInquiries, initialNews,
  initialCareers, initialPayments, initialAuditLogs, initialSiteSettings,
  initialAgents, initialProperties, initialListings, initialOwners,
  initialCustomers, initialLeads, initialViewings, initialOffers, initialDeals,
  initialCommissions, initialDocuments,
} from './initialData';

export interface StoreState {
  projects: ProjectItem[];
  units: UnitItem[];
  timeline: TimelineItem[];
  inquiries: InquiryItem[];
  news: NewsItem[];
  careers: CareerItem[];
  jobApplications: JobApplicationItem[];
  payments: PaymentItem[];
  auditLogs: AuditLogItem[];
  settings: SiteSettings;
  properties: PropertyItem[];
  listings: ListingItem[];
  agents: AgentItem[];
  owners: OwnerItem[];
  customers: CustomerItem[];
  leads: LeadItem[];
  viewings: ViewingItem[];
  offers: OfferItem[];
  deals: DealItem[];
  commissions: CommissionItem[];
  documents: DocumentRecord[];
}

const pool: Pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

let store: StoreState | undefined;
let persistTimer: ReturnType<typeof setTimeout> | undefined;
let persistChain: Promise<void> = Promise.resolve();
let initialized = false;

const createInitialState = (): StoreState => ({
  projects: [...initialProjects], units: [...initialUnits], timeline: [...initialTimeline],
  inquiries: [...initialInquiries], news: [...initialNews], careers: [...initialCareers],
  jobApplications: [], payments: [...initialPayments], auditLogs: [...initialAuditLogs],
  settings: { ...initialSiteSettings }, properties: [...initialProperties],
  listings: [...initialListings], agents: [...initialAgents], owners: [...initialOwners],
  customers: [...initialCustomers], leads: [...initialLeads], viewings: [...initialViewings],
  offers: [...initialOffers], deals: [...initialDeals], commissions: [...initialCommissions],
  documents: [...initialDocuments],
});

function markDirty() {
  if (!initialized || !store) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = undefined;
    persistChain = persistChain.then(() => persistNow()).catch((err) => console.error('[Tanmiyat DB] Persist failed:', err));
  }, 100);
}

function deepProxy<T extends object>(value: T): T {
  return new Proxy(value, {
    get(target, prop, receiver) {
      const result = Reflect.get(target, prop, receiver);
      if (result && typeof result === 'object' && !((result as any).__tanmiyatProxy)) {
        const proxied = deepProxy(result as object);
        try { Object.defineProperty(proxied, '__tanmiyatProxy', { value: true, enumerable: false }); } catch {}
        Reflect.set(target, prop, proxied, receiver);
        return proxied;
      }
      if (typeof result === 'function' && Array.isArray(target) && ['push','pop','shift','unshift','splice','sort','reverse'].includes(String(prop))) {
        return (...args: unknown[]) => {
          const out = (result as Function).apply(target, args);
          markDirty();
          return out;
        };
      }
      return result;
    },
    set(target, prop, val, receiver) {
      const ok = Reflect.set(target, prop, val, receiver);
      markDirty();
      return ok;
    },
    deleteProperty(target, prop) {
      const ok = Reflect.deleteProperty(target, prop);
      markDirty();
      return ok;
    },
  }) as T;
}

async function persistNow() {
  if (!store) return;
  const json = JSON.stringify(store);
  await pool.execute(
    `INSERT INTO tanmiyat_app_state (id, state_json, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE state_json = VALUES(state_json), updated_at = CURRENT_TIMESTAMP`,
    [json],
  );
}

export async function initRepository() {
  if (initialized) return;
  await pool.execute(`CREATE TABLE IF NOT EXISTS tanmiyat_app_state (
    id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    state_json LONGTEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  const [rows] = await pool.query<any[]>(`SELECT state_json FROM tanmiyat_app_state WHERE id = 1 LIMIT 1`);
  let state: StoreState;
  if (rows.length && rows[0].state_json) {
    state = JSON.parse(rows[0].state_json) as StoreState;
  } else {
    state = createInitialState();
    await pool.execute(`INSERT INTO tanmiyat_app_state (id, state_json) VALUES (1, ?)`, [JSON.stringify(state)]);
  }
  store = deepProxy(state);
  initialized = true;
}

export async function closeRepository() {
  if (persistTimer) clearTimeout(persistTimer);
  await persistChain;
  await pool.end();
}

function getStore(): StoreState {
  if (!store) throw new Error('Repository not initialized. Call initRepository() before starting the API server.');
  return store;
}

export const repository = {
  // PROJECTS
  async getProjects(filter?: { category?: string; status?: string }): Promise<ProjectItem[]> {
    const store = getStore();
    let list = [...store.projects];
    if (filter?.category && filter.category !== 'ALL') {
      list = list.filter((p) => p.category === filter.category);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((p) => p.status === filter.status);
    }
    return list.sort((a, b) => a.order - b.order);
  },

  async getProjectBySlug(slug: string): Promise<ProjectItem | null> {
    const store = getStore();
    const proj = store.projects.find((p) => p.slug === slug);
    if (!proj) return null;
    const projectUnits = store.units.filter((u) => u.projectId === proj.id);
    return {
      ...proj,
      units: projectUnits,
    };
  },

  async getProjectById(id: string): Promise<ProjectItem | null> {
    const store = getStore();
    return store.projects.find((p) => p.id === id) || null;
  },

  async createProject(data: Omit<ProjectItem, 'id'>): Promise<ProjectItem> {
    const store = getStore();
    const id = `proj-${Date.now()}`;
    const newProject: ProjectItem = {
      ...data,
      id,
      order: store.projects.length + 1,
    };
    store.projects.push(newProject);
    this.addAuditLog('CREATE_PROJECT', 'Project', id, `Created project "${newProject.title}"`);
    return newProject;
  },

  async updateProject(id: string, updates: Partial<ProjectItem>): Promise<ProjectItem | null> {
    const store = getStore();
    const index = store.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    store.projects[index] = { ...store.projects[index], ...updates };
    this.addAuditLog('UPDATE_PROJECT', 'Project', id, `Updated project "${store.projects[index].title}"`);
    return store.projects[index];
  },

  async deleteProject(id: string): Promise<boolean> {
    const store = getStore();
    const initialLen = store.projects.length;
    store.projects = store.projects.filter((p) => p.id !== id);
    if (store.projects.length !== initialLen) {
      this.addAuditLog('DELETE_PROJECT', 'Project', id, `Deleted project with ID ${id}`);
      return true;
    }
    return false;
  },

  // UNITS
  async getUnitsByProject(projectId: string): Promise<UnitItem[]> {
    const store = getStore();
    return store.units.filter((u) => u.projectId === projectId);
  },

  async getAllUnits(): Promise<UnitItem[]> {
    const store = getStore();
    return [...store.units];
  },

  async getUnitById(id: string): Promise<UnitItem | null> {
    const store = getStore();
    return store.units.find((u) => u.id === id) || null;
  },

  async updateUnitStatus(id: string, status: UnitItem['status']): Promise<UnitItem | null> {
    const store = getStore();
    const unit = store.units.find((u) => u.id === id);
    if (!unit) return null;
    unit.status = status;
    this.addAuditLog('UPDATE_UNIT_STATUS', 'Unit', id, `Updated unit ${unit.unitNumber} status to ${status}`);
    return unit;
  },

  async createUnit(data: Omit<UnitItem, 'id'>): Promise<UnitItem> {
    const store = getStore();
    const id = `unit-${Date.now()}`;
    const newUnit: UnitItem = { ...data, id };
    store.units.push(newUnit);
    this.addAuditLog('CREATE_UNIT', 'Unit', id, `Created unit ${newUnit.unitNumber}`);
    return newUnit;
  },

  // INQUIRIES
  async getInquiries(): Promise<InquiryItem[]> {
    const store = getStore();
    return [...store.inquiries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async createInquiry(data: Omit<InquiryItem, 'id' | 'status' | 'createdAt'>): Promise<InquiryItem> {
    const store = getStore();
    const id = `inq-${Date.now()}`;
    const newInquiry: InquiryItem = {
      ...data,
      id,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    store.inquiries.unshift(newInquiry);
    this.addAuditLog(
      'NEW_INQUIRY',
      'Inquiry',
      id,
      `Inquiry from ${newInquiry.name} (${newInquiry.email}) for ${newInquiry.interestedProject || 'General'}`
    );
    return newInquiry;
  },

  async updateInquiryStatus(id: string, status: InquiryItem['status'], notes?: string): Promise<InquiryItem | null> {
    const store = getStore();
    const item = store.inquiries.find((i) => i.id === id);
    if (!item) return null;
    item.status = status;
    if (notes !== undefined) item.notes = notes;
    this.addAuditLog('UPDATE_INQUIRY_STATUS', 'Inquiry', id, `Changed inquiry status to ${status}`);
    return item;
  },

  // NEWS
  async getNews(): Promise<NewsItem[]> {
    const store = getStore();
    return [...store.news].sort(
      (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );
  },

  async getNewsBySlug(slug: string): Promise<NewsItem | null> {
    const store = getStore();
    return store.news.find((n) => n.slug === slug) || null;
  },

  async createNews(data: Omit<NewsItem, 'id'>): Promise<NewsItem> {
    const store = getStore();
    const id = `news-${Date.now()}`;
    const item: NewsItem = { ...data, id };
    store.news.unshift(item);
    this.addAuditLog('CREATE_NEWS', 'News', id, `Published article "${item.title}"`);
    return item;
  },

  // CAREERS
  async getCareers(): Promise<CareerItem[]> {
    const store = getStore();
    return [...store.careers].filter((c) => c.isActive);
  },

  async getAllCareersAdmin(): Promise<CareerItem[]> {
    const store = getStore();
    return [...store.careers];
  },

  async getCareerBySlug(slug: string): Promise<CareerItem | null> {
    const store = getStore();
    return store.careers.find((c) => c.slug === slug) || null;
  },

  async submitJobApplication(
    data: Omit<JobApplicationItem, 'id' | 'createdAt'>
  ): Promise<JobApplicationItem> {
    const store = getStore();
    const id = `app-${Date.now()}`;
    const application: JobApplicationItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    store.jobApplications.unshift(application);
    this.addAuditLog(
      'JOB_APPLICATION',
      'Career',
      application.careerId,
      `Application from ${application.name} for ${application.careerTitle}`
    );
    return application;
  },

  async getJobApplications(): Promise<JobApplicationItem[]> {
    const store = getStore();
    return [...store.jobApplications];
  },

  // TIMELINE
  async getTimeline(): Promise<TimelineItem[]> {
    const store = getStore();
    return [...store.timeline].sort((a, b) => a.year - b.year);
  },

  // PAYMENTS
  async getPayments(): Promise<PaymentItem[]> {
    const store = getStore();
    return [...store.payments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async recordPayment(data: Omit<PaymentItem, 'id' | 'createdAt'>): Promise<PaymentItem> {
    const store = getStore();
    const id = `pay-${Date.now()}`;
    const payment: PaymentItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    store.payments.unshift(payment);
    this.addAuditLog(
      'PAYMENT_RECORDED',
      'Payment',
      id,
      `Received payment of ${payment.amount} ${payment.currency} via ${payment.provider}`
    );
    return payment;
  },

  // SETTINGS
  async getSettings(): Promise<SiteSettings> {
    const store = getStore();
    return { ...store.settings };
  },

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const store = getStore();
    store.settings = { ...store.settings, ...updates };
    this.addAuditLog('UPDATE_SETTINGS', 'SiteSettings', 'global', 'Updated site configuration');
    return store.settings;
  },

  // AUDIT LOGS
  async getAuditLogs(): Promise<AuditLogItem[]> {
    const store = getStore();
    return [...store.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  addAuditLog(action: string, entity: string, entityId?: string, details?: string, userEmail = 'system@tanmiyatrealestate.com') {
    const store = getStore();
    store.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      entity,
      entityId,
      userEmail,
      timestamp: new Date().toISOString(),
      details,
    });
    // Keep max 200 logs
    if (store.auditLogs.length > 200) {
      store.auditLogs = store.auditLogs.slice(0, 200);
    }
  },

  // DASHBOARD STATS
  async getDashboardStats() {
    const store = getStore();
    const totalProjects = store.projects.length;
    const activeProjects = store.projects.filter((p) => p.status === 'ONGOING' || p.status === 'UPCOMING').length;
    const totalUnits = store.units.length;
    const availableUnits = store.units.filter((u) => u.status === 'AVAILABLE').length;
    const totalInquiries = store.inquiries.length;
    const newInquiries = store.inquiries.filter((i) => i.status === 'NEW').length;
    const totalRevenue = store.payments
      .filter((p) => p.status === 'SUCCEEDED')
      .reduce((sum, p) => sum + p.amount, 0);

    const availableUnitsValueAed = store.units
      .filter((u) => u.status === 'AVAILABLE')
      .reduce((sum, u) => sum + (u.price || 0), 0);

    // Marketplace & CRM Metrics
    const totalProperties = store.properties.length;
    const activeListings = store.properties.filter(
      (p) => p.workflowStatus === 'PUBLISHED' && p.status === 'AVAILABLE'
    ).length;
    const forSaleCount = store.properties.filter(
      (p) => (p.purpose === 'FOR_SALE' || p.purpose === 'FOR_BUY' || p.purpose === 'FOR_INVESTMENT') && p.status === 'AVAILABLE'
    ).length;
    const forRentCount = store.properties.filter(
      (p) => p.purpose === 'FOR_RENT' && p.status === 'AVAILABLE'
    ).length;

    const totalLeads = store.leads.length;
    const newLeads = store.leads.filter((l) => l.stage === 'NEW').length;
    const qualifiedLeads = store.leads.filter((l) => l.stage === 'QUALIFIED').length;
    const viewingLeads = store.leads.filter((l) => l.stage === 'VIEWING_BOOKED').length;
    const negotiationLeads = store.leads.filter((l) => l.stage === 'NEGOTIATION').length;
    const wonLeads = store.leads.filter((l) => l.stage === 'WON').length;

    const totalViewings = store.viewings.length;
    const upcomingViewings = store.viewings.filter(
      (v) => v.status === 'CONFIRMED' || v.status === 'REQUESTED'
    ).length;

    const totalOffers = store.offers.length;
    const activeOffers = store.offers.filter(
      (o) => o.status === 'SUBMITTED' || o.status === 'COUNTERED'
    ).length;

    const totalDeals = store.deals.length;
    const openDeals = store.deals.filter(
      (d) => d.status === 'OPEN' || d.status === 'NEGOTIATION' || d.status === 'CONTRACT'
    ).length;
    const closedDeals = store.deals.filter((d) => d.status === 'COMPLETED').length;
    const totalDealValue = store.deals
      .filter((d) => d.status === 'COMPLETED')
      .reduce((sum, d) => sum + (d.dealValue ?? d.finalPrice ?? 0), 0);

    const totalCommissions = store.commissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingCommissions = store.commissions
      .filter((c) => c.status === 'PENDING' || c.status === 'APPROVED')
      .reduce((sum, c) => sum + c.amount, 0);
    const paidCommissions = store.commissions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0);

    const activeAgentsCount = store.agents.filter((a) => a.status === 'ACTIVE').length;

    return {
      totalProjects,
      activeProjects,
      totalUnits,
      availableUnits,
      activeUnits: availableUnits,
      totalInquiries,
      newInquiries,
      totalPayments: store.payments.length,
      totalRevenue,
      availableUnitsValueAed,
      // Luxury CRM Metrics
      totalProperties,
      activeListings,
      forSaleCount,
      forRentCount,
      totalLeads,
      newLeads,
      qualifiedLeads,
      viewingLeads,
      negotiationLeads,
      wonLeads,
      totalViewings,
      upcomingViewings,
      totalOffers,
      activeOffers,
      totalDeals,
      openDeals,
      closedDeals,
      totalDealValue,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      activeAgentsCount,
      currency: 'AED',
      lastUpdated: new Date().toISOString(),
    };
  },

  // ==========================================
  // PROPERTIES MODULE
  // ==========================================
  async getProperties(params?: {
    purpose?: string;
    location?: string;
    community?: string;
    propertyType?: string;
    bedrooms?: number | string;
    bathrooms?: number | string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    furnished?: string;
    developer?: string;
    amenities?: string[];
    search?: string;
    sort?: string;
    status?: string;
    workflowStatus?: string;
    agentId?: string;
    isPublic?: boolean;
    page?: number;
    limit?: number;
  }) {
    const store = getStore();
    let list = [...store.properties];

    // Public marketplace enforcement: only approved/published listings
    if (params?.isPublic) {
      list = list.filter((p) => p.workflowStatus === 'PUBLISHED' || p.workflowStatus === 'APPROVED');
    }

    if (params?.purpose && params.purpose !== 'ALL') {
      const pur = params.purpose.toUpperCase();
      if (pur === 'BUY' || pur === 'SALE' || pur === 'FOR_SALE') {
        list = list.filter((p) => p.purpose === 'FOR_SALE' || p.purpose === 'FOR_BUY' || p.purpose === 'FOR_INVESTMENT');
      } else if (pur === 'RENT' || pur === 'FOR_RENT') {
        list = list.filter((p) => p.purpose === 'FOR_RENT');
      } else {
        list = list.filter((p) => p.purpose === pur);
      }
    }

    if (params?.community && params.community !== 'ALL') {
      const target = params.community.toLowerCase();
      list = list.filter(
        (p) =>
          p.community.toLowerCase().includes(target) ||
          (p.subCommunity && p.subCommunity.toLowerCase().includes(target))
      );
    }

    if (params?.propertyType && params.propertyType !== 'ALL') {
      list = list.filter((p) => p.propertyType.toLowerCase() === params.propertyType?.toLowerCase());
    }

    if (params?.bedrooms !== undefined && params.bedrooms !== 'ALL') {
      const beds = Number(params.bedrooms);
      if (!isNaN(beds)) {
        list = list.filter((p) => p.bedrooms >= beds);
      }
    }

    if (params?.bathrooms !== undefined && params.bathrooms !== 'ALL') {
      const baths = Number(params.bathrooms);
      if (!isNaN(baths)) {
        list = list.filter((p) => p.bathrooms >= baths);
      }
    }

    if (params?.minPrice !== undefined && !isNaN(params.minPrice)) {
      list = list.filter((p) => p.price >= (params.minPrice || 0));
    }

    if (params?.maxPrice !== undefined && !isNaN(params.maxPrice) && params.maxPrice > 0) {
      list = list.filter((p) => p.price <= (params.maxPrice || Infinity));
    }

    if (params?.furnished && params.furnished !== 'ALL') {
      list = list.filter((p) => p.furnished === params.furnished);
    }

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((p) => p.status === params.status);
    }

    if (params?.workflowStatus && params.workflowStatus !== 'ALL') {
      list = list.filter((p) => p.workflowStatus === params.workflowStatus);
    }

    if (params?.agentId && params.agentId !== 'ALL') {
      list = list.filter((p) => p.agentId === params.agentId);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.referenceNumber.toLowerCase().includes(q) ||
          p.community.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.developer.toLowerCase().includes(q)
      );
    }

    // Attach agent object if missing
    list = list.map((p) => {
      const agent = store.agents.find((a) => a.id === p.agentId);
      return { ...p, agent };
    });

    // Sorting
    const sort = params?.sort || 'newest';
    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'area') {
      list.sort((a, b) => b.area - a.area);
    } else if (sort === 'featured') {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Pagination
    const total = list.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 12);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      properties: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  },

  async getPropertyBySlug(slug: string): Promise<PropertyItem | null> {
    const store = getStore();
    const prop = store.properties.find((p) => p.slug === slug);
    if (!prop) return null;
    const agent = store.agents.find((a) => a.id === prop.agentId);
    const owner = store.owners.find((o) => o.id === prop.ownerId);
    const listings = store.listings.filter((l) => l.propertyId === prop.id);
    return {
      ...prop,
      agent,
      owner,
      listings,
    };
  },

  async getPropertyById(id: string): Promise<PropertyItem | null> {
    const store = getStore();
    const prop = store.properties.find((p) => p.id === id);
    if (!prop) return null;
    const agent = store.agents.find((a) => a.id === prop.agentId);
    const owner = store.owners.find((o) => o.id === prop.ownerId);
    const listings = store.listings.filter((l) => l.propertyId === prop.id);
    return {
      ...prop,
      agent,
      owner,
      listings,
    };
  },

  async createProperty(
    data: Omit<PropertyItem, 'id' | 'createdAt' | 'updatedAt'>,
    userEmail = 'admin@tanmiyatrealestate.com'
  ): Promise<PropertyItem> {
    const store = getStore();
    const id = `prop-${Date.now()}`;
    const referenceNumber = data.referenceNumber || `TAN-DXB-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newProperty: PropertyItem = {
      ...data,
      id,
      referenceNumber,
      createdAt: now,
      updatedAt: now,
    };

    store.properties.unshift(newProperty);

    // Create default listing entry
    const listingId = `list-${Date.now()}`;
    const newListing: ListingItem = {
      id: listingId,
      propertyId: id,
      purpose: newProperty.purpose === 'FOR_RENT' ? 'FOR_RENT' : 'FOR_SALE',
      price: newProperty.price,
      currency: newProperty.currency,
      rentalPeriod: newProperty.rentalPeriod,
      status: newProperty.workflowStatus === 'PUBLISHED' ? 'ACTIVE' : 'PENDING_APPROVAL',
      agentId: newProperty.agentId,
      permitNumber: newProperty.advertisingPermitNumber,
      permitExpiry: newProperty.permitExpiryDate,
      publishedAt: newProperty.workflowStatus === 'PUBLISHED' ? now : undefined,
      featured: newProperty.featured,
      createdBy: userEmail,
      updatedBy: userEmail,
    };
    store.listings.unshift(newListing);

    this.addAuditLog('CREATE_PROPERTY', 'Property', id, `Added property "${newProperty.title}" (${referenceNumber})`, userEmail);
    return newProperty;
  },

  async updateProperty(
    id: string,
    updates: Partial<PropertyItem>,
    userEmail = 'admin@tanmiyatrealestate.com'
  ): Promise<PropertyItem | null> {
    const store = getStore();
    const index = store.properties.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = store.properties[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    store.properties[index] = updated;
    this.addAuditLog('UPDATE_PROPERTY', 'Property', id, `Updated property "${updated.title}"`, userEmail);
    return updated;
  },

  async duplicateProperty(id: string, userEmail = 'admin@tanmiyatrealestate.com'): Promise<PropertyItem | null> {
    const original = await this.getPropertyById(id);
    if (!original) return null;

    const copyData: Omit<PropertyItem, 'id' | 'createdAt' | 'updatedAt'> = {
      ...original,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      referenceNumber: `TAN-DXB-${Math.floor(1000 + Math.random() * 9000)}`,
      workflowStatus: 'DRAFT',
      status: 'AVAILABLE',
      verificationStatus: 'PENDING_VERIFICATION',
      verified: false,
    };

    return this.createProperty(copyData, userEmail);
  },

  async updatePropertyWorkflow(
    id: string,
    workflowStatus: PropertyItem['workflowStatus'],
    userEmail = 'admin@tanmiyatrealestate.com'
  ): Promise<PropertyItem | null> {
    const store = getStore();
    const prop = store.properties.find((p) => p.id === id);
    if (!prop) return null;

    prop.workflowStatus = workflowStatus;
    if (workflowStatus === 'PUBLISHED') {
      prop.verified = true;
      prop.verificationStatus = 'VERIFIED';
    }
    prop.updatedAt = new Date().toISOString();

    this.addAuditLog('WORKFLOW_CHANGE', 'Property', id, `Changed workflow to ${workflowStatus}`, userEmail);
    return prop;
  },

  async deleteProperty(id: string, userEmail = 'admin@tanmiyatrealestate.com'): Promise<boolean> {
    const store = getStore();
    const initialLen = store.properties.length;
    store.properties = store.properties.filter((p) => p.id !== id);
    if (store.properties.length !== initialLen) {
      this.addAuditLog('DELETE_PROPERTY', 'Property', id, `Deleted property with ID ${id}`, userEmail);
      return true;
    }
    return false;
  },

  // ==========================================
  // LISTINGS MODULE
  // ==========================================
  async getListings(filter?: { propertyId?: string; purpose?: string; status?: string; agentId?: string }) {
    const store = getStore();
    let list = [...store.listings];
    if (filter?.propertyId) list = list.filter((l) => l.propertyId === filter.propertyId);
    if (filter?.purpose) list = list.filter((l) => l.purpose === filter.purpose);
    if (filter?.status) list = list.filter((l) => l.status === filter.status);
    if (filter?.agentId) list = list.filter((l) => l.agentId === filter.agentId);
    return list;
  },

  async createListing(data: Omit<ListingItem, 'id'>): Promise<ListingItem> {
    const store = getStore();
    const id = `list-${Date.now()}`;
    const listing: ListingItem = { ...data, id };
    store.listings.unshift(listing);
    this.addAuditLog('CREATE_LISTING', 'Listing', id, `Created listing for property ${data.propertyId}`);
    return listing;
  },

  // ==========================================
  // AGENTS MODULE
  // ==========================================
  async getAgents(filter?: { status?: string; area?: string; featured?: boolean }): Promise<AgentItem[]> {
    const store = getStore();
    let list = [...store.agents];
    if (filter?.status) list = list.filter((a) => a.status === filter.status);
    if (filter?.featured !== undefined) list = list.filter((a) => a.featured === filter.featured);
    if (filter?.area) list = list.filter((a) => a.areas.some((ar) => ar.toLowerCase().includes(filter.area!.toLowerCase())));
    return list;
  },

  async getAgentBySlug(slug: string): Promise<{ agent: AgentItem; properties: PropertyItem[] } | null> {
    const store = getStore();
    const agent = store.agents.find((a) => a.slug === slug);
    if (!agent) return null;
    const properties = store.properties.filter(
      (p) => p.agentId === agent.id && (p.workflowStatus === 'PUBLISHED' || p.workflowStatus === 'APPROVED')
    );
    return { agent, properties };
  },

  async getAgentById(id: string): Promise<AgentItem | null> {
    const store = getStore();
    return store.agents.find((a) => a.id === id) || null;
  },

  async createAgent(data: Omit<AgentItem, 'id'>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<AgentItem> {
    const store = getStore();
    const id = `agent-${Date.now()}`;
    const newAgent: AgentItem = { ...data, id };
    store.agents.unshift(newAgent);
    this.addAuditLog('CREATE_AGENT', 'Agent', id, `Created agent ${newAgent.name} (BRN: ${newAgent.brn})`, userEmail);
    return newAgent;
  },

  async updateAgent(id: string, updates: Partial<AgentItem>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<AgentItem | null> {
    const store = getStore();
    const index = store.agents.findIndex((a) => a.id === id);
    if (index === -1) return null;
    store.agents[index] = { ...store.agents[index], ...updates };
    this.addAuditLog('UPDATE_AGENT', 'Agent', id, `Updated agent ${store.agents[index].name}`, userEmail);
    return store.agents[index];
  },

  // ==========================================
  // OWNERS MODULE
  // ==========================================
  async getOwners(): Promise<OwnerItem[]> {
    const store = getStore();
    return [...store.owners];
  },

  async getOwnerById(id: string): Promise<OwnerItem | null> {
    const store = getStore();
    return store.owners.find((o) => o.id === id) || null;
  },

  async createOwner(data: Omit<OwnerItem, 'id' | 'createdAt'>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<OwnerItem> {
    const store = getStore();
    const id = `owner-${Date.now()}`;
    const owner: OwnerItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    store.owners.unshift(owner);
    this.addAuditLog('CREATE_OWNER', 'Owner', id, `Added owner "${owner.name}"`, userEmail);
    return owner;
  },

  async updateOwner(id: string, updates: Partial<OwnerItem>): Promise<OwnerItem | null> {
    const store = getStore();
    const index = store.owners.findIndex((o) => o.id === id);
    if (index === -1) return null;
    store.owners[index] = { ...store.owners[index], ...updates };
    return store.owners[index];
  },

  // ==========================================
  // CUSTOMERS MODULE (Buyers / Tenants CRM)
  // ==========================================
  async getCustomers(filter?: { type?: string; agentId?: string }): Promise<CustomerItem[]> {
    const store = getStore();
    let list = [...store.customers];
    if (filter?.type) list = list.filter((c) => c.type === filter.type);
    if (filter?.agentId) list = list.filter((c) => c.assignedAgentId === filter.agentId);
    return list;
  },

  async createCustomer(data: Omit<CustomerItem, 'id' | 'createdAt'>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<CustomerItem> {
    const store = getStore();
    const id = `cust-${Date.now()}`;
    const customer: CustomerItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    store.customers.unshift(customer);
    this.addAuditLog('CREATE_CUSTOMER', 'Customer', id, `Registered customer "${customer.name}" (${customer.type})`, userEmail);
    return customer;
  },

  // ==========================================
  // LEADS & KANBAN CRM PIPELINE
  // ==========================================
  async getLeads(filter?: { stage?: string; priority?: string; agentId?: string; source?: string; search?: string }): Promise<LeadItem[]> {
    const store = getStore();
    let list = [...store.leads];
    if (filter?.stage && filter.stage !== 'ALL') list = list.filter((l) => l.stage === filter.stage);
    if (filter?.priority && filter.priority !== 'ALL') list = list.filter((l) => l.priority === filter.priority);
    if (filter?.agentId && filter.agentId !== 'ALL') list = list.filter((l) => l.agentId === filter.agentId);
    if (filter?.source && filter.source !== 'ALL') list = list.filter((l) => l.source === filter.source);
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.customerName.toLowerCase().includes(q) ||
          l.customerEmail.toLowerCase().includes(q) ||
          l.customerPhone.toLowerCase().includes(q) ||
          (l.propertyTitle && l.propertyTitle.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getLeadById(id: string): Promise<LeadItem | null> {
    const store = getStore();
    return store.leads.find((l) => l.id === id) || null;
  },

  async createLead(
    data: Omit<LeadItem, 'id' | 'activityHistory' | 'createdAt' | 'updatedAt'>,
    initialNote?: string,
    userEmail = 'system@tanmiyatrealestate.com'
  ): Promise<LeadItem> {
    const store = getStore();
    const id = `lead-${Date.now()}`;
    const now = new Date().toISOString();
    const lead: LeadItem = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      activityHistory: [
        {
          id: `act-${Date.now()}`,
          action: 'LEAD_CREATED',
          note: initialNote || `Lead registered via ${data.source}.`,
          timestamp: now,
          userEmail,
        },
      ],
    };
    store.leads.unshift(lead);
    this.addAuditLog('CREATE_LEAD', 'Lead', id, `Lead created for ${lead.customerName} (${lead.stage})`, userEmail);
    return lead;
  },

  async updateLeadStage(
    id: string,
    newStage: LeadItem['stage'],
    note?: string,
    userEmail = 'admin@tanmiyatrealestate.com'
  ): Promise<LeadItem | null> {
    const store = getStore();
    const lead = store.leads.find((l) => l.id === id);
    if (!lead) return null;

    const oldStage = lead.stage;
    lead.stage = newStage;
    const now = new Date().toISOString();
    lead.updatedAt = now;

    lead.activityHistory.unshift({
      id: `act-${Date.now()}`,
      action: 'STAGE_CHANGED',
      note: note || `Moved stage from ${oldStage} to ${newStage}`,
      timestamp: now,
      userEmail,
    });

    this.addAuditLog('UPDATE_LEAD_STAGE', 'Lead', id, `Moved lead stage ${oldStage} -> ${newStage}`, userEmail);
    return lead;
  },

  async updateLead(id: string, updates: Partial<LeadItem>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<LeadItem | null> {
    const store = getStore();
    const index = store.leads.findIndex((l) => l.id === id);
    if (index === -1) return null;
    store.leads[index] = {
      ...store.leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.addAuditLog('UPDATE_LEAD', 'Lead', id, `Updated lead for ${store.leads[index].customerName}`, userEmail);
    return store.leads[index];
  },

  // ==========================================
  // VIEWINGS & CALENDAR
  // ==========================================
  async getViewings(filter?: { agentId?: string; status?: string; propertyId?: string }): Promise<ViewingItem[]> {
    const store = getStore();
    let list = [...store.viewings];
    if (filter?.agentId && filter.agentId !== 'ALL') list = list.filter((v) => v.agentId === filter.agentId);
    if (filter?.status && filter.status !== 'ALL') list = list.filter((v) => v.status === filter.status);
    if (filter?.propertyId) list = list.filter((v) => v.propertyId === filter.propertyId);
    return list.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  },

  async createViewing(data: Omit<ViewingItem, 'id' | 'createdAt'>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<ViewingItem> {
    const store = getStore();
    const id = `viewing-${Date.now()}`;
    const viewing: ViewingItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    store.viewings.unshift(viewing);
    this.addAuditLog('SCHEDULE_VIEWING', 'Viewing', id, `Booked viewing for ${viewing.customerName} on ${viewing.date} at ${viewing.time}`, userEmail);
    return viewing;
  },

  async updateViewingStatus(id: string, status: ViewingItem['status'], notes?: string, userEmail = 'admin@tanmiyatrealestate.com'): Promise<ViewingItem | null> {
    const store = getStore();
    const viewing = store.viewings.find((v) => v.id === id);
    if (!viewing) return null;
    viewing.status = status;
    if (notes) viewing.notes = notes;
    this.addAuditLog('UPDATE_VIEWING', 'Viewing', id, `Changed viewing status to ${status}`, userEmail);
    return viewing;
  },

  // ==========================================
  // OFFERS MODULE
  // ==========================================
  async getOffers(filter?: { propertyId?: string; agentId?: string; status?: string }): Promise<OfferItem[]> {
    const store = getStore();
    let list = [...store.offers];
    if (filter?.propertyId) list = list.filter((o) => o.propertyId === filter.propertyId);
    if (filter?.agentId) list = list.filter((o) => o.agentId === filter.agentId);
    if (filter?.status) list = list.filter((o) => o.status === filter.status);
    return list;
  },

  async createOffer(data: Omit<OfferItem, 'id' | 'createdAt'>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<OfferItem> {
    const store = getStore();
    const id = `offer-${Date.now()}`;
    const offer: OfferItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    store.offers.unshift(offer);
    this.addAuditLog('CREATE_OFFER', 'Offer', id, `Submitted offer of ${offer.offerAmount} ${offer.currency} by ${offer.buyerName}`, userEmail);
    return offer;
  },

  async updateOfferStatus(id: string, status: OfferItem['status'], notes?: string, userEmail = 'admin@tanmiyatrealestate.com'): Promise<OfferItem | null> {
    const store = getStore();
    const offer = store.offers.find((o) => o.id === id);
    if (!offer) return null;
    offer.status = status;
    if (notes) offer.notes = notes;
    this.addAuditLog('UPDATE_OFFER', 'Offer', id, `Offer updated to status ${status}`, userEmail);
    return offer;
  },

  // ==========================================
  // DEALS MODULE
  // ==========================================
  async getDeals(filter?: { agentId?: string; status?: string; dealType?: string }): Promise<DealItem[]> {
    const store = getStore();
    let list = [...store.deals];
    if (filter?.agentId && filter.agentId !== 'ALL') list = list.filter((d) => d.agentId === filter.agentId);
    if (filter?.status && filter.status !== 'ALL') list = list.filter((d) => d.status === filter.status);
    if (filter?.dealType && filter.dealType !== 'ALL') list = list.filter((d) => d.dealType === filter.dealType);
    return list;
  },

  async createDeal(data: Omit<DealItem, 'id' | 'createdAt'>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<DealItem> {
    const store = getStore();
    const id = `deal-${Date.now()}`;
    const deal: DealItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    store.deals.unshift(deal);

    // Auto-create Commission
    const commId = `comm-${Date.now()}`;
    const dealValue = deal.dealValue ?? deal.finalPrice ?? 0;
    const commissionAmount = deal.commissionAmount ?? deal.commissionTotal ?? 0;
    const dueDate = deal.closingDate ?? deal.expectedClosingDate ?? new Date().toISOString();
    store.commissions.unshift({
      id: commId,
      dealId: id,
      dealTitle: `${deal.dealType || 'SALE'}: ${deal.propertyTitle || deal.propertyId}`,
      agentId: deal.agentId,
      agentName: deal.agentName,
      commissionType: 'TOTAL',
      percentage: (commissionAmount / (dealValue || 1)) * 100,
      amount: commissionAmount,
      status: 'PENDING',
      dueDate,
    });

    this.addAuditLog('CREATE_DEAL', 'Deal', id, `Logged ${deal.dealType} deal value ${deal.dealValue} AED`, userEmail);
    return deal;
  },

  async updateDeal(id: string, updates: Partial<DealItem>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<DealItem | null> {
    const store = getStore();
    const index = store.deals.findIndex((d) => d.id === id);
    if (index === -1) return null;
    store.deals[index] = { ...store.deals[index], ...updates };
    this.addAuditLog('UPDATE_DEAL', 'Deal', id, `Updated deal status to ${store.deals[index].status}`, userEmail);
    return store.deals[index];
  },

  // ==========================================
  // COMMISSIONS MODULE
  // ==========================================
  async getCommissions(filter?: { agentId?: string; status?: string }): Promise<CommissionItem[]> {
    const store = getStore();
    let list = [...store.commissions];
    if (filter?.agentId && filter.agentId !== 'ALL') list = list.filter((c) => c.agentId === filter.agentId);
    if (filter?.status && filter.status !== 'ALL') list = list.filter((c) => c.status === filter.status);
    return list;
  },

  async updateCommissionStatus(id: string, status: CommissionItem['status'], paidDate?: string, userEmail = 'admin@tanmiyatrealestate.com'): Promise<CommissionItem | null> {
    const store = getStore();
    const comm = store.commissions.find((c) => c.id === id);
    if (!comm) return null;
    comm.status = status;
    if (paidDate) comm.paidDate = paidDate;
    if (status === 'PAID' && !comm.paidDate) comm.paidDate = new Date().toISOString().split('T')[0];
    this.addAuditLog('UPDATE_COMMISSION', 'Commission', id, `Commission status set to ${status}`, userEmail);
    return comm;
  },

  // ==========================================
  // DOCUMENTS MODULE
  // ==========================================
  async getDocuments(filter?: { category?: string; relatedEntity?: string; relatedEntityId?: string }): Promise<DocumentRecord[]> {
    const store = getStore();
    let list = [...store.documents];
    if (filter?.category && filter.category !== 'ALL') list = list.filter((d) => d.category === filter.category);
    if (filter?.relatedEntity) list = list.filter((d) => d.relatedEntity === filter.relatedEntity);
    if (filter?.relatedEntityId) list = list.filter((d) => d.relatedEntityId === filter.relatedEntityId);
    return list;
  },

  async addDocument(data: Omit<DocumentRecord, 'id' | 'uploadedAt'>, userEmail = 'admin@tanmiyatrealestate.com'): Promise<DocumentRecord> {
    const store = getStore();
    const id = `doc-${Date.now()}`;
    const doc: DocumentRecord = {
      ...data,
      id,
      uploadedAt: new Date().toISOString(),
    };
    store.documents.unshift(doc);
    this.addAuditLog('UPLOAD_DOCUMENT', 'Document', id, `Uploaded ${doc.title} (${doc.category})`, userEmail);
    return doc;
  },
};

