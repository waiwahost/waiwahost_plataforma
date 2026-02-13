import { useEffect, useState } from 'react';
import {
  getInmueblesSelectorApi,
  InmuebleSelector,
} from '../auth/getInmueblesSelectorApi';

export function useInmuebleSelector() {
  const [inmuebles, setInmuebles] = useState<InmuebleSelector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInmuebles = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getInmueblesSelectorApi();
        setInmuebles(data);
      } catch (err) {
        console.error('Error cargando inmuebles selector:', err);
        setError('No se pudieron cargar los inmuebles');
      } finally {
        setLoading(false);
      }
    };

    loadInmuebles();
  }, []);

  return { inmuebles, loading, error };
}
