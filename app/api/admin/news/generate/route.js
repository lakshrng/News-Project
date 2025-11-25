import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAdmin } from '@/middleware/auth';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const ai = GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your-google-ai-api-key-here'
  ? new GoogleGenerativeAI(GOOGLE_API_KEY)
  : null;

export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { topic, category = 'General' } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    await connectDB();

    let articleData;

    if (ai) {
      const prompt = `Create a comprehensive news article about "${topic}". 
      The article should be:
      - Well-structured with a compelling headline
      - Informative and factual
      - 500-800 words long
      - Include a brief summary (2-3 sentences)
      - Professional and engaging tone
      - Include relevant details and context
      - End with a conclusion
      
      Format the response as JSON with the following structure:
      {
        "title": "Article title here",
        "content": "Full article content here",
        "summary": "Brief summary here",
        "tags": ["tag1", "tag2", "tag3"]
      }`;

      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          articleData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        articleData = {
          title: `News Article: ${topic}`,
          content: response,
          summary: `A comprehensive article about ${topic}`,
          tags: [category.toLowerCase(), topic.toLowerCase()]
        };
      }
    } else {
      articleData = {
        title: `Breaking News: ${topic}`,
        content: `This is a news article about ${topic} in the ${category} category.`,
        summary: `A comprehensive analysis of ${topic} in the ${category} category.`,
        tags: [category.toLowerCase(), topic.toLowerCase().replace(/\s+/g, '-'), 'news', 'analysis']
      };
    }

    const newsArticle = new News({
      title: articleData.title,
      content: articleData.content,
      summary: articleData.summary,
      author: authResult.userId,
      category,
      tags: articleData.tags || [category.toLowerCase()],
      status: 'draft'
    });

    await newsArticle.save();

    return NextResponse.json({
      message: 'News article generated successfully',
      article: newsArticle
    });
  } catch (error) {
    console.error('News generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate news article' },
      { status: 500 }
    );
  }
}

