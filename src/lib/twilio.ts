import twilio from 'twilio';
import type { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSms(
  to: string,
  body: string,
  from?: string
): Promise<MessageInstance> {
  const fromNumber = from ?? process.env.TWILIO_PHONE_NUMBER!;

  console.log(`[Twilio] Sending SMS to: ${to} | Body: ${body}`);

  const message = await twilioClient.messages.create({
    to,
    from: fromNumber,
    body,
  });

  return message;
}

export function formatPhone(phone: string): string {
  // Strip all non-numeric characters
  const digits = phone.replace(/\D/g, '');

  // Handle US numbers: 10 digits → +1XXXXXXXXXX
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Handle 11-digit numbers starting with 1 (US with country code)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If already includes country code with more digits, prefix with +
  if (digits.length > 11) {
    return `+${digits}`;
  }

  // Fallback: prefix with + and return as-is
  return `+${digits}`;
}
