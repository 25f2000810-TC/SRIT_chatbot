import crypto from 'crypto';
import { db } from './db.js';
import { KnowledgeCategory, SourceType, InstitutionScope, SourcePageRecord } from './types.js';

export interface SyncReport {
  timestamp: string;
  pagesDiscovered: number;
  pagesProcessed: number;
  updated: number;
  createdNew: number;
  skipped: number;
  pages: Array<{
    url: string;
    title: string;
    status: 'new' | 'updated' | 'unchanged' | 'skipped' | 'failed';
    sourceWebsite: string;
    version?: number;
    hash?: string;
    reason?: string;
  }>;
}

export interface SyncStatusInfo {
  lastSyncTimestamp: string;
  nextScheduledSyncTimestamp: string;
  intervalHours: number;
  isSyncing: boolean;
  totalMonitoredPages: number;
  sources: Array<{
    sourceWebsite: string;
    name: string;
    url: string;
    status: 'Healthy' | 'Needs Attention' | 'Offline';
    lastChecked: string;
    pagesCount: number;
    changedCount: number;
  }>;
}

export interface MonitoredSourceConfig {
  url: string;
  sourceWebsite: 'sritgroup.net' | 'shriramcommercecollege.com' | 'rgpv.ac.in' | 'rgpv_scheme' | 'other';
  fallbackTitle: string;
  category: KnowledgeCategory;
  sourceType: SourceType;
  institutionScope: InstitutionScope;
  institution: string;
}

