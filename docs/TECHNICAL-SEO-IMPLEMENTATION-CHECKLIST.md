# ✅ Technical SEO Implementation Checklist

**Project**: BSK Motorcycle Team - LandingPage  
**Date Started**: October 15, 2025  
**Target Completion**: November 5, 2025  
**Current Status**: 🟡 IN PROGRESS

---

## 📋 Quick Reference

| Priority | Tasks | Completed | Remaining |
|----------|-------|-----------|-----------|
| 🔴 HIGH | 4 | 0 | 4 |
| 🟠 MEDIUM | 4 | 0 | 4 |
| 🟢 LOW | 3 | 0 | 3 |
| **TOTAL** | **11** | **0** | **11** |

**Overall Progress**: 0% (0/11 tasks complete)

---

## 🔴 HIGH PRIORITY TASKS (Week 1)

### Task 1: Remove 'use client' from Membership Info Page
**Impact**: Low (already pre-rendered by Next.js)  
**Effort**: ⭐ Trivial (30 seconds)  
**Files**: `app/membership-info/page.tsx`

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Open `app/membership-info/page.tsx`
- [ ] Remove `'use client';` directive (line 1)
- [ ] Test page renders correctly
- [ ] Verify no client-side functionality breaks
- [ ] Commit changes

**Expected Outcome**:
- Page becomes server component
- Faster initial load
- Better SEO (already good, but improved)

---

### Task 2: Add x-default to Hreflang Configuration
**Impact**: Medium (international SEO)  
**Effort**: ⭐ Trivial (2 minutes)  
**Files**: `app/layout.tsx`

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Open `app/layout.tsx`
- [ ] Find `alternates.languages` configuration
- [ ] Add `'x-default': 'https://bskmt.com'` as first entry
- [ ] Test metadata generation
- [ ] Verify in page source
- [ ] Commit changes

**Current Code**:
```tsx
languages: {
  'es-CO': 'https://bskmt.com',
  'es': 'https://bskmt.com',
}
```

**Updated Code**:
```tsx
languages: {
  'x-default': 'https://bskmt.com',
  'es-CO': 'https://bskmt.com',
  'es': 'https://bskmt.com',
}
```

**Expected Outcome**:
- Better international targeting
- Default language fallback for unknown locales
- Google Search Console compliance

---

### Task 3: Enhance Event Image Alt Texts
**Impact**: High (event page SEO + image search)  
**Effort**: ⭐⭐ Easy (15 minutes)  
**Files**: 
- `components/eventos/PublicEventCard.tsx`
- `components/home/EventsSection.tsx`

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Open `components/eventos/PublicEventCard.tsx`
- [ ] Find image `alt` attribute
- [ ] Replace `alt={event.name}` with enhanced version
- [ ] Repeat for `components/home/EventsSection.tsx`
- [ ] Test rendering
- [ ] Verify alt text in DOM
- [ ] Commit changes

**Current Code**:
```tsx
<Image
  src={event.imageUrl}
  alt={event.name}  // ❌ Too generic
  // ...
/>
```

**Updated Code**:
```tsx
<Image
  src={event.imageUrl}
  alt={`${event.name} - ${event.eventType || 'Evento'} organizado por BSK Motorcycle Team${event.location?.city ? ` en ${event.location.city}` : ' en Colombia'}`}
  // ...
/>
```

**Examples**:
- Before: `alt="Tour Andino 2025"`
- After: `alt="Tour Andino 2025 - Rodada organizado por BSK Motorcycle Team en Bogotá"`

**Expected Outcome**:
- Better image SEO
- More descriptive alt text for accessibility
- Keywords naturally integrated
- Location-specific context

---

