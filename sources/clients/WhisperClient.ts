import FormData from 'form-data';
import axios from 'axios';
import { Maybe } from '../utils/types';
import { normalizeUrl } from '../utils/normalizeUrl';
import * as z from 'zod';

export type WhisperRequestParameters = {
    temperature?: Maybe<number>;
};

export class WhisperClient {
    readonly url: string;

    constructor(url: string) {
        this.url = normalizeUrl(url);
    }

    async transcribe(source: Uint8Array, params?: WhisperRequestParameters) {

        // Prepare request
        const formData = new FormData();
        formData.append('response-format', 'json');
        formData.append('file', source);
        if (params?.temperature) {
            formData.append(`temperature`, params.temperature.toString());
        }

        // Request
        let res = await axios.post(this.url + '/inference', formData);

        // Parse
        let text = schemaTranscribe.parse(res.data).text;

        // Very basic normalization
        if (text.endsWith('\n')) {
            text = text.slice(0, -1);
        }
        text = text.trim();

        return text;
    }
}

const schemaTranscribe = z.object({
    text: z.string()
});