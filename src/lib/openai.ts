import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeSentiment(text: string) {
  if (!text) return null;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Japanese business analyst. Analyze the sentiment of the following customer feedback. Return a JSON with "score" (0.0 to 1.0, where 1.0 is very positive) and a brief "summary" in Japanese.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return null;
  }
}
