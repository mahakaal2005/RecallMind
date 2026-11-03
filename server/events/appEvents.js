const EventEmitter = require('events');

class AppEventEmitter extends EventEmitter {}

// Single shared instance — require this anywhere and call appEvents.emit(...)
const appEvents = new AppEventEmitter();

module.exports = appEvents;
