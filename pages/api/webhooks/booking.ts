import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { checkRateLimit, getClientIp } from '@/lib/apiMiddleware';

// ══════════════════════════════════════════════
// TIBRAH Booking Notification System
// Sends: Email → Gmail | WhatsApp link in email
// ══════════════════════════════════════════════

const DOCTOR_EMAIL   = 'dr.omaralemad@gmail.com';
const DOCTOR_PHONE   = '967771447111';
const DOCTOR_IG      = 'dr.omr369';
const DOCTOR_TIKTOK  = 'dr.omr369';
const APP_NAME       = 'طِبرَا - العيادة الرقمية';

function getWebhookSecret(req: NextApiRequest): string | undefined {
    const headerSecret = req.headers['x-booking-secret'];
    const authorization = req.headers.authorization;
    const bearerSecret = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    return Array.isArray(headerSecret) ? headerSecret[0] : headerSecret || bearerSecret;
}

function cleanText(input: unknown, maxLength = 500): string {
    if (typeof input !== 'string') return '';
    return input.replace(/<[^>]*>/g, '').trim().slice(0, maxLength);
}

function escapeHtml(input: unknown, maxLength = 500): string {
    return cleanText(input, maxLength).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char] ?? char));
}

function sanitizeBookingData(body: Record<string, unknown>) {
    return {
        patient_name: escapeHtml(body.patient_name, 120),
        patient_phone: cleanText(body.patient_phone, 40),
        patient_email: escapeHtml(body.patient_email, 160),
        session_type_label: escapeHtml(body.session_type_label, 120),
        date: escapeHtml(body.date, 80),
        time_slot: escapeHtml(body.time_slot, 80),
        health_concern: escapeHtml(body.health_concern, 2000),
        emotional_context: escapeHtml(body.emotional_context, 2000),
    };
}

