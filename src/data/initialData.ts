import {
  ProjectItem,
  UnitItem,
  InquiryItem,
  NewsItem,
  CareerItem,
  TimelineItem,
  PaymentItem,
  SiteSettings,
  AuditLogItem,
} from '@/types';

export const initialSiteSettings: SiteSettings = {
  companyName: 'Tanmiyat Real Estate Development LLC',
  companyNameAr: 'تنميات للتطوير العقاري ذ.م.م',
  tagline: 'Building Places That Become Legacies.',
  addressDubai: 'Business Bay, Dubai, United Arab Emirates',
  phone: '+971 4 369 9000',
  email: 'info@tanmiyatrealestate.com',
  whatsAppNumber: '+971480082664',
  workingHours: 'Monday – Friday: 9:00 AM – 6:00 PM (GST)',
  googleMapsUrl: 'https://maps.google.com/?q=Business+Bay+Dubai',
  activePaymentGateway: 'STRIPE',
};

export const initialProjects: ProjectItem[] = [
  {
    id: 'proj-living-legends',
    title: 'Living Legends',
    titleAr: 'ليفينج ليجندز',
    slug: 'living-legends',
    category: 'MASTER_COMMUNITY',
    status: 'COMPLETED',
    location: 'Dubailand, Dubai, UAE',
    locationAr: 'دبي لاند، دبي، الإمارات العربية المتحدة',
    tagline: 'An expansive master community framed by pristine fairways and refined living.',
    taglineAr: 'مجتمع متكامل يطل على ملاعب الجولف الخضراء وحياة راقية.',
    overview:
      'Spanning over 14.4 million square feet in Dubailand, Living Legends is one of Tanmiyat’s defining master-planned communities. Thoughtfully designed around a championship 9-hole golf course, it integrates 500 bespoke luxury villas, 12 sophisticated residential towers, expansive green parks, community shopping centers, and premier educational facilities.',
    overviewAr:
      'يمتد مشروع ليفينج ليجندز على مساحة تفوق 14.4 مليون قدم مربع في دبي لاند، ويُعد واحداً من أبرز المجتمعات المتكاملة التي طورتها تنميات. صُمم المشروع حول ملعب جولف ذو 9 حفر، ويضم 500 فيلا فاخرة و12 برجاً سكنياً وحدائق غناء ومراكز تسوق مجتمعية.',
    architecture:
      'Classic Mediterranean elegance fused with modern Dubai architectural finesse. Generous private garden setbacks, double-height atriums, floor-to-ceiling glass facades, and sweeping panoramic views across manicured golf fairways.',
    architectureAr:
      'تصميم يجمع بين الأناقة المتوسطية الكلاسيكية واللمسات العصرية، مع واجهات زجاجية واسعة وإطلالات ساحرة على ملاعب الجولف.',
    heroImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
    brochureUrl: '#',
    startingPrice: 1850000,
    currency: 'AED',
    completionDate: 'Completed & Delivered',
    isFeatured: true,
    order: 1,
    amenities: [
      {
        id: 'am-1',
        title: 'Championship 9-Hole Golf Course',
        titleAr: 'ملعب جولف 9 حفر',
        icon: 'Trophy',
        description: 'Professionally landscaped rolling greens and water features.',
      },
      {
        id: 'am-2',
        title: 'Private Clubhouses & Pools',
        titleAr: 'نوادي خاصة وحمامات سباحة',
        icon: 'Waves',
        description: 'Resort-grade swimming lagoons and fitness pavilions.',
      },
      {
        id: 'am-3',
        title: 'Retail & Dining Promenade',
        titleAr: 'ممشى تجاري ومطاعم',
        icon: 'ShoppingBag',
        description: 'Convenience supermarkets, gourmet cafes, and pharmacy.',
      },
      {
        id: 'am-4',
        title: 'Lush Parks & Jogging Trails',
        titleAr: 'حدائق ومسارات ركض',
        icon: 'Trees',
        description: 'Kilometers of tranquil tree-lined jogging and cycling paths.',
      },
      {
        id: 'am-5',
        title: '24/7 Gated Security',
        titleAr: 'أمن وحراسة على مدار الساعة',
        icon: 'ShieldCheck',
        description: 'Advanced surveillance and biometric community entry systems.',
      },
      {
        id: 'am-6',
        title: 'International School & Nurseries',
        titleAr: 'مدارس دولية وحضانات',
        icon: 'GraduationCap',
        description: 'Accredited international educational facilities within the gates.',
      },
    ],
    gallery: [
      {
        id: 'gal-ll-1',
        imageUrl:
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
        caption: 'Signature Golf Villa with Private Courtyard',
        captionAr: 'فيلا فاخرة بإطلالة على ملاعب الجولف',
      },
      {
        id: 'gal-ll-2',
        imageUrl:
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
        caption: 'Refined Double-Height Living Spaces',
        captionAr: 'مساحات معيشة واسعة بتشطيبات راقية',
      },
      {
        id: 'gal-ll-3',
        imageUrl:
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80',
        caption: 'Contemporary Residential Towers within Dubailand',
        captionAr: 'أبراج سكنية عصرية وسط الحدائق',
      },
      {
        id: 'gal-ll-4',
        imageUrl:
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
        caption: 'Sunset Over the Championship Golf Fairways',
        captionAr: 'غروب الشمس فوق مساحات الجولف الخضراء',
      },
    ],
    documents: [
      {
        id: 'doc-ll-1',
        title: 'Living Legends Masterplan Brochure',
        fileUrl: '#',
        fileSize: '14.2 MB',
        fileType: 'PDF',
      },
      {
        id: 'doc-ll-2',
        title: 'Villa Floor Plans & Specifications',
        fileUrl: '#',
        fileSize: '8.7 MB',
        fileType: 'PDF',
      },
    ],
  },
  {
    id: 'proj-the-court-tower',
    title: 'The Court Tower',
    titleAr: 'برج كورت تاور',
    slug: 'the-court-tower',
    category: 'MIXED_USE',
    status: 'COMPLETED',
    location: 'Dubai Water Canal, Business Bay, Dubai',
    locationAr: 'قناة دبي المائية، الخليج التجاري، دبي',
    tagline: 'Canal-front prestige rising at the core of Dubai’s vibrant financial artery.',
    taglineAr: 'مكانة مرموقة على ضفاف قناة دبي المائية في قلب الخليج التجاري.',
    overview:
      'Standing majestically on the banks of the Dubai Water Canal, The Court Tower offers a striking blend of commercial headquarters and canal-front luxury residences. Boasting immediate water access, floor-to-ceiling glass envelopes, automated parking systems, and breathtaking vistas of the Burj Khalifa and canal boardwalk.',
    overviewAr:
      'يقف برج كورت تاور بشموخ على ضفاف قناة دبي المائية، مقدماً مزيجاً مثالياً بين المكاتب الإدارية الفاخرة والشقق السكنية المطلة على المياه وأفق برج خليفة.',
    architecture:
      'Sleek curved curtain-wall glazing reflecting the azure tones of the Dubai Water Canal. Designed with environmental shading louvers, column-free floor plates, and dramatic bronze-accented reception atriums.',
    architectureAr:
      'واجهات زجاجية منحنية عاكسة لألوان القناة المائية مع بهو استقبال فاخر بلمسات برونزية.',
    heroImage:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=85',
    brochureUrl: '#',
    startingPrice: 1650000,
    currency: 'AED',
    completionDate: 'Delivered',
    isFeatured: true,
    order: 2,
    amenities: [
      {
        id: 'am-ct-1',
        title: 'Direct Dubai Canal Boardwalk Access',
        titleAr: 'وصول مباشر لممشى القناة المائية',
        icon: 'Compass',
        description: 'Step directly onto 6.4 km of waterfront promenade.',
      },
      {
        id: 'am-ct-2',
        title: 'Automated Smart Parking System',
        titleAr: 'مواقف ذكية مؤتمتة',
        icon: 'Car',
        description: 'Multi-level intelligent vehicular retrieval mechanisms.',
      },
      {
        id: 'am-ct-3',
        title: 'Infinity Sky Pool',
        titleAr: 'حوض سباحة معلق بإطلالة بانورامية',
        icon: 'Waves',
        description: 'Elevated pool overlooking Downtown Dubai skyline.',
      },
      {
        id: 'am-ct-4',
        title: 'Executive Meeting Suites',
        titleAr: 'أجنحة اجتماعات تنفيذية',
        icon: 'Briefcase',
        description: 'High-tech boardroom suites for corporate tenants.',
      },
    ],
    gallery: [
      {
        id: 'gal-ct-1',
        imageUrl:
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
        caption: 'Canal-front Glazing and Architectural Facade',
        captionAr: 'الواجهة المعمارية المطلة على قناة دبي',
      },
      {
        id: 'gal-ct-2',
        imageUrl:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
        caption: 'Grade-A Executive Office Spaces',
        captionAr: 'مكاتب تنفيذية من الفئة الأولى',
      },
      {
        id: 'gal-ct-3',
        imageUrl:
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
        caption: 'Luxury Waterfront Residence Interior',
        captionAr: 'تصميم داخلي فاخر للشقق المطلة على القناة',
      },
    ],
    documents: [
      {
        id: 'doc-ct-1',
        title: 'The Court Tower Overview',
        fileUrl: '#',
        fileSize: '9.4 MB',
        fileType: 'PDF',
      },
    ],
  },
  {
    id: 'proj-exchange-tower',
    title: 'The Exchange Tower',
    titleAr: 'برج إكستشينج تاور',
    slug: 'the-exchange-tower',
    category: 'COMMERCIAL',
    status: 'COMPLETED',
    location: 'Business Bay, Dubai, UAE',
    locationAr: 'الخليج التجاري، دبي، الإمارات',
    tagline: 'An authoritative 28-storey corporate address in Dubai’s business epicentre.',
    taglineAr: 'عنوان تجاري ريادي بارتفاع 28 طابقاً في المركز التجاري لدبي.',
    overview:
      'Strategically positioned minutes from Sheikh Zayed Road and Downtown Dubai, The Exchange Tower stands as a 28-storey architectural landmark crafted for multinational conglomerates, regional wealth managers, and dynamic corporate leaders. Featuring panoramic glass curtain facades and bespoke retail concourses.',
    overviewAr:
      'يقع البرج في موقع استراتيجي قرب شارع الشيخ زايد ووسط مدينة دبي، بارتفاع 28 طابقاً مخصصاً للشركات الكبرى والمؤسسات الاستثمارية.',
    architecture:
      'Geometric modernist monolith featuring high-performance insulated glazing, grand marble-clad lobbies, high-speed destination elevators, and energy-efficient building management infrastructure.',
    architectureAr:
      'تصميم عصري هندسي يتميز بزجاج عالي الكفاءة وردهة استقبال رخامية ومصاعد فائقة السرعة.',
    heroImage:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85',
    brochureUrl: '#',
    startingPrice: 2200000,
    currency: 'AED',
    completionDate: 'Delivered',
    isFeatured: false,
    order: 3,
    amenities: [
      {
        id: 'am-et-1',
        title: 'High-Speed Smart Elevators',
        titleAr: 'مصاعد ذكية عالية السرعة',
        icon: 'ArrowUp',
        description: 'Destination-controlled high-speed passenger elevators.',
      },
      {
        id: 'am-et-2',
        title: '24-Hour Concierge & Valet',
        titleAr: 'خدمة كونسيرج وصف سيارات 24 ساعة',
        icon: 'Key',
        description: 'Dedicated professional front-of-house staff.',
      },
      {
        id: 'am-et-3',
        title: 'Commercial Plaza & Cafes',
        titleAr: 'ساحة تجارية ومقاهي',
        icon: 'Coffee',
        description: 'Ground level dining, espresso bars, and banking facilities.',
      },
    ],
    gallery: [
      {
        id: 'gal-et-1',
        imageUrl:
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
        caption: 'The Exchange Tower Exterior Profile',
        captionAr: 'الواجهة الخارجية لبرج إكستشينج',
      },
    ],
    documents: [],
  },
  {
    id: 'proj-horizon-residences',
    title: 'Horizon Residences',
    titleAr: 'أفق ريزيدنسز',
    slug: 'horizon-residences',
    category: 'RESIDENTIAL',
    status: 'UPCOMING',
    location: 'Dubailand, Dubai, UAE',
    locationAr: 'دبي لاند، دبي، الإمارات العربية المتحدة',
    tagline: 'The next chapter in ultra-luxury boutique living, harmonizing nature and legacy.',
    taglineAr: 'الفصل القادم في الحياة السكنية الفاخرة التي توفق بين الطبيعة والأصالة.',
    overview:
      'Conceived as Tanmiyat’s future-forward luxury residential release, Horizon Residences introduces exclusive sky penthouses and garden terrace residences built with carbon-neutral materials, biophilic private atriums, and private wellness pavilions.',
    overviewAr:
      'يقدم أفق ريزيدنسز مفهوماً مبتكراً للمعيشة الفاخرة المستدامة من خلال بنتهاوس بإطلالات بانورامية وحدائق معلقة ومرافق صحية خاصة.',
    architecture:
      'Biophilic organic lines paired with warm brushed champagne metals, fluted limestone, and integrated vertical gardens.',
    architectureAr:
      'خطوط انسيابية مدمجة مع حدائق عمودية وحجر جيري فاخر وتفاصيل ذهبية هادئة.',
    heroImage:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=85',
    brochureUrl: '#',
    startingPrice: 2450000,
    currency: 'AED',
    completionDate: 'Q4 2027',
    isFeatured: true,
    order: 4,
    amenities: [
      {
        id: 'am-hr-1',
        title: 'Private Thermal Spa & Hydrotherapy',
        titleAr: 'منتجع صحي ومساج خاص',
        icon: 'Sparkles',
        description: 'Private thermal pools, herbal saunas, and salt rooms.',
      },
      {
        id: 'am-hr-2',
        title: 'Sky Lounge & Cigar Salon',
        titleAr: 'صالة علوية خاصة',
        icon: 'Wine',
        description: 'Private club lounge exclusively for owners and guests.',
      },
    ],
    gallery: [
      {
        id: 'gal-hr-1',
        imageUrl:
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80',
        caption: 'Horizon Sky Penthouse Living Room',
        captionAr: 'صالة البنتهاوس الفاخرة',
      },
    ],
    documents: [],
  },
];

