import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const path = params.path.join('/');
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
    const path = params.path.join('/');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

    console.log('Proxy request to:', apiUrl);

    if (!apiUrl) {
        console.error('API_URL is missing');
        return NextResponse.json({ isError: true, message: 'API_URL not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const targetUrl = `${apiUrl}/${path}`;
        console.log(`Proxying POST to: ${targetUrl}`);

        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log(`Backend response status: ${res.status}`);
        const data = await res.json();
        console.log('Backend response data:', JSON.stringify(data).substring(0, 200)); // Log summary
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ isError: true, message: 'Error connecting to backend' }, { status: 500 });
    }
}
