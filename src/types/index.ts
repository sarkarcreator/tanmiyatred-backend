export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SALES_MANAGER'
  | 'AGENT'
  | 'MARKETING'
  | 'CRM_MANAGER'
  | 'ACCOUNTANT'
  | 'VIEWER'
  | 'EDITOR'
  | 'SALES';
export type UserRole = Role;

export type ProjectStatus = 'COMPLETED' | 'ONGOING' | 'UPCOMING';

export type ProjectCategory = 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'MASTER_COMMUNITY';

export type UnitStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'COMING_SOON';

export type InquiryType = 'GENERAL' | 'PROJECT' | 'UNIT' | 'INVESTOR';

export type InquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'IN_PROGRESS'
  | 'QUALIFIED'
  | 'CONVERTED'
  | 'CLOSED'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'EXECUTIVE';

export interface ProjectAmenity {
  id: string;
  title: string;
  titleAr?: string;
  icon?: string;
  description?: string;
}

export interface ProjectGalleryItem {
  id: string;
  imageUrl: string;
  caption?: string;
  captionAr?: string;
}

export interface ProjectDocumentItem {
  id: string;
  title: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
}

export interface UnitItem {
  id: string;
  projectId: string;
  unitNumber: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  floor?: number;
  price: number; // in AED
  currency: string;
  status: UnitStatus;
  floorPlanUrl?: string;
  images: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  category: ProjectCategory;
  status: ProjectStatus;
  location: string;
  locationAr: string;
  tagline: string;
  taglineAr: string;
  overview: string;
  overviewAr: string;
  architecture: string;
  architectureAr: string;
  heroImage: string;
  brochureUrl?: string;
  startingPrice?: number;
  currency: string;
  completionDate?: string;
  isFeatured: boolean;
  order: number;
  amenities: ProjectAmenity[];
  gallery: ProjectGalleryItem[];
  documents: ProjectDocumentItem[];
  units?: UnitItem[];
}

