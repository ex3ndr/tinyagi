import * as z from 'zod';
import axios from 'axios';
import { normalizeUrl } from "../utils/normalizeUrl";
import { Maybe } from '../utils/types';

export interface OllamaGenerateParameters {

    // Ollama parameters
    context?: Maybe<number[]>
    template?: Maybe<string>
    system?: Maybe<string>

    // Common model parameters
    temperature?: Maybe<number>

    // Model parameters
    mirostat?: Maybe<number>
    mirostatEta?: Maybe<number>
    mirostat_tau?: Maybe<number>
    num_ctx?: Maybe<number>
    num_gqa?: Maybe<number>
    num_thread?: Maybe<number>
    repeat_last_n?: Maybe<number>
    repeat_penalty?: Maybe<number>
    stop?: Maybe<string | string[]>
    tfs_z?: Maybe<number>
    top_k?: Maybe<number>
    top_p?: Maybe<number>
};

export type OllamaGenerateResponse = {
    model: string,
    created_at: string,
    response: string,
    done: boolean,
    context: number[],
    total_duration: number,
    prompt_eval_count: number,
    prompt_eval_duration: number,
    eval_count: number,
    eval_duration: number
}

export class OllamaClient {
    readonly url: string;

    constructor(url?: string) {
        this.url = normalizeUrl(url || 'http://localhost:11434');
    }

    async tags() {
        let res = await axios.get(this.url + '/api/tags');
        let parsed = schemaTags.parse(res.data);
        return parsed.models.map((m) => ({
            name: m.name,
            digest: m.digest,
            modifiedAt: new Date(m.modified_at).getTime(),
            size: m.size
        }));
    }

    async copy(source: string, destination: string) {
        await axios.post(this.url + '/api/copy', {
            source,
            destination
        });
    }

    async delete(name: string) {
        await axios.delete(this.url + '/api/delete', { data: { name } });
    }

    async generate(model: string, prompt: string, parameters?: Maybe<OllamaGenerateParameters>) {

        // Resolve request
        let args: any = {
            model,
            prompt
        };
        if (parameters) {
            let { context, template, system, ...other } = parameters;
            if (context) {
                args.context = context;
            }
            if (template) {
                args.template = template;
            }
            if (system) {
                args.system = system;
            }
            if (Object.keys(other).length > 0) {
                args.parameters = other;
            }
        }

        // Disable streaming
        args.stream = false;

        // Execute
        let res = await axios.post(this.url + '/api/generate', args);

        // Parse
        return schemaGenerate.parse(res.data);
    }
}

const schemaTags = z.object({
    models: z.array(z.object({
        name: z.string(),
        modified_at: z.string(),
        size: z.number(),
        digest: z.string()
    }))
});

const schemaGenerate = z.object({
    model: z.string(),
    created_at: z.string(),
    response: z.string(),
    done: z.boolean(),
    context: z.array(z.number()),
    total_duration: z.number(),
    prompt_eval_count: z.number(),
    prompt_eval_duration: z.number(),
    eval_count: z.number(),
    eval_duration: z.number()
});