export const initialUnits: UnitItem[] = [
  {
    id: 'unit-ll-v104',
    projectId: 'proj-living-legends',
    unitNumber: 'Villa 104 - Type A',
    type: 'Signature Golf Villa',
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 6540,
    floor: 2,
    price: 6850000,
    currency: 'AED',
    status: 'AVAILABLE',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'unit-ll-v105',
    projectId: 'proj-living-legends',
    unitNumber: 'Villa 105 - Type B',
    type: 'Fairway Residence Villa',
    bedrooms: 4,
    bathrooms: 5,
    areaSqFt: 4890,
    floor: 2,
    price: 5200000,
    currency: 'AED',
    status: 'RESERVED',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'unit-ll-t2-1801',
    projectId: 'proj-living-legends',
    unitNumber: 'Tower 2 - Penthouse 1801',
    type: 'Duplex Penthouse',
    bedrooms: 3,
    bathrooms: 4,
    areaSqFt: 3120,
    floor: 18,
    price: 3450000,
    currency: 'AED',
    status: 'AVAILABLE',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'unit-ll-t4-0802',
    projectId: 'proj-living-legends',
    unitNumber: 'Tower 4 - Residence 802',
    type: 'Executive Apartment',
    bedrooms: 2,
    bathrooms: 3,
    areaSqFt: 1680,
    floor: 8,
    price: 1890000,
    currency: 'AED',
    status: 'SOLD',
    images: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'unit-ct-2204',
    projectId: 'proj-the-court-tower',
    unitNumber: 'Suite 2204',
    type: 'Canal-View Luxury Residence',
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1450,
    floor: 22,
    price: 2150000,
    currency: 'AED',
    status: 'AVAILABLE',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'unit-ct-1502',
    projectId: 'proj-the-court-tower',
    unitNumber: 'Office 1502',
    type: 'Canal-Facing Commercial Suite',
    bedrooms: 0,
    bathrooms: 2,
    areaSqFt: 2100,
    floor: 15,
    price: 2850000,
    currency: 'AED',
    status: 'AVAILABLE',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

export const initialTimeline: TimelineItem[] = [
  {
    id: 'time-1',
    year: 1999,
    title: 'Foundations of Excellence',
    titleAr: 'تأسيس مسيرة التميز',
    description:
      'Tanmiyat is established with a forward-thinking mission: to engineer visionary communities and iconic architectural developments across the Middle East.',
    descriptionAr:
      'تأسست تنميات برؤية استشرافية تهدف إلى تطوير مجتمعات مبتكرة ومشاريع معمارية رائدة في المنطقة.',
  },
  {
    id: 'time-2',
    year: 2004,
    title: 'Regional Expansion & Master-Planning',
    titleAr: 'التوسع الإقليمي والمخططات الكبرى',
    description:
      'Expanding into large-scale urban developments, pioneering integrated master-planned communities combining luxury residential enclaves with commercial vibrancy.',
    descriptionAr:
      'التوسع نحو مشاريع المخططات الحضرية الكبرى التي تدمج بين الحياة السكنية الراقية والنشاط التجاري.',
  },
  {
    id: 'time-3',
    year: 2007,
    title: 'The Dubai Chapter Begins',
    titleAr: 'انطلاق مشاريع دبي الكبرى',
    description:
      'Unveiling flagship developments in the burgeoning global metropolis of Dubai, including the multi-billion-dirham Living Legends master community and landmark towers.',
    descriptionAr:
      'إطلاق المشاريع الرائدة في دبي، وفي مقدمتها مجتمع ليفينج ليجندز المتكامل في دبي لاند وأبراج استراتيجية.',
  },
  {
    id: 'time-4',
    year: 2016,
    title: 'Landmark Delivery & Handover',
    titleAr: 'تسليم المشاريع الكبرى للملاك',
    description:
      'Successful delivery and handovers across residential villas and towers within Living Legends, welcoming thousands of international homeowners into the fold.',
    descriptionAr:
      'تسليم الفلل الفاخرة والأبراج السكنية في ليفينج ليجندز واستقبال آلاف العائلات في المجتمع المتكامل.',
  },
  {
    id: 'time-5',
    year: 2021,
    title: 'Waterfront Commercial Delivery',
    titleAr: 'تسليم مشاريع الواجهة المائية',
    description:
      'Completion of The Court Tower and premier commercial office assets overlooking the Dubai Water Canal and Business Bay financial district.',
    descriptionAr:
      'اكتمال برج كورت تاور والمشاريع التجارية على قناة دبي المائية والخليج التجاري.',
  },
  {
    id: 'time-6',
    year: 2025,
    title: 'The Future of Sustainable Legacies',
    titleAr: 'مستقبل الاستدامة المعمارية',
    description:
      'Forging ahead into sustainable biophilic developments, smart architectural technologies, and enduring legacy developments tailored for generations to come.',
    descriptionAr:
      'المضي قدماً في تطوير مشاريع مستدامة تجمع بين أحدث التقنيات المعمارية والحفاظ على الإرث المستمر.',
  },
];

export const initialInquiries: InquiryItem[] = [
  {
    id: 'inq-101',
    type: 'PROJECT',
    status: 'NEW',
    name: 'Sheikh Mansoor Al-Qasimi',
    email: 'm.alqasimi@investgroup.ae',
    phone: '+971 50 123 4567',
    country: 'United Arab Emirates',
    interestedProject: 'Living Legends',
    propertyType: 'Signature Villa',
    message: 'Requesting private viewing of 5-bedroom golf-front villas and payment schedule.',
    projectId: 'proj-living-legends',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'inq-102',
    type: 'INVESTOR',
    status: 'CONTACTED',
    name: 'Alexander von Berg',
    email: 'a.berg@zurich-private.ch',
    phone: '+41 79 889 1234',
    country: 'Switzerland',
    interestedProject: 'The Court Tower',
    propertyType: 'Full Commercial Floor',
    message: 'Seeking institutional acquisition details for 2 full office floors facing Dubai Canal.',
    projectId: 'proj-the-court-tower',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'inq-103',
    type: 'UNIT',
    status: 'IN_PROGRESS',
    name: 'Eleanor Vance',
    email: 'e.vance@mayfairholdings.co.uk',
    phone: '+44 20 7946 0912',
    country: 'United Kingdom',
    interestedProject: 'The Court Tower',
    propertyType: 'Penthouse',
    message: 'Looking to reserve Suite 2204 on the upper canal floor.',
    projectId: 'proj-the-court-tower',
    unitId: 'unit-ct-2204',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const initialNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Dubai Real Estate Market Sets Global Benchmark for Ultra-Luxury Capital Appreciation',
    titleAr: 'سوق العقارات في دبي يسجل مستويات قياسية عالمية في نمو رأس المال الفاخر',
    slug: 'dubai-luxury-real-estate-benchmark-2025',
    excerpt:
      'An analytical overview of Dubai’s sustained luxury property momentum, driven by prime global relocations and enduring architectural excellence.',
    excerptAr:
      'نظرة تحليلية على استمرار نمو سوق العقارات الفاخرة في دبي المدعوم باستقطاب أصحاب الثروات والتميز المعماري.',
    content:
      'Dubai’s residential property ecosystem has established itself as an undeniable sovereign haven for high-net-worth individuals and global enterprise leadership. Tanmiyat Real Estate Development LLC continues to observe robust multi-tier demand for expansive golf-front villas and waterfront commercial headquarters in strategic nodes like Dubailand and Business Bay.\n\nWith world-class infrastructure, forward-thinking regulatory leadership, and a tax-efficient economic framework, developments that balance generous spatial architecture with mature community amenities continue to yield superior long-term capital preservation.',
    contentAr:
      'أثبتت منظومة العقارات السكنية في دبي مكانتها كملاذ استثماري رائد لأصحاب الثروات والمؤسسات الدولية. وتواصل تنميات للتطوير العقاري تسجيل طلب متزايد على الفلل المطلة على الجولف والمقار التجارية على الواجهة المائية.',
    featuredImage:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
    author: 'Tanmiyat Strategic Advisory',
    category: 'Market Insights',
    publishedDate: '2025-02-18T10:00:00Z',
    isPublished: true,
  },
  {
    id: 'news-2',
    title: 'Architectural Philosophy: Engineering Enduring Value Beyond Trends',
    titleAr: 'فلسفة العمارة: هندسة القيمة الدائمة لما بعد الصيحات العابرة',
    slug: 'architectural-philosophy-enduring-value',
    excerpt:
      'Why timeless proportion, authentic stone, and generous space outlive fast-fashion design in premium Dubai developments.',
    excerptAr:
      'لماذا تتفوق التناسبات الخالدة والحجر الطبيعي والمساحات الرحبة على الصيحات العابرة في تطوير العقارات الفاخرة.',
    content:
      'True luxury in property development is defined by longevity: how an edifice breathes over decades, how its natural materials patinate gracefully under the Arabian sun, and how private sanctuaries harmonize with communal gathering spaces.\n\nAt Tanmiyat, every blueprint begins not with mere square footage, but with the lived experience of human comfort, privacy, and architectural permanence.',
    contentAr:
      'الفخامة الحقيقية في التطوير العقاري تقاس بالاستدامة: كيف يتعايش المبنى لعقود طويلة وكيف تتناغم المساحات الخاصة مع البيئة المحيطة لتوفير الراحة والسكينة.',
    featuredImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    author: 'Tanmiyat Design Directorate',
    category: 'Architecture & Design',
    publishedDate: '2025-01-12T09:00:00Z',
    isPublished: true,
  },
];

export const initialCareers: CareerItem[] = [
  {
    id: 'car-1',
    jobTitle: 'Senior Development Project Director',
    jobTitleAr: 'مدير أول مشاريع التطوير العقاري',
    slug: 'senior-development-project-director',
    department: 'Development & Engineering',
    location: 'Dubai, UAE',
    employmentType: 'FULL_TIME',
    description:
      'Lead master planning, contractor oversight, procurement excellence, and structural quality control for premier mixed-use and residential master communities in Dubai.',
    requirements: [
      '12+ years leading luxury development programs in the UAE/GCC.',
      'Degree in Civil Engineering, Architecture, or Construction Management.',
      'Proven record with master communities and high-rise developments.',
      'Expertise in Dubai Municipality, RERA, and DEWA regulatory frameworks.',
    ],
    applicationDeadline: '2025-06-30',
    isActive: true,
  },
  {
    id: 'car-2',
    jobTitle: 'Director of Luxury Client Relations & Private Wealth',
    jobTitleAr: 'مدير علاقات كبار العملاء والثروات الخاصة',
    slug: 'director-luxury-client-relations',
    department: 'Private Sales',
    location: 'Dubai, UAE',
    employmentType: 'FULL_TIME',
    description:
      'Curate bespoke advisory journeys for global family offices, institutional investors, and sovereign high-net-worth purchasers across Tanmiyat’s property portfolio.',
    requirements: [
      '8+ years in prime/super-prime Dubai real estate private advisory.',
      'Exceptional international client portfolio and diplomatic etiquette.',
      'Fluency in English; Arabic or European languages highly advantageous.',
    ],
    applicationDeadline: '2025-07-15',
    isActive: true,
  },
];

export const initialPayments: PaymentItem[] = [
  {
    id: 'pay-001',
    customerName: 'Sheikh Mansoor Al-Qasimi',
    customerEmail: 'm.alqasimi@investgroup.ae',
    unitNumber: 'Villa 104 - Type A',
    projectName: 'Living Legends',
    provider: 'STRIPE',
    transactionId: 'txn_stripe_demo_9827341',
    amount: 100000,
    currency: 'AED',
    status: 'SUCCEEDED',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'pay-002',
    customerName: 'Alexander von Berg',
    customerEmail: 'a.berg@zurich-private.ch',
    unitNumber: 'Office 1502',
    projectName: 'The Court Tower',
    provider: 'STRIPE',
    transactionId: 'txn_stripe_demo_8371920',
    amount: 150000,
    currency: 'AED',
    status: 'SUCCEEDED',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'log-1',
    action: 'SYSTEM_BOOTSTRAP',
    entity: 'System',
    userEmail: 'admin@tanmiyatrealestate.com',
    timestamp: new Date().toISOString(),
    details: 'Initial database schema and verified project records initialized.',
  },
  {
    id: 'log-2',
    action: 'UPDATE_SETTING',
    entity: 'SiteSettings',
    userEmail: 'admin@tanmiyatrealestate.com',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: 'Verified Dubai office address, working hours, and WhatsApp hotline.',
  },
];

export * from './marketplaceData';