### Task 4: Convert Events Page to Server Component
**Impact**: High (SEO + performance)  
**Effort**: ⭐⭐⭐ Medium (45 minutes)  
**Files**: 
- `app/events/page.tsx`
- `components/eventos/EventsList.tsx` (new file)
- `lib/events-service.ts` (potentially new)

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Create server-side data fetching function
- [ ] Move `usePublicEvents` logic to server action
- [ ] Create client component `EventsList.tsx` for interactivity
- [ ] Update `app/events/page.tsx` to be server component
- [ ] Pass fetched data to client component as props
- [ ] Test functionality
- [ ] Verify SEO content visible without JavaScript
- [ ] Test filters and interactions still work
- [ ] Commit changes

**Current Architecture**:
```tsx
// app/events/page.tsx
'use client';  // ❌ Entire page client-side

const Events: React.FC = () => {
  const { upcomingEventsInSixMonths, loading } = usePublicEvents(); // Client fetch
  // ...
}
```

**Updated Architecture**:
```tsx
// app/events/page.tsx - SERVER COMPONENT
export default async function EventsPage() {
  const events = await getPublicEvents(); // ✅ Server-side fetch
  
  return (
    <div>
      <EventsHeroSection />
      <EventsList events={events} /> {/* ✅ Pass to client */}
    </div>
  );
}

// components/eventos/EventsList.tsx - CLIENT COMPONENT
'use client';
export function EventsList({ events }: { events: Event[] }) {
  const [filteredEvents, setFilteredEvents] = useState(events);
  // Only filtering/interaction is client-side
  return <div>{ /* render events */ }</div>;
}
```

**Expected Outcome**:
- Events data rendered server-side (SEO-friendly)
- Faster initial page load (no client-side fetch)
- Search engines see full event list
- Interactions still work client-side
- Better Core Web Vitals scores

---

## 🟠 MEDIUM PRIORITY TASKS (Week 2)

### Task 5: Enhance Product Image Alt Texts
**Impact**: Medium (store page SEO + image search)  
**Effort**: ⭐⭐ Easy (15 minutes)  
**Files**: `components/home/StoreSection.tsx`

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Open `components/home/StoreSection.tsx`
- [ ] Find product image `alt` attribute
- [ ] Enhance with description + brand + category
- [ ] Test rendering
- [ ] Verify alt text quality
- [ ] Commit changes

**Current Code**:
```tsx
<Image
  src={product.imageUrl}
  alt={product.name}  // ❌ Just product name
  // ...
/>
```

**Updated Code**:
```tsx
<Image
  src={product.imageUrl}
  alt={`${product.name} - ${product.description || product.category} - Producto oficial BSK Motorcycle Team`}
  // ...
/>
```

**Examples**:
- Before: `alt="Camiseta BSK MT"`
- After: `alt="Camiseta BSK MT - Algodón premium con logo bordado - Producto oficial BSK Motorcycle Team"`

**Expected Outcome**:
- Better product image SEO
- More context for screen readers
- Keywords naturally included
- Brand association

---

### Task 6: Split Contact Page (Server + Client Components)
**Impact**: Medium (performance + SEO)  
**Effort**: ⭐⭐⭐ Medium (30 minutes)  
**Files**: 
- `app/contact/page.tsx`
- `components/contact/ContactInfo.tsx` (new)
- `components/contact/ContactForms.tsx` (new)

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Extract static contact info to server component
- [ ] Move forms to separate client component
- [ ] Update page.tsx to use both components
- [ ] Test functionality
- [ ] Verify static content renders without JS
- [ ] Verify forms still work
- [ ] Commit changes

**Current Architecture**:
```tsx
// app/contact/page.tsx
'use client';  // ❌ Entire page client-side

const Contact: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  return (
    <div>
      {/* Static contact info */}
      {/* Interactive forms */}
    </div>
  );
}
```

