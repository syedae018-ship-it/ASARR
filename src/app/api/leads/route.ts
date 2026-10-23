import { NextResponse } from 'next/server';
import { supabase, ASARR_INSTALLATION_OWNER_ID } from '@/lib/supabaseClient';

// Map website form budget labels to numeric ranges for CRM reporting
function parseBudgetRange(budgetStr?: string): { min: number | null; max: number | null } {
  if (!budgetStr) return { min: null, max: null };
  const str = budgetStr.toLowerCase().replace(/[\$,\s]/g, '');

  if (str.includes('<10k')) return { min: 0, max: 10000 };
  if (str.includes('10k-25k')) return { min: 10000, max: 25000 };
  if (str.includes('25k-50k')) return { min: 25000, max: 50000 };
  if (str.includes('50k+')) return { min: 50000, max: null };
  if (str.includes('15k-30k')) return { min: 15000, max: 30000 };

  return { min: null, max: null };
}

// Map website service titles to CRM seeded service names
const SERVICE_NAME_MAPPINGS: Record<string, string[]> = {
  'website development': [
    'Modern Website Design & Development',
    'Custom Web Application Development',
  ],
  'app development': [
    'Mobile Application Development',
    'Custom Software & SaaS Architecture',
  ],
  'brand strategy': [
    'Branding & Visual Identity Design',
  ],
  'brand identity & redesign': [
    'Branding & Visual Identity Design',
  ],
  'content production': [
    'Content Creation, Photo & Videography',
    'Social Media Management & Growth',
  ],
  'digital marketing': [
    'Performance Marketing & Paid Ads',
    'Search Engine Optimization (SEO)',
    'Social Media Management & Growth',
  ],
  'performance & growth marketing': [
    'Performance Marketing & Paid Ads',
    'Search Engine Optimization (SEO)',
  ],
  'ai & custom software': [
    'Custom Software & SaaS Architecture',
    'Custom Web Application Development',
  ],
  'full-stack web or app build': [
    'Custom Web Application Development',
    'Mobile Application Development',
  ],
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      company,
      budget,
      services = [],
      message,
      source = 'website',
      custom_data = {},
      _hp, // Honeypot field for bot prevention
    } = body;

    // Silent rejection for automated bot submissions that populate honeypot
    if (_hp) {
      return NextResponse.json({ success: true, message: 'Inquiry received' });
    }

    // Validation
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : null;
    const trimmedCompany = typeof company === 'string' ? company.trim() : null;
    const trimmedMessage = typeof message === 'string' ? message.trim() : null;

    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid full name.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const { min: budgetMin, max: budgetMax } = parseBudgetRange(budget);
    const leadId = crypto.randomUUID();

    // 1. Persist lead record into public.leads
    const { error: insertLeadError } = await supabase.from('leads').insert({
      id: leadId,
      user_id: ASARR_INSTALLATION_OWNER_ID,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || null,
      company: trimmedCompany || null,
      budget_min: budgetMin,
      budget_max: budgetMax,
      message: trimmedMessage || null,
      status: 'new',
      custom_data: {
        ...custom_data,
        source,
        budget_range: budget || null,
        requested_services: services,
        submitted_at: new Date().toISOString(),
      },
    });

    if (insertLeadError) {
      console.error('[API /api/leads] Error inserting lead:', insertLeadError);
      return NextResponse.json(
        { success: false, error: 'Unable to submit enquiry at this time. Please try again or email hello@asarr.in directly.' },
        { status: 500 }
      );
    }

    // 2. Associate services if selected
    if (Array.isArray(services) && services.length > 0) {
      try {
        const { data: dbServices } = await supabase
          .from('services')
          .select('id, name')
          .eq('is_active', true);

        if (dbServices && dbServices.length > 0) {
          const matchedServiceIds = new Set<string>();

          for (const rawSvc of services) {
            const cleanSvc = String(rawSvc).trim().toLowerCase();
            const targetNames = SERVICE_NAME_MAPPINGS[cleanSvc] || [rawSvc];

            for (const target of targetNames) {
              const found = dbServices.find(
                (s) => s.name.toLowerCase() === target.toLowerCase()
              );
              if (found) matchedServiceIds.add(found.id);
            }
          }

          if (matchedServiceIds.size > 0) {
            const leadServiceRows = Array.from(matchedServiceIds).map((serviceId) => ({
              lead_id: leadId,
              service_id: serviceId,
            }));

            const { error: lsErr } = await supabase
              .from('lead_services')
              .insert(leadServiceRows);

            if (lsErr) {
              console.warn('[API /api/leads] Warning associating lead services:', lsErr);
            }
          }
        }
      } catch (svcErr) {
        console.warn('[API /api/leads] Exception processing services:', svcErr);
      }
    }

    return NextResponse.json({
      success: true,
      leadId,
      message: 'Inquiry received successfully. Our partner director will contact you within 24 hours.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[API /api/leads] Unexpected server error:', message);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing submission.' },
      { status: 500 }
    );
  }
}
