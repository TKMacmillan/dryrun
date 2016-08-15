var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

class DLAP {

    constructor() {

        // Make the request module run asynchronously.
        Promise.promisifyAll(request);

    }

    *getData(path, ctx) {

        const DLAP = 'https://join.macmillanhighered.com';

        // Make an async request for data.
        let data = yield request.getAsync(DLAP + path);

        ctx.body = data[0].body;

    }
}

module.exports = DLAP;
