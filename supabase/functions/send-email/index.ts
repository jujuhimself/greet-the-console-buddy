import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';

// Use provided Resend credentials
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_GbvzrxQd_2rA7mcar29C4VDdkaM72cKsr';
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from }: EmailRequest = await req.json();

    // Use provided email address
    const fromEmail = from || Deno.env.get('RESEND_FROM_EMAIL') || 'support@bepawaa.com';

    console.log('Sending email to:', to, 'Subject:', subject);

    const emailResponse = await resend.emails.send({
      from: `Bepawa Platform <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);