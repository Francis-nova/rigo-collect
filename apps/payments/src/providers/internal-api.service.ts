import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import indexConfig from '../configs/index.config';

interface InternalBusinessResponse<T = any> {
  status: boolean;
  message?: string;
  business?: T;
  owner?: { email: string } | null;
}

@Injectable()
export class InternalApiService {
  constructor(private readonly http: HttpService) {}

  // Simple in-memory cache to avoid repeated calls during bursts
  private cache = new Map<string, { data: InternalBusinessResponse; expires: number }>();
  private ttlMs = 60_000; // 1 minute TTL

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const internalKey = indexConfig.auth.internalApiKey;
    if (internalKey) headers['X-Internal-Key'] = internalKey;
    return headers;
  }

  async getBusinessInfo(businessId: string): Promise<InternalBusinessResponse> {
    // Serve from cache if available and not expired
    const now = Date.now();
    const cached = this.cache.get(businessId);
    if (cached && cached.expires > now) {
      return cached.data;
    }

    const baseUrl = indexConfig.auth.baseUrl;
    const apiPrefix = indexConfig.apiPrefix;
    const url = `${baseUrl}/${apiPrefix}/internal/business/${businessId}`;
    const headers = this.buildHeaders();
    const resp = await this.http.axiosRef.get(url, { headers });
    const data: InternalBusinessResponse = resp.data?.data ?? { status: false };
    // Cache the result regardless of status to dampen repeated calls
    this.cache.set(businessId, { data, expires: now + this.ttlMs });
    return data;
  }

  // Returns consolidated recipient emails: business.email + owner.email + metadata fallbacks
  async getRecipientEmails(
    businessId: string,
    meta?: Record<string, any>
  ): Promise<string[]> {
    const emails: string[] = [];
    try {
      const info = await this.getBusinessInfo(businessId);
      if (info?.status) {
        const bizEmail = info.business?.email ?? null;
        const ownerEmail = info.owner?.email ?? null;
        if (bizEmail) emails.push(bizEmail);
        if (ownerEmail) emails.push(ownerEmail);
      }
    } catch (_) {
      // ignore internal API failures, we'll rely on metadata
    }
    const m = (meta || {}) as any;
    if (Array.isArray(m.notifyEmails)) emails.push(...m.notifyEmails);
    if (m.notifyBusinessEmail) emails.push(m.notifyBusinessEmail);
    if (m.notifyOwnerEmail) emails.push(m.notifyOwnerEmail);
    // unique + filter blanks
    return Array.from(new Set(emails.filter(Boolean)));
  }
}