**Updated Architecture**:
```tsx
// app/contact/page.tsx - SERVER COMPONENT
export default function ContactPage() {
  return (
    <div>
      <ContactInfo /> {/* ✅ Server component */}
      <ContactForms /> {/* ✅ Client component */}
    </div>
  );
}

// components/contact/ContactInfo.tsx - SERVER COMPONENT
export function ContactInfo() {
  return <div>{/* Static contact details */}</div>;
}

// components/contact/ContactForms.tsx - CLIENT COMPONENT
'use client';
export function ContactForms() {
  const [activeTab, setActiveTab] = useState("general");
  return <div>{/* Interactive forms */}</div>;
}
```

**Expected Outcome**:
- Contact info rendered server-side (SEO-friendly)
- Forms remain interactive (client-side)
- Better performance
- Search engines see contact details immediately

---

### Task 7: Add Dynamic Content to Sitemap
**Impact**: Medium (complete sitemap coverage)  
**Effort**: ⭐⭐⭐ Medium (30 minutes)  
**Files**: `app/sitemap.ts`

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Create database query functions for events
- [ ] Fetch published events
- [ ] Add event URLs to sitemap
- [ ] Set appropriate priorities (0.7)
- [ ] Set change frequencies (weekly)
- [ ] Test sitemap generation
- [ ] Verify URLs are valid
- [ ] Submit to Google Search Console
- [ ] Commit changes

**Current Code**:
```tsx
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://bskmt.com/', priority: 1.0 },
    { url: 'https://bskmt.com/events', priority: 0.9 },
    // ... static pages only
  ];
}
```

**Updated Code**:
```tsx
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bskmt.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' },
    // ... other static pages
  ];
  
  // Dynamic events
  const events = await getPublicEvents();
  const eventPages: MetadataRoute.Sitemap = events.map(event => ({
    url: `${baseUrl}/events/${event.id}`,
    lastModified: new Date(event.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  return [...staticPages, ...eventPages];
}
```

**Expected Outcome**:
- All event pages in sitemap
- Dynamic sitemap updates automatically
- Better crawl coverage
- Faster indexing of new events

---

### Task 8: Implement Review/Rating Schema
**Impact**: Medium (rich snippets potential)  
**Effort**: ⭐⭐ Easy (20 minutes)  
**Files**: 
- `lib/seo-config.ts`
- `components/home/Testimonials.tsx`

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Add `generateReviewSchema` function to `lib/seo-config.ts`
- [ ] Update Testimonials component to include schema
- [ ] Add aggregate rating schema to homepage
- [ ] Test with Google Rich Results Test
- [ ] Verify schema validates
- [ ] Commit changes

**New Function**:
```tsx
// lib/seo-config.ts
export const generateReviewSchema = (review: {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    itemReviewed: {
      '@type': 'Organization',
      '@id': 'https://bskmt.com/#organization',
    },
  };
};
```

**Expected Outcome**:
- Review stars in search results
- Aggregate rating display
- Better trust signals
- Rich snippets in SERPs

---

## 🟢 LOW PRIORITY TASKS (Week 3-4)

### Task 9: Prepare Multilingual Structure
**Impact**: Low (future-proofing)  
**Effort**: ⭐⭐⭐⭐ High (2-3 hours)  
**Files**: 
- `app/[lang]/` (new directory structure)
- `middleware.ts` (language detection)
- `i18n/translations/` (new)

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Research Next.js 13+ internationalization
- [ ] Design URL structure (/es-co, /es-mx, /en)
- [ ] Create language detection middleware
- [ ] Set up translation files
- [ ] Create language selector component
- [ ] Update hreflang tags dynamically
- [ ] Test language switching
- [ ] Document implementation
- [ ] Commit changes

**Proposed Structure**:
```
app/
├── [lang]/
│   ├── about/page.tsx
│   ├── events/page.tsx
│   └── ...
├── page.tsx (redirect to default lang)
middleware.ts (language detection)
i18n/
├── translations/
│   ├── es-CO.json
│   ├── es-MX.json
│   └── en.json
```

**Expected Outcome**:
- Ready for international expansion
- Mexico market prepared (es-MX)
- English version ready (en)
- Proper hreflang implementation
- SEO for multiple regions

