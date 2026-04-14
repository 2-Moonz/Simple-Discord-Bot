// Mock quick.db module - simple in-memory database for testing
const database = {};

module.exports = {
  get: function(key) {
    return database[key];
  },
  set: function(key, value) {
    database[key] = value;
    return value;
  },
  add: function(key, value) {
    const current = database[key] || 0;
    database[key] = current + value;
    return database[key];
  },
  subtract: function(key, value) {
    const current = database[key] || 0;
    database[key] = current - value;
    return database[key];
  },
  delete: function(key) {
    delete database[key];
    return true;
  },
  all: function() {
    return database;
  }
};
