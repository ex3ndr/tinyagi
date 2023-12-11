import type { StreamingRequest } from "./streamingRequest";

//
// Inspiration from https://github.com/adamchel/rn-eventsource/blob/master/src/EventSource.js
//

export function streamingRequestNative(request: StreamingRequest): () => void {

    // Load networking
    const Networking = require('react-native').Networking;
    async function startRequest() {
        return await new Promise<number>((resolve) => {
            Networking.sendRequest(
                request.method, // Method
                'unknown', // Tracking Name (??)
                request.url, // URL
                request.headers ? request.headers : {}, // Headers
                request.data ? JSON.stringify(request.data) : '', // Body
                'text', // Text body
                true, // we want incremental events
                0, // there is no timeout defined in the WHATWG spec for EventSource
                resolve,
                false, // Disable credentials
            );
        });
    }
    function abortRequest(id: number) {
        Networking.abortRequest(id);
    }

    // Cancel
    let cancel: (() => void) | null = null;
    let canceled = false;

    // Run source
    (async () => {

        // Start request
        let requestId = await startRequest();
        if (canceled) {
            abortRequest(requestId);
            return;
        }

        // Subscribe
        let ended = false;
        let subscriptions: any[] = [];
        let complete = () => {
            if (!ended) {
                ended = true;
                abortRequest(requestId);
                for (let s of subscriptions) {
                    s.remove();
                }
            }
        };
        cancel = complete;

        // Callbacks
        subscriptions.push(Networking.addListener('didReceiveNetworkResponse', (args: [number, number /* status code */, any, string]) => {
            if (args[0] === requestId && !ended) {
                if (args[1] !== 200) {
                    complete();
                    request.handler(null, new Error('Received status code: ' + args[1]));
                }
            }
        }));
        subscriptions.push(Networking.addListener('didReceiveNetworkIncrementalData', (args: [number, string /* data */, number /* progress */, number /* total */]) => {
            if (args[0] === requestId && !ended) {
                request.handler(args[1], null);
            }
        }));
        subscriptions.push(Networking.addListener('didCompleteNetworkResponse', (args: [number, string | null /* error */, boolean /* timeOutError */]) => {
            if (args[0] === requestId && !ended) {
                complete();
                if (args[1]) {
                    request.handler(null, new Error('Error: ' + args[1]));
                } else if (args[2]) {
                    request.handler(null, new Error('Timeout error'));
                } else {
                    request.handler(null, null);
                }
            }
        }));
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