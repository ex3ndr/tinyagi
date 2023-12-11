import { isReactNative } from "../utils/environment";
import { streamingRequestNative } from "./streamingRequestNative";
import { streamingRequestWeb } from "./streamingRequestWeb";

export type StreamingRequest = {
    url: string,
    method: 'POST' | 'GET',
    data?: any,
    headers?: Record<string, string>,
    handler: (data: string | null, error: any | null) => void
};

export function streaingRequest(args: StreamingRequest): () => void {
    if (isReactNative) {
        return streamingRequestNative(args);
    } else {
        return streamingRequestWeb(args);
    }
}