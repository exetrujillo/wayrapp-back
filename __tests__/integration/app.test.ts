// __tests__/integration/app.test.ts

import supertest from 'supertest';
import app from '@/infrastructure/web/app.js';

const request = supertest(app);

describe('GET /', () => {
  it('debería responder con un mensaje de beinvenida y la versión de la API', async () => {
    const response = await request.get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'WayrApp Backend está vivo!'
    );
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version', '1.0.0');
  });
});