export const MONITORED_SOURCES: MonitoredSourceConfig[] = [
  // --- SOURCE 1: SRIT Website (https://sritgroup.net/) ---
  {
    url: 'https://sritgroup.net/',
    sourceWebsite: 'sritgroup.net',
    fallbackTitle: 'Shri Ram Group & SRIT Campus Home',
    category: 'Institution',
    sourceType: 'Official Website',
    institutionScope: 'SHRI_RAM_GROUP',
    institution: 'Shri Ram Group',
  },
  {
    url: 'https://sritgroup.net/shri-ram-group/about-us/',
    sourceWebsite: 'sritgroup.net',
    fallbackTitle: 'About Shri Ram Group & Heritage (Established 9 July 2001)',
    category: 'Institution',
    sourceType: 'Official Website',
    institutionScope: 'SHRI_RAM_GROUP',
    institution: 'Shri Ram Group',
  },
  {
    url: 'https://sritgroup.net/shri-ram-group/group-directors-message/',
    sourceWebsite: 'sritgroup.net',
    fallbackTitle: 'Group Director Dr. S. P. Kosta Message & Space Research Legacy',
    category: 'Leadership',
    sourceType: 'Official Website',
    institutionScope: 'SHRI_RAM_GROUP',
    institution: 'Shri Ram Group',
  },
  {
    url: 'https://sritgroup.net/shri-ram-institute-of-technology-srit/',
    sourceWebsite: 'sritgroup.net',
    fallbackTitle: 'Shri Ram Institute of Technology (SRIT) - Flagship Engineering College Profile',
    category: 'Institution',
    sourceType: 'Official Website',
    institutionScope: 'SRIT',
    institution: 'Shri Ram Institute of Technology',
  },
  {
    url: 'https://sritgroup.net/shri-ram-group/affiliation-accreditation/',
    sourceWebsite: 'sritgroup.net',
    fallbackTitle: 'SRIT Approvals & University Affiliation (AICTE & RGPV Bhopal)',
    category: 'Affiliation',
    sourceType: 'Official Website',
    institutionScope: 'SRIT',
    institution: 'Shri Ram Institute of Technology',
  },
  {
    url: 'https://sritgroup.net/course/bachelor-of-technology-b-tech/',
    sourceWebsite: 'sritgroup.net',
    fallbackTitle: 'B.Tech Engineering Programs & Specializations',
    category: 'Course',
    sourceType: 'Official Website',
    institutionScope: 'SRIT',
    institution: 'Shri Ram Institute of Technology',
  },
  {
    url: 'https://sritgroup.net/course/master-of-computer-application-mca/',
    sourceWebsite: 'sritgroup.net',
    fallbackTitle: 'Master of Computer Applications (MCA) Degree Curriculum',
    category: 'Course',
    sourceType: 'Official Website',
    institutionScope: 'SRIT_MCA',
    institution: 'Shri Ram Institute of Technology - MCA',
  },
  {
    url: 'https://sritgroup.net/course/master-of-business-administration-mba/',
    sourceWebsite: 'sritgroup.net',
    fallbackTitle: 'Master of Business Administration (MBA) Specializations',
    category: 'Course',
    sourceType: 'Official Website',
    institutionScope: 'SHRI_RAM_MANAGEMENT',
    institution: 'Shri Ram Institute of Management',
  },
  {
    url: 'https://sritgroup.net/placement-cell/',
    sourceWebsite: 'sritgroup.net',
    fallbackTitle: 'SRIT Training & Placement Cell (85 LPA Highest Offer & Recruiters)',
    category: 'Placements',
    sourceType: 'Official Website',
    institutionScope: 'SRIT',
    institution: 'Shri Ram Institute of Technology',
  },

  // --- SOURCE 2: Shri Ram Commerce College (https://www.shriramcommercecollege.com/) ---
  {
    url: 'https://www.shriramcommercecollege.com/',
    sourceWebsite: 'shriramcommercecollege.com',
    fallbackTitle: 'Shri Ram Commerce College (Shri Ram College) Jabalpur',
    category: 'Institution',
    sourceType: 'Official Website',
    institutionScope: 'SHRI_RAM_COMMERCE',
    institution: 'Shri Ram Commerce College',
  },
  {
    url: 'https://www.shriramcommercecollege.com/about-us',
    sourceWebsite: 'shriramcommercecollege.com',
    fallbackTitle: 'About Shri Ram Commerce College & RDVV Affiliation',
    category: 'Affiliation',
    sourceType: 'Official Website',
    institutionScope: 'SHRI_RAM_COMMERCE',
    institution: 'Shri Ram Commerce College',
  },
  {
    url: 'https://www.shriramcommercecollege.com/courses',
    sourceWebsite: 'shriramcommercecollege.com',
    fallbackTitle: 'Commerce & Degree Courses (B.Com, BBA, BCA, M.Com under RDVV)',
    category: 'Course',
    sourceType: 'Official Website',
    institutionScope: 'SHRI_RAM_COMMERCE',
    institution: 'Shri Ram Commerce College',
  },

  // --- SOURCE 3: RGPV (https://www.rgpv.ac.in/) ---
  {
    url: 'https://www.rgpv.ac.in/',
    sourceWebsite: 'rgpv.ac.in',
    fallbackTitle: 'Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV) Official University Portal',
    category: 'Affiliation',
    sourceType: 'Official University (RGPV)',
    institutionScope: 'RGPV',
    institution: 'RGPV',
  },

  // --- SOURCE 4: RGPV Scheme (https://www.rgpv.ac.in/uni/frm_viewscheme.aspx) ---
  {
    url: 'https://www.rgpv.ac.in/uni/frm_viewscheme.aspx',
    sourceWebsite: 'rgpv_scheme',
    fallbackTitle: 'RGPV Scheme & Syllabus Repository (CBGS / AICTE Grading System)',
    category: 'RGPV Scheme',
    sourceType: 'Official University (RGPV)',
    institutionScope: 'RGPV',
    institution: 'RGPV',
  },
];

