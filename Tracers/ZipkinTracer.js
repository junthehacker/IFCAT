const {
          Tracer, BatchRecorder, jsonEncoder: {JSON_V2}
      }                = require('zipkin');
const {HttpLogger}     = require('zipkin-transport-http');
const CLSContext       = require('zipkin-context-cls');

let tracer = null;

module.exports = function getZipkinTracer() {

    if(!tracer) {
        const ctxImpl = new CLSContext();
        const recorder = new BatchRecorder({
            logger: new HttpLogger({
                endpoint: process.env.ZIPKIN_ENDPOINT,
                jsonEncoder: JSON_V2
            })
        });
        tracer = new Tracer({ ctxImpl, recorder });
    }
    return tracer;
};