function buildWhatsAppLink(phone: string, message: string) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function buildEmailHTML(data: any): string {
    const {
        patient_name, patient_phone, patient_email,
        session_type_label, date, time_slot, health_concern,
        emotional_context
    } = data;

    const whatsappMsg = `مرحباً د. عمر، اسمي ${patient_name} وأريد تأكيد موعدي في ${date} الساعة ${time_slot}`;
    const waLink = buildWhatsAppLink(DOCTOR_PHONE, whatsappMsg);

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>حجز جديد — طِبرَا</title>
</head>
<body style="margin:0;padding:0;background:#f0faf8;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0d9488,#10b981);border-radius:20px 20px 0 0;padding:32px 32px 24px;text-align:center;">
          <div style="width:60px;height:60px;background:rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:28px;">🏥</span>
          </div>
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">حجز جديد — طِبرَا</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">العيادة الرقمية · د. عمر العماد</p>
        </td></tr>

        <!-- Alert Badge -->
        <tr><td style="background:#fff;padding:20px 32px 0;">
          <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #f59e0b;border-radius:12px;padding:12px 16px;text-align:center;">
            <span style="font-size:14px;font-weight:700;color:#92400e;">🔔 طلب حجز جديد يحتاج تأكيدك</span>
          </div>
        </td></tr>

        <!-- Patient Info -->
        <tr><td style="background:#fff;padding:24px 32px 0;">
          <h2 style="color:#0f172a;font-size:16px;margin:0 0 16px;font-weight:800;display:flex;align-items:center;gap:8px;">👤 بيانات المريض</h2>
          <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
            <tr style="background:#f8fafc;border-radius:8px;">
              <td style="padding:10px 14px;color:#64748b;font-size:13px;font-weight:600;width:40%;border-radius:8px 0 0 8px;">الاسم</td>
              <td style="padding:10px 14px;color:#0f172a;font-size:13px;font-weight:700;border-radius:0 8px 8px 0;">${patient_name}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#64748b;font-size:13px;font-weight:600;">رقم الجوال</td>
              <td style="padding:10px 14px;font-size:13px;">
                <a href="${waLink}" style="color:#0d9488;font-weight:700;text-decoration:none;">📱 ${patient_phone} — تواصل واتساب</a>
              </td>
            </tr>
            ${patient_email ? `<tr style="background:#f8fafc;">
              <td style="padding:10px 14px;color:#64748b;font-size:13px;font-weight:600;">البريد الإلكتروني</td>
              <td style="padding:10px 14px;color:#0f172a;font-size:13px;">${patient_email}</td>
            </tr>` : ''}
          </table>
        </td></tr>

        <!-- Session Info -->
        <tr><td style="background:#fff;padding:20px 32px 0;">
          <h2 style="color:#0f172a;font-size:16px;margin:0 0 16px;font-weight:800;">📅 تفاصيل الجلسة</h2>
          <div style="background:linear-gradient(135deg,rgba(13,148,136,0.06),rgba(16,185,129,0.04));border:1px solid rgba(13,148,136,0.15);border-radius:14px;padding:16px 20px;">
            <table width="100%" cellpadding="6" cellspacing="0">
              <tr>
                <td style="color:#64748b;font-size:13px;font-weight:600;width:35%;">نوع الجلسة</td>
                <td style="color:#0d9488;font-size:14px;font-weight:800;">${session_type_label}</td>
              </tr>
              <tr>
                <td style="color:#64748b;font-size:13px;font-weight:600;">التاريخ</td>
                <td style="color:#0f172a;font-size:14px;font-weight:700;">${date}</td>
              </tr>
              <tr>
                <td style="color:#64748b;font-size:13px;font-weight:600;">الوقت</td>
                <td style="color:#0f172a;font-size:14px;font-weight:700;">${time_slot}</td>
              </tr>
            </table>
          </div>
        </td></tr>

        <!-- Health Concern -->
        ${health_concern ? `<tr><td style="background:#fff;padding:20px 32px 0;">
          <h2 style="color:#0f172a;font-size:16px;margin:0 0 12px;font-weight:800;">🩺 الشكوى الصحية</h2>
          <div style="background:#f8fafc;border-right:4px solid #0d9488;border-radius:0 8px 8px 0;padding:12px 16px;">
            <p style="color:#334155;font-size:13px;line-height:1.7;margin:0;">${health_concern.replace(/\n/g, '<br>')}</p>
          </div>
        </td></tr>` : ''}

        <!-- Emotional Context -->
        ${emotional_context ? `<tr><td style="background:#fff;padding:20px 32px 0;">
          <h2 style="color:#0f172a;font-size:16px;margin:0 0 12px;font-weight:800;">💛 السياق العاطفي</h2>
          <div style="background:#fffbeb;border-right:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;">
            <p style="color:#78350f;font-size:13px;line-height:1.7;margin:0;">${emotional_context}</p>
          </div>
        </td></tr>` : ''}

        <!-- Action Buttons -->
        <tr><td style="background:#fff;padding:24px 32px;border-radius:0 0 20px 20px;">
          <p style="color:#64748b;font-size:13px;margin:0 0 16px;text-align:center;">تواصل مع المريض فوراً:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:0 6px;">
                <a href="${waLink}" style="display:inline-block;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:700;">💬 واتساب</a>
              </td>
              <td align="center" style="padding:0 6px;">
                <a href="https://instagram.com/${DOCTOR_IG}" style="display:inline-block;background:linear-gradient(135deg,#e1306c,#833ab4);color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:700;">📸 إنستغرام</a>
              </td>
              <td align="center" style="padding:0 6px;">
                <a href="https://tiktok.com/@${DOCTOR_TIKTOK}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:700;">🎵 تيكتوك</a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px;text-align:center;">
          <p style="color:#94a3b8;font-size:11px;margin:0;">طِبرَا — العيادة الرقمية · تم الإرسال تلقائياً عند تسجيل الحجز</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const ip = getClientIp(req);
    const limit = await checkRateLimit(`booking_webhook_${ip}`, 20, 60 * 1000);
    if (limit.limited) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    const expectedSecret = process.env.BOOKING_WEBHOOK_SECRET?.trim() || process.env.ADMIN_API_SECRET?.trim();
    if (!expectedSecret) {
        return res.status(503).json({ error: 'Booking webhook is not configured' });
    }

    if (getWebhookSecret(req) !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = sanitizeBookingData(req.body ?? {});
    console.log('[Tibrah Booking] New appointment notification received');

    // ── Email via Nodemailer (Gmail SMTP) ──────────────────────────
    try {
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;

        if (gmailUser && gmailPass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass },
            });

            await transporter.sendMail({
                from: `"${APP_NAME}" <${gmailUser}>`,
                to: DOCTOR_EMAIL,
                subject: `🏥 حجز جديد — ${data.patient_name} · ${data.date} ${data.time_slot}`,
                html: buildEmailHTML(data),
            });

            console.log('[Tibrah Booking] Email sent to', DOCTOR_EMAIL);
        } else {
            console.warn('[Tibrah Booking] Gmail credentials not set. Email skipped.');
        }
    } catch (emailErr) {
        console.error('[Tibrah Booking] Email error:', emailErr);
        // Non-fatal — booking still saved to DB
    }

    return res.status(200).json({
        success: true,
        message: 'Booking notification processed',
        channels: ['firebase_db', 'email', 'whatsapp_link'],
    });
}
