import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateReviewResponse(
  reviewText: string,
  rating: number,
  businessName: string
): Promise<string> {
  let instruction: string;

  if (rating >= 4) {
    instruction =
      'The customer left a positive review. Write a warm, grateful response. Thank them sincerely, mention a specific detail from their review, and invite them to return.';
  } else if (rating <= 2) {
    instruction =
      'The customer left a negative review. Write an empathetic, professional response. Apologize genuinely, take responsibility without making excuses, offer to make it right, and include a contact info placeholder like [email/phone] so the customer can reach you directly.';
  } else {
    instruction =
      'The customer left a mixed review. Acknowledge their feedback openly, highlight any improvements being made or positives they mentioned, and warmly invite them to give you another chance.';
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: `You are a professional, empathetic business owner responding to Google reviews for ${businessName}. Your responses are concise (under 100 words), genuine, and never robotic or templated-sounding. Never use hashtags or emojis. Write in first person as the business owner.`,
    messages: [
      {
        role: 'user',
        content: `Customer review (${rating}/5 stars):\n"${reviewText}"\n\n${instruction}\n\nWrite only the response text — no preamble, no labels, no quotation marks.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic API');
  }

  return content.text.trim();
}
