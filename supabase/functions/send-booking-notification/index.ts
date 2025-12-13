// ============================================
// Supabase Edge Function: send-booking-notification
// Deploy: supabase functions deploy send-booking-notification
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { booking_id } = await req.json()

    if (!booking_id) {
      throw new Error('booking_id is required')
    }

    // Fetch booking details with student and professor info
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        student:profiles!bookings_student_id_fkey(*),
        professor:profiles!bookings_professor_id_fkey(*)
      `)
      .eq('id', booking_id)
      .single()

    if (bookingError) throw bookingError

    // Format date and time for email
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    }

    // Email content for professor
    const emailSubject = `New Consultation Request from ${booking.student.full_name}`
    const emailBody = `
      <h2>New Consultation Request</h2>
      <p>You have received a new consultation request:</p>
      
      <h3>Student Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${booking.student.full_name}</li>
        <li><strong>Email:</strong> ${booking.student.email}</li>
        ${booking.student.department ? `<li><strong>Department:</strong> ${booking.student.department}</li>` : ''}
      </ul>
      
      <h3>Consultation Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${formatDate(booking.date)}</li>
        <li><strong>Time:</strong> ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}</li>
        <li><strong>Mode:</strong> ${booking.mode === 'online' ? 'Online' : 'On-site'}</li>
        ${booking.topic ? `<li><strong>Topic:</strong> ${booking.topic}</li>` : ''}
      </ul>
      
      <p>
        <a href="${Deno.env.get('APP_URL')}/professor/requests" 
           style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px;">
          View in Dashboard
        </a>
      </p>
      
      <hr style="margin: 20px 0;">
      
      <p style="color: #666; font-size: 12px;">
        This is an automated message from ConsultProf. Please do not reply directly to this email.
      </p>
    `

    // Here you would integrate with your email service (e.g., SendGrid, Resend, AWS SES)
    // For demonstration, we'll log the email content
    
    console.log('Sending email to:', booking.professor.email)
    console.log('Subject:', emailSubject)
    console.log('Body:', emailBody)

    // Example with Resend (uncomment and configure to use):
    /*
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ConsultProf <noreply@yourdomain.com>',
        to: [booking.professor.email],
        subject: emailSubject,
        html: emailBody,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        booking_id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

/* 
============================================
DATABASE TRIGGER TO CALL THIS FUNCTION
============================================

Run this SQL in Supabase SQL Editor to automatically trigger emails:

-- Create function to call edge function
CREATE OR REPLACE FUNCTION notify_professor_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
  service_role_key text;
BEGIN
  -- Get environment variables (set these in Supabase dashboard)
  function_url := current_setting('app.settings.function_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Call edge function asynchronously using pg_net extension
  -- Make sure pg_net extension is enabled in your Supabase project
  PERFORM
    net.http_post(
      url := function_url || '/send-booking-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object('booking_id', NEW.id)
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_professor_new_booking();

============================================
ALTERNATIVE: Call from Client Side
============================================

If you prefer to call this function from your React app instead:

import { supabase } from '@/app/lib/supabase';

const { data, error } = await supabase.functions.invoke('send-booking-notification', {
  body: { booking_id: newBooking.id }
});

*/
