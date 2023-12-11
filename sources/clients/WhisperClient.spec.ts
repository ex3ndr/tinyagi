import { WhisperClient } from "./WhisperClient";
import fs from 'fs';

describe('WhisperClient', () => {
    it('should transcribe', async () => {
        let client = new WhisperClient('http://localhost:8080');
        let jfk = fs.readFileSync(__dirname + '/__testdata__/jfk.wav');
        let res = await client.transcribe(jfk);
        expect(res).toEqual('And so my fellow Americans, ask not what your country can do for you, ask what you can do for your country.');
    });
});