---

### Task 10: Implement Event URL Slugs
**Impact**: Medium (UX + SEO)  
**Effort**: ⭐⭐⭐⭐ High (2-3 hours)  
**Files**: 
- Database schema update
- `app/events/[slug]/page.tsx` (rename from [id])
- Event creation forms
- Slug generation utility

**Status**: ❌ NOT STARTED

**Steps**:
- [ ] Add `slug` field to Event database model
- [ ] Create slug generation utility
- [ ] Update event creation to generate slugs
- [ ] Migrate existing events to have slugs
- [ ] Rename `[id]` route to `[slug]`
- [ ] Update all event links
- [ ] Add redirect from old URLs to new
- [ ] Test all event pages
- [ ] Update sitemap to use slugs
- [ ] Commit changes

**Current URL**:
```
/events/67890abcdef12345
```

**New URL**:
```
/events/tour-andino-2025-bogota-colombia
```

**Slug Generation**:
```tsx
// utils/slug.ts
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace spaces with -
    .replace(/^-+|-+$/g, '');         // Remove leading/trailing -
}

// Example:
generateSlug("Tour Andino 2025 - Bogotá") 
// → "tour-andino-2025-bogota"
```

**Expected Outcome**:
- More readable URLs
- Better SEO (keywords in URL)
- Better click-through rates
- Professional appearance
- Social sharing optimization

---

### Task 11: Add Video Object Schema (If Applicable)
**Impact**: Low (only if video content exists)  
**Effort**: ⭐⭐ Easy (15 minutes)  
**Files**: `lib/seo-config.ts`

**Status**: ❌ NOT STARTED (Conditional)

**Steps**:
- [ ] Check if video content exists on site
- [ ] If yes, create `generateVideoSchema` function
- [ ] Add schema to pages with videos
- [ ] Include thumbnail, duration, upload date
- [ ] Test with Google Rich Results Test
- [ ] Commit changes
- [ ] If no, skip this task

**Schema Example**:
```tsx
export const generateVideoSchema = (video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string; // ISO 8601 format: PT5M30S
  contentUrl: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
  };
};
```

**Expected Outcome** (if applicable):
- Video rich snippets in search
- Video carousel eligibility
- YouTube/video platform integration
- Better multimedia SEO

---

## 📊 Progress Tracking

### Week 1 Progress
**Target**: Complete all HIGH priority tasks (4 tasks)  
**Completed**: 0/4  
**Status**: 🔴 Not Started

- [ ] Task 1: Remove 'use client' from Membership Info
- [ ] Task 2: Add x-default to Hreflang
- [ ] Task 3: Enhance Event Image Alt Texts
- [ ] Task 4: Convert Events Page to Server Component

---

### Week 2 Progress
**Target**: Complete all MEDIUM priority tasks (4 tasks)  
**Completed**: 0/4  
**Status**: 🔴 Not Started

- [ ] Task 5: Enhance Product Image Alt Texts
- [ ] Task 6: Split Contact Page
- [ ] Task 7: Add Dynamic Content to Sitemap
- [ ] Task 8: Implement Review/Rating Schema

---

### Week 3-4 Progress
**Target**: Complete all LOW priority tasks (3 tasks)  
**Completed**: 0/3  
**Status**: 🔴 Not Started

- [ ] Task 9: Prepare Multilingual Structure
- [ ] Task 10: Implement Event URL Slugs
- [ ] Task 11: Add Video Object Schema (if applicable)

---

## 🧪 Testing Checklist

### After Each Task
- [ ] Run `npm run build` - Verify no build errors
- [ ] Run `npm run lint` - Verify no linting errors
- [ ] Test in browser - Verify functionality
- [ ] Check page source - Verify HTML output
- [ ] Test without JavaScript - Verify content visible