export interface InquiryItem {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  name: string;
  email: string;
  phone: string;
  country: string;
  interestedProject?: string;
  propertyType?: string;
  message: string;
  projectId?: string;
  unitId?: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  excerpt: string;
  excerptAr: string;
  content: string;
  contentAr: string;
  featuredImage: string;
  author: string;
  category: string;
  publishedDate: string;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CareerItem {
  id: string;
  jobTitle: string;
  jobTitleAr: string;
  slug: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  requirements: string[];
  applicationDeadline?: string;
  isActive: boolean;
}

export interface JobApplicationItem {
  id: string;
  careerId: string;
  careerTitle: string;
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter?: string;
  createdAt: string;
}

export interface TimelineItem {
  id: string;
  year: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  imageUrl?: string;
}

export interface PaymentItem {
  id: string;
  customerName: string;
  customerEmail: string;
  unitId?: string;
  unitNumber?: string;
  projectName?: string;
  provider: string; // 'STRIPE' | 'TELR' | 'NETWORK_INT' | 'CHECKOUT' | 'AMAZON' | 'PAYTABS'
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  userEmail: string;
  timestamp: string;
  details?: string;
}

export interface SiteSettings {
  companyName: string;
  companyNameAr: string;
  tagline: string;
  addressDubai: string;
  phone: string;
  email: string;
  whatsAppNumber: string;
  workingHours: string;
  googleMapsUrl: string;
  activePaymentGateway: string; // 'STRIPE' | 'TELR' | 'NETWORK_INT' | 'CHECKOUT'
}

// ==========================================
// REAL ESTATE MARKETPLACE & CRM ENTITIES
// ==========================================

export type PropertyPurpose = 'FOR_SALE' | 'FOR_RENT' | 'FOR_BUY' | 'FOR_INVESTMENT';

export type PropertyStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'RENTED'
  | 'OFF_MARKET';

export type VerificationStatus =
  | 'VERIFIED'
  | 'PENDING_VERIFICATION'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'SOLD'
  | 'RENTED'
  | 'OFF_MARKET';

export type WorkflowStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'COMPLIANCE_CHECK'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type FurnishedType = 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';

export type LeadSource =
  | 'WEBSITE'
  | 'PROPERTY_INQUIRY'
  | 'CONTACT_FORM'
  | 'WHATSAPP'
  | 'PHONE'
  | 'CAMPAIGN'
  | 'REFERRAL'
  | 'AGENT'
  | 'SOCIAL_MEDIA'
  | 'WALK_IN';

export type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'VIEWING_BOOKED'
  | 'VIEWING_COMPLETED'
  | 'OFFER_MADE'
  | 'OFFER_SUBMITTED'
  | 'NEGOTIATION'
  | 'UNDER_NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'NURTURE';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'VIP';

export interface AgentItem {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  photo: string;
  avatar?: string;
  designation: string;
  title?: string;
  designationAr?: string;
  phone: string;
  whatsApp: string;
  email: string;
  languages: string[];
  nationality?: string;
  specialization: string;
  areas: string[];
  bio: string;
  bioAr?: string;
  reraBrokerId?: string; // Broker ORN
  brn?: string; // Agent BRN (Broker Registration Number)
  licenseInformation?: string;
  status: 'ACTIVE' | 'INACTIVE';
  activeListingsCount?: number;
  closedDealsCount?: number;
  totalSalesVolume?: number;
  featured?: boolean;
}

export interface ListingItem {
  id: string;
  propertyId: string;
  purpose: 'FOR_SALE' | 'FOR_RENT';
  price: number;
  currency: string;
  rentalPeriod?: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'EXPIRED' | 'OFF_MARKET';
  agentId: string;
  agentName?: string;
  permitNumber?: string; // Advertising Permit / Trakheesi Permit
  permitExpiry?: string;
  publishedAt?: string;
  expiresAt?: string;
  featured: boolean;
  createdBy: string;
  updatedBy: string;
}

export interface PropertyItem {
  id: string;
  referenceNumber: string; // e.g. TAN-DXB-104
  title: string;
  titleAr?: string;
  slug: string;
  shortDescription?: string;
  description: string;
  descriptionAr?: string;
  propertyType: string; // Apartment, Villa, Townhouse, Penthouse, Duplex, Studio, Office, Retail, etc.
  purpose: PropertyPurpose;
  status: PropertyStatus;
  price: number; // in AED
  currency: string;
  rentalPeriod?: 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
  pricePerSqFt?: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  area: number; // in sq ft
  builtUpArea?: number;
  plotArea?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  furnished: FurnishedType;
  view?: string;
  developer: string; // e.g., Tanmiyat Real Estate Development LLC
  project?: string;
  projectId?: string;
  building?: string;
  community: string;
  subCommunity?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  agentId: string;
  agent?: AgentItem;
  ownerId?: string;
  ownerName?: string;
  owner?: OwnerItem;
  listingDate: string;
  expiryDate?: string;

  // UAE / Dubai RERA & DLD Compliance Architecture
  reraBrokerId?: string; // Broker ORN
  brokerORN?: string;
  agentBRN?: string;
  advertisingPermitNumber?: string; // Trakheesi Permit
  permitExpiryDate?: string;
  permitStatus?: 'VALID' | 'PENDING' | 'EXPIRED' | 'REVOKED';
  dldReference?: string;
  propertyOwnershipReference?: string; // Title Deed / Oqood
  ejariReference?: string;

  // Compliance & Quality Statuses
  featured: boolean;
  exclusive: boolean;
  verified: boolean;
  verificationStatus: VerificationStatus;
  workflowStatus: WorkflowStatus;

  // Media & Assets
  heroImage: string;
  featuredImage?: string;
  images: string[];
  videoUrl?: string;
  virtualTour360Url?: string;
  floorPlanUrl?: string;
  brochureUrl?: string;
  amenities: string[];
  nearbyPlaces?: Array<{ name: string; distance: string }>;

