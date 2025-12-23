
import { POST } from '@/app/api/create-payment-intent/route';

describe('Sanity', () => {
    it('works', () => {
        expect(true).toBe(true);
        expect(POST).toBeDefined();
    });
});