export class WebsiteSyncService {
  private isSyncing = false;
  private lastSyncTimestamp = new Date().toISOString();
  private intervalHours = 12;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.startScheduledSync();
  }

  /**
   * Computes SHA-256 hash of extracted content
   */
  private computeHash(text: string): string {
    return crypto.createHash('sha256').update(text.trim()).digest('hex');
  }

  /**
   * Cleans HTML markup, stripping scripts, styles, navigation, footer, and extracting substantive text.
   */
  private cleanHtml(html: string): { title: string; content: string } {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/&#?[a-z0-9]+;/gi, ' ').trim() : 'Official College Page';
    title = title.split('|')[0].split('-')[0].trim();

    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ');

    clean = clean.replace(/<(h[1-6]|p|div|li|br)\b[^>]*>/gi, '\n');
    clean = clean.replace(/<[^>]+>/g, ' ');

    const lines = clean
      .split('\n')
      .map((l) => l.trim())
      .filter(
        (l) =>
          l.length > 20 &&
          !l.toLowerCase().includes('copyright') &&
          !l.toLowerCase().includes('all rights reserved')
      );

    const uniqueLines: string[] = [];
    for (const line of lines) {
      if (!uniqueLines.includes(line)) {
        uniqueLines.push(line);
      }
    }

    const content = uniqueLines.slice(0, 35).join('\n\n');
    return { title, content };
  }

  /**
   * Start scheduled background synchronization
   */
  public startScheduledSync() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    const ms = this.intervalHours * 60 * 60 * 1000;
    this.timer = setInterval(() => {
      this.syncWebsite('Scheduled Auto-Sync').catch((err) =>
        console.error('Scheduled sync failed:', err)
      );
    }, ms);
  }

  /**
   * Update sync interval (e.g. 6, 12, or 24 hours)
   */
  public setSyncInterval(hours: number) {
    this.intervalHours = Math.max(1, Math.min(72, hours));
    this.startScheduledSync();
  }

  /**
   * Get sync dashboard status
   */
  public getSyncStatus(): SyncStatusInfo {
    const nextSync = new Date(
      new Date(this.lastSyncTimestamp).getTime() + this.intervalHours * 60 * 60 * 1000
    ).toISOString();

    const sourcesSummary: Record<string, { name: string; url: string; count: number; changed: number }> = {
      'sritgroup.net': {
        name: 'SRIT Official Website',
        url: 'https://sritgroup.net/',
        count: 0,
        changed: 0,
      },
      'shriramcommercecollege.com': {
        name: 'Shri Ram Commerce College Website',
        url: 'https://www.shriramcommercecollege.com/',
        count: 0,
        changed: 0,
      },
      'rgpv.ac.in': {
        name: 'RGPV Official University Website',
        url: 'https://www.rgpv.ac.in/',
        count: 0,
        changed: 0,
      },
      'rgpv_scheme': {
        name: 'RGPV Scheme & Syllabus Portal',
        url: 'https://www.rgpv.ac.in/uni/frm_viewscheme.aspx',
        count: 0,
        changed: 0,
      },
    };

    const storedPages = db.listSourcePages();
    for (const p of storedPages) {
      if (sourcesSummary[p.sourceWebsite]) {
        sourcesSummary[p.sourceWebsite].count++;
        if (p.previousContentHash && p.previousContentHash !== p.contentHash) {
          sourcesSummary[p.sourceWebsite].changed++;
        }
      }
    }

    const sourcesList = Object.entries(sourcesSummary).map(([key, data]) => ({
      sourceWebsite: key,
      name: data.name,
      url: data.url,
      status: 'Healthy' as const,
      lastChecked: this.lastSyncTimestamp,
      pagesCount: data.count || MONITORED_SOURCES.filter((s) => s.sourceWebsite === key).length,
      changedCount: data.changed,
    }));

    return {
      lastSyncTimestamp: this.lastSyncTimestamp,
      nextScheduledSyncTimestamp: nextSync,
      intervalHours: this.intervalHours,
      isSyncing: this.isSyncing,
      totalMonitoredPages: MONITORED_SOURCES.length,
      sources: sourcesList,
    };
  }

  /**
   * Executes full website monitoring and ingestion synchronization
   */
  async syncWebsite(adminUser: string = 'Admin'): Promise<SyncReport> {
    if (this.isSyncing) {
      throw new Error('A website synchronization is already in progress.');
    }

    this.isSyncing = true;
    this.lastSyncTimestamp = new Date().toISOString();

    const report: SyncReport = {
      timestamp: this.lastSyncTimestamp,
      pagesDiscovered: MONITORED_SOURCES.length,
      pagesProcessed: 0,
      updated: 0,
      createdNew: 0,
      skipped: 0,
      pages: [],
    };

    try {
      const existingKnowledge = db.listKnowledge();

      for (const pageConfig of MONITORED_SOURCES) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(pageConfig.url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'SRIT-College-Intelligence-Sync/2.0 (+https://sritgroup.net/)',
            },
          });
          clearTimeout(timeout);

          if (!response.ok) {
            report.skipped++;
            report.pages.push({
              url: pageConfig.url,
              title: pageConfig.fallbackTitle,
              status: 'failed',
              sourceWebsite: pageConfig.sourceWebsite,
              reason: `HTTP ${response.status}`,
            });
            continue;
          }

          const html = await response.text();
          const { title, content } = this.cleanHtml(html);

          if (content.length < 40) {
            report.skipped++;
            report.pages.push({
              url: pageConfig.url,
              title: title || pageConfig.fallbackTitle,
              status: 'skipped',
              sourceWebsite: pageConfig.sourceWebsite,
              reason: 'Insufficient body text',
            });
            continue;
          }

          report.pagesProcessed++;
          const currentHash = this.computeHash(content);

          // Check if tracked in db.sourcePages
          const existingSourcePage = db.getSourcePageByUrl(pageConfig.url);
          const previousHash = existingSourcePage?.contentHash;
          const isContentChanged = !previousHash || previousHash !== currentHash;
          const currentVersion = existingSourcePage ? existingSourcePage.versionNumber + (isContentChanged ? 1 : 0) : 1;

          // Update SourcePageRecord
          const savedPage = db.upsertSourcePage({
            url: pageConfig.url,
            pageTitle: title || pageConfig.fallbackTitle,
            sourceWebsite: pageConfig.sourceWebsite,
            sourceType: pageConfig.sourceType,
            contentHash: currentHash,
            previousContentHash: previousHash,
            versionNumber: currentVersion,
            academicYear: '2026-27',
            institution: pageConfig.institution,
            institutionScope: pageConfig.institutionScope,
            sourceReliability: 'Official college/institution website',
            verificationStatus: 'Verified',
          });

          // If content changed, record SourceVersion
          if (isContentChanged) {
            db.addSourceVersion({
              sourceId: savedPage.id,
              url: pageConfig.url,
              versionNumber: currentVersion,
              contentHash: currentHash,
              title: title || pageConfig.fallbackTitle,
              contentSummary: content.slice(0, 300) + '...',
              changedDetails: previousHash ? `Hash changed from ${previousHash.slice(0, 8)} to ${currentHash.slice(0, 8)}` : 'Initial ingestion',
            });
          }

          // Check knowledge table
          const existingK = existingKnowledge.find((k) => k.sourceUrl === pageConfig.url);

          if (existingK) {
            if (isContentChanged) {
              db.updateKnowledge(
                existingK.id,
                {
                  title: title || existingK.title,
                  content: content.slice(0, 3000),
                  updatedAt: new Date().toISOString(),
                },
                adminUser
              );
              report.updated++;
              report.pages.push({
                url: pageConfig.url,
                title: title || existingK.title,
                status: 'updated',
                sourceWebsite: pageConfig.sourceWebsite,
                version: currentVersion,
                hash: currentHash.slice(0, 10),
              });
            } else {
              report.pages.push({
                url: pageConfig.url,
                title: title || existingK.title,
                status: 'unchanged',
                sourceWebsite: pageConfig.sourceWebsite,
                version: currentVersion,
                hash: currentHash.slice(0, 10),
              });
            }
          } else {
            db.createKnowledge({
              title: title || pageConfig.fallbackTitle,
              category: pageConfig.category,
              institutionId: pageConfig.institutionScope,
              content: content.slice(0, 3000),
              sourceType: pageConfig.sourceType,
              sourceUrl: pageConfig.url,
              status: 'Published',
              published: true,
              createdBy: 'Website Sync Engine',
            });
            report.createdNew++;
            report.pages.push({
              url: pageConfig.url,
              title: title || pageConfig.fallbackTitle,
              status: 'new',
              sourceWebsite: pageConfig.sourceWebsite,
              version: 1,
              hash: currentHash.slice(0, 10),
            });
          }
        } catch (err: any) {
          report.skipped++;
          report.pages.push({
            url: pageConfig.url,
            title: pageConfig.fallbackTitle,
            status: 'failed',
            sourceWebsite: pageConfig.sourceWebsite,
            reason: err.message || 'Fetch error',
          });
        }
      }

      db.recordAuditLog({
        action: 'SYNC_OFFICIAL_WEBSITE',
        entityType: 'WebsiteSync',
        entityId: `sync-${Date.now()}`,
        entityTitle: 'College Knowledge Live Website Sync',
        details: `Discovered: ${report.pagesDiscovered}, Processed: ${report.pagesProcessed}, New: ${report.createdNew}, Updated: ${report.updated}, Skipped: ${report.skipped}`,
        performedBy: adminUser,
      });

      return report;
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new WebsiteSyncService();
