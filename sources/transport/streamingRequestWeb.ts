import type { StreamingRequest } from "./streamingRequest";

export function streamingRequestWeb(request: StreamingRequest): () => void {

    // Cancel
    let cancel: (() => void) | null = null;
    let canceled = false;

    // Run source
    (async () => {

        // Start
        const controller = new AbortController();
        let stream: ReadableStreamDefaultReader<Uint8Array> | null = null;
        let ended = false;
        let complete = () => {
            if (!ended) {
                ended = true;
                controller.abort();
                if (stream) {
                    stream.releaseLock();
                }
            }
        };
        cancel = complete;

        // Request
        let res = await fetch(request.url, {
            method: request.method,
            body: request.data ? JSON.stringify(request.data) : null,
            headers: request.headers ? request.headers : {},
            signal: controller.signal
        });
        if (canceled) {
            controller.abort();
            return;
        }

        // Check header
        if (!res.ok || !res.body) {
            complete();
            request.handler(null, new Error('Received status code: ' + res.status));
            return;
        }

        // Capture stream
        stream = res.body.getReader();
        const decoder = new TextDecoder();

        // Read cycle
        try {
            while (true) {
                const { done, value } = await stream.read();

                // If ended
                if (done) {
                    break;
                }

                // Append chunk
                let chunk = decoder.decode(value);
                request.handler(chunk, null);
            }
        } catch (e) {
            complete();
            if (!canceled) {
                request.handler(null, e);
            }
            return;
        } finally {
            stream.releaseLock();
            controller.abort();
        }
        complete();
        request.handler(null, null);
    })();

    // Return cancelation
    return () => {
        if (!canceled) {
            canceled = true;
            if (cancel) {
                cancel();
            }
        }
    };
}