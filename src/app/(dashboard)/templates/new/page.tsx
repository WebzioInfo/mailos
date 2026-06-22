import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSenderProfile } from "@/modules/profile/actions";
import TemplateStudioClient from "../components/TemplateStudioClient";

export default async function NewTemplatePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mailos_session')?.value;
  if (!token) redirect('/login');
  
  const session = await verifyToken(token);
  if (!session || !session.workspaceId) redirect('/login');

  const profile = await getSenderProfile(session.workspaceId as string);
  
  const brandColor = profile?.brandColor || '#33BCAD';
  const logoHtml = profile?.logoUrl ? `<img src="${profile.logoUrl}" alt="Logo" style="max-height: 50px; margin-bottom: 10px;" />` : `<h2>${profile?.companyName || 'Your Logo Here'}</h2>`;
  const signatureHtml = profile?.signature ? `<div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">${profile.signature}</div>` : '';
  const footerHtml = profile?.footer ? `<div class="footer">${profile.footer}</div>` : `<div class="footer">&copy; ${new Date().getFullYear()} ${profile?.companyName || 'Your Company'}. All rights reserved.</div>`;

  const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { width: 100%; max-width: 100%; padding: 40px 20px; box-sizing: border-box; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { text-align: center; padding: 30px 20px; border-bottom: 3px solid ${brandColor}; }
    .content { padding: 30px; }
    .button { display: inline-block; padding: 12px 24px; background: ${brandColor}; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        ${logoHtml}
      </div>
      <div class="content">
        <h1>Hello {{firstName}},</h1>
        <p>This is a custom HTML template pre-configured with your Brand Identity.</p>
        <br/>
        <center>
          <a href="#" class="button">Call to Action</a>
        </center>
        ${signatureHtml}
      </div>
      ${footerHtml}
    </div>
  </div>
</body>
</html>`;

  return <TemplateStudioClient initialData={{ name: "", html: DEFAULT_HTML }} />;
}
