"use strict";
/**
 * mail-forwarder.ts
 * PM2 worker — polls mail.gw every 60s and forwards new emails to clients.
 * Run: pm2 start scripts/mail-forwarder.js --name mail-forwarder
 * (compile first: npx tsc scripts/mail-forwarder.ts --outDir scripts/dist --esModuleInterop --resolveJsonModule --module commonjs --target es2019 --skipLibCheck)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.join(__dirname, '../.env.local') });
// Dynamic imports after env loaded
async function main() {
    var _a;
    const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
    const { Resend } = await Promise.resolve().then(() => __importStar(require('resend')));
    const { decrypt } = await Promise.resolve().then(() => __importStar(require('../src/lib/crypto')));
    const { mailGwGetToken, mailGwGetMessages, mailGwGetMessage, mailGwMarkRead } = await Promise.resolve().then(() => __importStar(require('../src/lib/mailgw')));
    const prisma = new PrismaClient();
    const resend = new Resend(process.env.RESEND_API_KEY);
    const EMAIL_FROM = (_a = process.env.EMAIL_FROM) !== null && _a !== void 0 ? _a : 'NaviPass <noreply@navipass.to>';
    const POLL_INTERVAL = 60000; // 60 seconds
    async function poll() {
        var _a, _b, _c, _d;
        console.log(`[mail-forwarder] ${new Date().toISOString()} — polling...`);
        // Get all orders with active mail.gw forwarding
        const orders = await prisma.order.findMany({
            where: {
                mailGwForwarding: true,
                mailGwEmail: { not: null },
                mailGwPassword: { not: null },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                mailGwEmail: true,
                mailGwPassword: true,
                mailGwLastCheckedAt: true,
                accountExpiry: true,
            },
        });
        for (const order of orders) {
            try {
                // Stop forwarding if subscription expired
                if (order.accountExpiry && new Date() > order.accountExpiry) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { mailGwForwarding: false },
                    });
                    console.log(`[mail-forwarder] Stopped forwarding for ${order.id} — subscription expired`);
                    continue;
                }
                const gwEmail = decrypt(order.mailGwEmail);
                const gwPassword = decrypt(order.mailGwPassword);
                const token = await mailGwGetToken(gwEmail, gwPassword);
                const messages = await mailGwGetMessages(token);
                // Only process unseen messages newer than lastCheckedAt
                const cutoff = (_a = order.mailGwLastCheckedAt) !== null && _a !== void 0 ? _a : new Date(0);
                const newMessages = messages.filter((m) => !m.seen && new Date(m.createdAt) > cutoff);
                for (const msg of newMessages) {
                    const full = await mailGwGetMessage(token, msg.id);
                    // Forward to client — strip any mail.gw address from body
                    const htmlBody = (_b = full.html[0]) !== null && _b !== void 0 ? _b : `<p>${(_c = full.text) !== null && _c !== void 0 ? _c : msg.intro}</p>`;
                    const textBody = (_d = full.text) !== null && _d !== void 0 ? _d : msg.intro;
                    await resend.emails.send({
                        from: EMAIL_FROM,
                        to: order.email,
                        subject: `[NaviPass] ${msg.subject}`,
                        html: `
              <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
                <div style="background:#0A1628;padding:16px 24px;border-radius:8px 8px 0 0">
                  <span style="color:#4BAFD4;font-weight:700;font-size:16px">NaviPass</span>
                </div>
                <div style="background:#F9FAFB;padding:16px 24px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px">
                  <p style="font-size:13px;color:#6B7280;margin:0 0 16px 0">
                    Bonjour ${order.firstName}, vous avez reçu un message de IDF Mobilités concernant votre abonnement Navigo.
                  </p>
                  <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 16px 0"/>
                  ${htmlBody}
                  <hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0 0 0"/>
                  <p style="font-size:11px;color:#9CA3AF;margin:12px 0 0 0;text-align:center">
                    Ce message a été transmis automatiquement depuis votre compte IDF Mobilités via NaviPass.
                  </p>
                </div>
              </div>
            `,
                        text: `NaviPass — message IDF Mobilités\n\nBonjour ${order.firstName},\n\n${textBody}\n\n— NaviPass navipass.to`,
                    });
                    await mailGwMarkRead(token, msg.id);
                    console.log(`[mail-forwarder] Forwarded "${msg.subject}" to ${order.email}`);
                    // Small delay to respect rate limit
                    await new Promise((r) => setTimeout(r, 200));
                }
                // Update last checked timestamp
                await prisma.order.update({
                    where: { id: order.id },
                    data: { mailGwLastCheckedAt: new Date() },
                });
            }
            catch (err) {
                console.error(`[mail-forwarder] Error on order ${order.id}:`, err);
            }
            // Delay between accounts to stay well under 8 QPS
            await new Promise((r) => setTimeout(r, 500));
        }
    }
    // Run immediately then on interval
    await poll().catch(console.error);
    setInterval(() => poll().catch(console.error), POLL_INTERVAL);
}
main().catch((err) => {
    console.error('[mail-forwarder] Fatal:', err);
    process.exit(1);
});
