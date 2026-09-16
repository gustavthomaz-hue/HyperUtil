import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET() {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY não encontrada no .env.local' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });
    const list = await groq.models.list();

    const modelos = list.data.map((m) => m.id);

    return NextResponse.json({ modelos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}