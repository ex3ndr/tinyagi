import { OllamaClient } from "./OllamaClient";

describe('OllamaClient', () => {
    it('should fetch tags', async () => {
        let client = new OllamaClient();
        expect(!!(await client.tags()).find((v) => v.name === 'mistral:latest')).toBe(true);
    });
    it('should copy and delete', async () => {
        let client = new OllamaClient();
        expect(!!(await client.tags()).find((v) => v.name === 'jest-mistral:latest')).toBe(false);
        await client.copy('mistral:latest', 'jest-mistral:latest');
        expect(!!(await client.tags()).find((v) => v.name === 'jest-mistral:latest')).toBe(true);
        await client.delete('jest-mistral:latest');
        expect(!!(await client.tags()).find((v) => v.name === 'jest-mistral:latest')).toBe(false);
    });
    it('should generate', async () => {
        let client = new OllamaClient();
        await client.generate('mistral:latest', 'Hey, what');
    });
});