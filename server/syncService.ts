import { db } from './db.js';
import { KnowledgeCategory } from './types.js';

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
    status: 'new' | 'updated' | 'skipped' | 'failed';
    reason?: string;
  }>;
}

const OFFICIAL_PAGES_TO_SYNC = [
  {
    url: 'https://sritgroup.net/',
    category: 'College' as KnowledgeCategory,
    fallbackTitle: 'SRIT Homepage & Campus Overview',
  },
  {
    url: 'https://sritgroup.net/shri-ram-group/about-us/',
    category: 'College' as KnowledgeCategory,
    fallbackTitle: 'About Shri Ram Group & SRIT Heritage',
  },
  {
    url: 'https://sritgroup.net/shri-ram-group/vision-mission/',
    category: 'College' as KnowledgeCategory,
    fallbackTitle: 'SRIT Vision, Mission & Quality Policy',
  },
  {
    url: 'https://sritgroup.net/shri-ram-group/affiliation-accreditation/',
    category: 'College' as KnowledgeCategory,
    fallbackTitle: 'SRIT Approvals, Affiliation & Accreditations',
  },
  {
    url: 'https://sritgroup.net/shri-ram-group/infrastructure/',
    category: 'Facilities' as KnowledgeCategory,
    fallbackTitle: 'Campus Infrastructure & Laboratory Facilities',
  },
  {
    url: 'https://sritgroup.net/course/bachelor-of-technology-b-tech/',
    category: 'Academics' as KnowledgeCategory,
    fallbackTitle: 'Bachelor of Technology (B.Tech) Programs & Specializations',
  },
  {
    url: 'https://sritgroup.net/course/master-of-engineering-me-m-tech/',
    category: 'Academics' as KnowledgeCategory,
    fallbackTitle: 'M.Tech Engineering Programs',
  },
  {
    url: 'https://sritgroup.net/course/master-of-computer-application-mca/',
    category: 'Academics' as KnowledgeCategory,
    fallbackTitle: 'Master of Computer Applications (MCA)',
  },
  {
    url: 'https://sritgroup.net/course/master-of-business-administration-mba/',
    category: 'Academics' as KnowledgeCategory,
    fallbackTitle: 'Master of Business Administration (MBA)',
  },
  {
    url: 'https://sritgroup.net/shri-ram-institute-of-technology-srit/',
    category: 'College' as KnowledgeCategory,
    fallbackTitle: 'Shri Ram Institute of Technology (SRIT) Profile',
  },
];

export class WebsiteSyncService {
  /**
   * Cleans HTML markup, stripping scripts, styles, navigation, footer, and extracting substantive text.
   */
  private cleanHtml(html: string): { title: string; content: string } {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/&#?[a-z0-9]+;/gi, ' ').trim() : 'SRIT Official Page';
    title = title.split('|')[0].split('-')[0].trim();

    // Remove script, style, svg, noscript, header, footer, nav
    let clean = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ');

    // Replace HTML tags with space or newline
    clean = clean.replace(/<(h[1-6]|p|div|li|br)\b[^>]*>/gi, '\n');
    clean = clean.replace(/<[^>]+>/g, ' ');

    // Normalize whitespace
    const lines = clean
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 25 && !l.toLowerCase().includes('copyright') && !l.toLowerCase().includes('all rights reserved'));

    // Deduplicate consecutive identical lines
    const uniqueLines: string[] = [];
    for (const line of lines) {
      if (!uniqueLines.includes(line)) {
        uniqueLines.push(line);
      }
    }

    const content = uniqueLines.slice(0, 30).join('\n\n');
    return { title, content };
  }

  /**
   * Executes website synchronization
   */
  async syncWebsite(adminUser: string = 'Admin'): Promise<SyncReport> {
    const report: SyncReport = {
      timestamp: new Date().toISOString(),
      pagesDiscovered: OFFICIAL_PAGES_TO_SYNC.length,
      pagesProcessed: 0,
      updated: 0,
      createdNew: 0,
      skipped: 0,
      pages: [],
    };

    const existingKnowledge = db.listKnowledge();

    for (const pageConfig of OFFICIAL_PAGES_TO_SYNC) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(pageConfig.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SRIT-Knowledge-Sync/1.0 (College-Assistant)',
          },
        });
        clearTimeout(timeout);

        if (!response.ok) {
          report.skipped++;
          report.pages.push({
            url: pageConfig.url,
            title: pageConfig.fallbackTitle,
            status: 'failed',
            reason: `HTTP ${response.status}`,
          });
          continue;
        }

        const html = await response.text();
        const { title, content } = this.cleanHtml(html);

        if (content.length < 50) {
          report.skipped++;
          report.pages.push({
            url: pageConfig.url,
            title: title || pageConfig.fallbackTitle,
            status: 'skipped',
            reason: 'Insufficient body text',
          });
          continue;
        }

        report.pagesProcessed++;

        // Check if item already exists with this sourceUrl
        const existing = existingKnowledge.find((k) => k.sourceUrl === pageConfig.url);

        if (existing) {
          db.updateKnowledge(
            existing.id,
            {
              title: title || existing.title,
              content: content.slice(0, 3000),
              updatedAt: new Date().toISOString(),
            },
            adminUser
          );
          report.updated++;
          report.pages.push({
            url: pageConfig.url,
            title: title || existing.title,
            status: 'updated',
          });
        } else {
          db.createKnowledge({
            title: title || pageConfig.fallbackTitle,
            category: pageConfig.category,
            content: content.slice(0, 3000),
            sourceType: 'Official Website',
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
          });
        }
      } catch (err: any) {
        report.skipped++;
        report.pages.push({
          url: pageConfig.url,
          title: pageConfig.fallbackTitle,
          status: 'failed',
          reason: err.message || 'Fetch error',
        });
      }
    }

    db.recordAuditLog({
      action: 'SYNC_OFFICIAL_WEBSITE',
      entityType: 'WebsiteSync',
      entityId: `sync-${Date.now()}`,
      entityTitle: 'SRIT Official Website Sync',
      details: `Discovered: ${report.pagesDiscovered}, Processed: ${report.pagesProcessed}, New: ${report.createdNew}, Updated: ${report.updated}, Skipped: ${report.skipped}`,
      performedBy: adminUser,
    });

    return report;
  }
}

export const syncService = new WebsiteSyncService();
