import { ReservasRepository } from '../repositories/reservas.repository';

async function testOverlap() {
    const repo = new ReservasRepository();
    const idInmueble = 3; // El que el usuario estaba editando { "nombre": "Estudio Urbano", "id_inmueble": 3 }

    console.log('--- Testing Overlap Logic ---');

    // 1. Una fecha que sabemos que existe (según el log del usuario)
    // El usuario dice que creó una de prueba exitosamente:
    // "id_inmueble": 3, "fecha_inicio": "...", "fecha_fin": "..." 
    // Pero el log no dice las fechas de la reserva exitosa que mostró.
    // Voy a buscar reservas existentes para el inmueble 3.

    try {
        const reservas = await repo.getReservas({ id_inmueble: idInmueble });
        console.log(`Encontradas ${reservas.length} reservas para el inmueble ${idInmueble}`);

        if (reservas.length > 0) {
            const r = reservas[0];
            const inicio = new Date(r.fecha_inicio).toISOString().split('T')[0];
            const fin = new Date(r.fecha_fin).toISOString().split('T')[0];

            console.log(`Reserva de referencia: ${inicio} a ${fin} (Estado: ${r.estado})`);

            // Test 1: Traslape total
            const count1 = await repo.countOverlappingReservations(idInmueble, inicio, fin);
            console.log(`Test 1 (Exacto): ${count1 > 0 ? 'CORRECTO (Detectado)' : 'FALLO (No detectado)'} - Count: ${count1}`);

            // Test 2: Inicia antes, termina en medio
            const inicio2 = new Date(new Date(inicio).getTime() - 86400000).toISOString().split('T')[0]; // dia anterior
            const count2 = await repo.countOverlappingReservations(idInmueble, inicio2, fin);
            console.log(`Test 2 (Parcial inicio): ${count2 > 0 ? 'CORRECTO' : 'FALLO'}`);

            // Test 3: Inicia en medio, termina después
            const fin3 = new Date(new Date(fin).getTime() + 86400000).toISOString().split('T')[0]; // dia despues
            const count3 = await repo.countOverlappingReservations(idInmueble, inicio, fin3);
            console.log(`Test 3 (Parcial fin): ${count3 > 0 ? 'CORRECTO' : 'FALLO'}`);

            // Test 4: Totalmente afuera (después)
            const inicio4 = new Date(new Date(fin).getTime() + 86400000).toISOString().split('T')[0];
            const fin4 = new Date(new Date(fin).getTime() + 172800000).toISOString().split('T')[0];
            const count4 = await repo.countOverlappingReservations(idInmueble, inicio4, fin4);
            console.log(`Test 4 (Fuera): ${count4 === 0 ? 'CORRECTO (Libre)' : 'FALLO (Detectado erroneamente)'} - Count: ${count4}`);

            // Test 5: Excluir la misma reserva
            const count5 = await repo.countOverlappingReservations(idInmueble, inicio, fin, r.id);
            console.log(`Test 5 (Excluir propia): ${count5 === 0 ? 'CORRECTO' : 'FALLO'}`);

        } else {
            console.log('No hay reservas para probar. Por favor cree una reserva primero.');
        }

    } catch (error) {
        console.error('Error durante el test:', error);
    } finally {
        process.exit();
    }
}

testOverlap();
