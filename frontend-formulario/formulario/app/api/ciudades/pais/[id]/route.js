import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

    try {
        const response = await fetch(`${apiUrl}/ciudades/pais/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { success: false, message: 'Error al obtener ciudades del país', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error de conexión con el servidor', details: error },
            { status: 500 }
        );
    }
}
