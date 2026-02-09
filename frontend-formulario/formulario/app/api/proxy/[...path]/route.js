import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { path: pathArray } = await params;
    const path = pathArray?.join('/') || '';
    const query = request.nextUrl.search;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

    if (!apiUrl) {
        return NextResponse.json({ isError: true, message: 'API_URL not configured' }, { status: 500 });
    }

    try {
        const res = await fetch(`${apiUrl}/${path}${query}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ isError: true, message: 'Error connecting to backend' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    const { path: pathArray } = await params;
    const path = pathArray?.join('/') || '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

    if (!apiUrl) {
        console.error('API_URL is missing');
        return NextResponse.json({ isError: true, message: 'API_URL not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const targetUrl = `${apiUrl}/${path}`;

        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ isError: true, message: 'Error connecting to backend' }, { status: 500 });
    }
}
