"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.fail = fail;
function ok(data, message = 'success') {
    return { status: true, message, data };
}
function fail(message, data = null) {
    return { status: false, message, data };
}
//# sourceMappingURL=response.js.map