import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = 'https://api.thenewsapi.com/v1/news/top';
const API_KEY = process.env.NEWS_API_TOKEN;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'us';
    const language = searchParams.get('language') || 'en';
    const published_on = searchParams.get('published_on');

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Please set NEWS_API_TOKEN in .env.local' },
        { status: 500 }
      );
    }

    // Build params object, only including non-empty values
    const params = {
      api_token: API_KEY,
      locale,
      language
    };

    // Only add published_on if it's provided and not empty
    if (published_on && published_on.trim() !== '') {
      params.published_on = published_on;
    }

    console.log('Fetching news with params:', { ...params, api_token: '***' });
    
    const response = await axios.get(API_URL, { params });

    const articles = response.data.data || [];
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching news:', error.message);
    
    // Log more details about the error
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
      console.error('API Request Config:', {
        url: error.config?.url,
        params: error.config?.params
      });
    }
    
    // Return more detailed error information
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Could not fetch news';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.response?.data || null,
        status: statusCode
      },
      { status: statusCode >= 400 && statusCode < 500 ? statusCode : 500 }
    );
  }
}