### After Week 1 (HIGH Priority Complete)
- [ ] Google Lighthouse SEO audit - Target: 95+
- [ ] Google Rich Results Test - Verify all schemas valid
- [ ] Test alt texts with screen reader
- [ ] Verify Events page renders server-side
- [ ] Check Core Web Vitals scores

### After Week 2 (MEDIUM Priority Complete)
- [ ] Google Search Console - Submit updated sitemap
- [ ] Test dynamic sitemap generation
- [ ] Verify review schema with Rich Results Test
- [ ] Check contact page performance
- [ ] Re-run Lighthouse audit

### Final Testing (All Tasks Complete)
- [ ] Screaming Frog full site crawl
- [ ] All pages indexed in Google (Search Console)
- [ ] All structured data validated
- [ ] Mobile-friendly test passed
- [ ] Core Web Vitals all green
- [ ] Security headers verified
- [ ] Accessibility audit passed (WCAG 2.1 AA)

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tasks tested locally
- [ ] No console errors
- [ ] Build succeeds without warnings
- [ ] All tests pass (if tests exist)
- [ ] Git branch up to date

### Deployment
- [ ] Create production build
- [ ] Deploy to staging environment
- [ ] Test all changes in staging
- [ ] Verify SEO improvements
- [ ] Deploy to production
- [ ] Monitor for errors

### Post-Deployment
- [ ] Submit updated sitemap to Google Search Console
- [ ] Request reindexing of key pages
- [ ] Monitor Core Web Vitals
- [ ] Check Google Analytics
- [ ] Verify structured data in live environment
- [ ] Test hreflang implementation
- [ ] Monitor search rankings (weeks 1-4)

---

## 📈 Success Metrics

### Immediate (Week 1)
- [ ] Lighthouse SEO score: 95+ (current: 90+)
- [ ] All high-priority tasks complete
- [ ] No regressions in functionality
- [ ] Build time not increased significantly

### Short-term (Month 1)
- [ ] Google Search Console: No new errors
- [ ] All pages indexed
- [ ] Rich snippets appearing for events
- [ ] Core Web Vitals: All green

### Medium-term (Months 2-3)
- [ ] Organic traffic: +10-20%
- [ ] Event page impressions: +25-35%
- [ ] Image search traffic: +15-25%
- [ ] Average position improved by 5-10 spots

### Long-term (Months 4-6)
- [ ] Organic traffic: +20-30% total
- [ ] Local search visibility: +25-40%
- [ ] Rich snippets: +40-50% more appearances
- [ ] Click-through rate: +15-20% improvement

---

## 🎯 Final Checklist (Before Marking Complete)

- [ ] All 11 tasks completed
- [ ] All tests passed
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to production
- [ ] Post-deployment verification complete
- [ ] Google Search Console updated
- [ ] Monitoring in place
- [ ] Team trained on new structure
- [ ] Success metrics dashboard created

---

## 📝 Notes & Considerations

### Important Reminders
1. **Always test locally first** before deploying
2. **Backup database** before schema changes (Task 10)
3. **Monitor Google Search Console** for errors after deployment
4. **Don't break existing URLs** without proper redirects
5. **Test on mobile devices** - 70% of traffic is mobile

### Dependencies
- Task 4 should be completed before Task 7 (dynamic sitemap)
- Task 10 requires database migration - coordinate with backend team
- Task 9 requires significant planning - discuss with stakeholders first

### Optional Enhancements
- Consider adding FAQ schema to more pages
- Add Course schema to courses page
- Implement breadcrumb navigation UI (already have schema)
- Add structured data for membership tiers

---

**Status**: ✅ CHECKLIST CREATED - READY FOR IMPLEMENTATION  
**Next Step**: Begin HIGH PRIORITY Task 1  
**Estimated Total Time**: 10-15 hours across 3-4 weeks  
**Expected SEO Score Improvement**: +5-10 points (93/100 → 98/100)

**Document Version**: 1.0.0  
**Last Updated**: October 15, 2025  
**Owner**: Development Team