  // Multi-listing linkage
  listings?: ListingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OwnerItem {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  whatsApp?: string;
  preferredContact: 'EMAIL' | 'PHONE' | 'WHATSAPP';
  propertyIds: string[];
  notes?: string;
  documents?: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type CustomerType = 'BUYER' | 'TENANT' | 'INVESTOR' | 'SELLER' | 'LANDLORD';

export interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsApp?: string;
  type: CustomerType;
  nationality?: string;
  budget?: number;
  currency?: string;
  preferredAreas: string[];
  propertyTypes: string[];
  bedrooms?: number;
  purpose: 'BUY' | 'RENT' | 'INVEST';
  assignedAgentId?: string;
  assignedAgentName?: string;
  notes?: string;
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  action: string;
  note: string;
  timestamp: string;
  userEmail: string;
}

export interface LeadItem {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerType?: CustomerType;
  propertyId?: string;
  propertyTitle?: string;
  agentId?: string;
  agentName?: string;
  agent?: AgentItem;
  source: LeadSource;
  stage: LeadStage;
  priority: LeadPriority;
  budget?: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  notes?: string;
  activityHistory: LeadActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface ViewingItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  agentId: string;
  agentName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "15:00"
  location?: string;
  viewingType?: 'IN_PERSON' | 'PHYSICAL' | 'VIRTUAL_CALL' | '360_TOUR' | string;
  attendees?: number;
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  createdAt: string;
}

export interface OfferItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId?: string;
  buyerName: string;
  buyerEmail?: string;
  agentId: string;
  agentName: string;
  offerAmount: number;
  currency: string;
  offerDate: string;
  expiryDate: string;
  conditions?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
}

export type DealStage =
  | 'AGREEMENT_SIGNED'
  | 'ESCROW_DEPOSIT_PAID'
  | 'DLD_APPOINTMENT_SCHEDULED'
  | 'CLOSED_WON'
  | 'CANCELLED';

export interface DealItem {
  id: string;
  dealType?: 'SALE' | 'RENTAL';
  propertyId: string;
  propertyTitle?: string;
  property?: PropertyItem;
  listingId?: string;
  buyerOrTenantName?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  sellerOrLandlordName?: string;
  sellerName?: string;
  agentId: string;
  agentName: string;
  dealValue?: number;
  finalPrice: number;
  commissionAmount?: number;
  commissionTotal?: number;
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID';
  contractStatus?: 'DRAFT' | 'SIGNED' | 'REGISTERED_DLD' | 'EJARI_ISSUED';
  documentsCount?: number;
  closingDate?: string;
  expectedClosingDate?: string;
  stage: DealStage;
  status?: 'OPEN' | 'NEGOTIATION' | 'CONTRACT' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export type CommissionStatus = 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'CANCELLED';

export interface CommissionItem {
  id: string;
  dealId: string;
  dealTitle: string;
  agentId: string;
  agentName: string;
  agent?: AgentItem;
  commissionType: 'BUYER_SIDE' | 'SELLER_SIDE' | 'TOTAL' | 'SPLIT';
  percentage: number;
  splitPercentage?: number;
  amount: number;
  status: CommissionStatus;
  dueDate: string;
  paidDate?: string;
  createdAt?: string;
}

export interface DocumentRecord {
  id: string;
  category:
    | 'PROPERTY_DOCUMENTS'
    | 'OWNER_DOCUMENTS'
    | 'BUYER_DOCUMENTS'
    | 'CONTRACTS'
    | 'OFFERS'
    | 'FLOOR_PLANS'
    | 'BROCHURES'
    | 'COMPLIANCE_DOCUMENTS';
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  relatedEntity: 'PROPERTY' | 'DEAL' | 'CUSTOMER' | 'AGENT';
  relatedEntityId: string;
  accessLevel: 'PUBLIC' | 'AGENT_ONLY' | 'ADMIN_ONLY';
  uploadedAt: string;
  downloadUrl: string;
}

