import { NextResponse } from 'next/server';

export async function GET() {
    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    try {
        const response = await fetch(`${apiUrl}/paises`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { success: false, message: 'Error al obtener países', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error de conexión con el servidor' },
            { status: 500 }
        );
    }
}
