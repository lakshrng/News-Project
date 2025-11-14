import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = 'https://api.thenewsapi.com/v1/news/top';
const API_KEY = process.env.NEWS_API_TOKEN;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'us';
    const language = searchParams.get('language') || 'en';
    const published_on = searchParams.get('published_on') || '';

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await axios.get(API_URL, {
      params: {
        api_token: API_KEY,
        locale,
        language,
        published_on
      }
    });

    const articles = response.data.data || [];
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return NextResponse.json(
      { error: 'Could not fetch news. Try again later.' },
      { status: 500 }
    );
  }
}

