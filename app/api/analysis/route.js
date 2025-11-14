import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(request) {
  try {
    const { title, snippet } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Missing article title for analysis.' },
        { status: 400 }
      );
    }

    const prompt = `Provide a concise, reader-friendly analysis of the following news article:\n\nTitle: ${title}\n\nSnippet: ${snippet || ''}`;

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);

    return NextResponse.json({ analysis: result.response.text() });
  } catch (error) {
    console.error('Error generating analysis:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}

