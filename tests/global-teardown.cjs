const {
  clearServerState,
  readServerState,
  stopManagedServer,
} = require('./server-state.cjs');

module.exports = async () => {
  const state = readServerState();
  clearServerState();
  stopManagedServer(state);
};
