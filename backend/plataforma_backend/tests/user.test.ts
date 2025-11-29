import { describe, it, expect } from 'vitest';
import { userController } from '../controllers/user.controller';

// Mock FastifyReply
const reply = () => {
  let res = {
    statusCode: 200,
    payload: undefined as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(data: any) {
      this.payload = data;
      return this;
    },
  };
  return res;
};

describe('userController', () => {
  it('should create a user', async () => {
    const req: any = { body: { 
      email: 'test@mail.com', 
      nombre: 'Test', 
      password_hash: '123456', 
      id_roles: 1, 
      id_empresa: null 
    }};
    const res = reply();
    await userController.create(req, res as any);
    expect(res.statusCode).toBe(201);
    expect(res.payload.email).toBe('test@mail.com');
  });
});
