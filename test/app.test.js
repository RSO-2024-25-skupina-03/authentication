import { expect } from 'chai';
import request from 'supertest';

const baseUrl = 'http://localhost:3000';

describe('GET /health', () => {
  it('should return OK', (done) => {
    request(baseUrl)
      .get('/health')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('message', 'OK');
        done();
      });
  });
});