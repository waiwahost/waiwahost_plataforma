import { describe, it, expect } from 'vitest';
import { ROLES } from '../constants/globalConstants';

describe('Inmuebles Constants', () => {
  it('should have correct role constants', () => {
    expect(ROLES.SUPERADMIN).toBe(1);
    expect(ROLES.EMPRESA).toBe(2);
    expect(ROLES.ADMINISTRADOR).toBe(3);
    expect(ROLES.PROPIETARIO).toBe(4);
  });
});