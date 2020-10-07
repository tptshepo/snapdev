const logLogger = global.console.log;
const logArgs = [];

const print = () => {
  logArgs.forEach((i) => {
    logLogger.apply(console, i);
  });
};
const logs = () => {
  let out;
  logArgs.forEach((i) => {
    out += i.join(' ');
  });
  return out;
};

const init = () => {
  global.console.log = function (...args) {
    logArgs.push(args);
  };
  // global.console.warn = function () {
  //   logArgs.push(arguments);
  // };
  global.console.error = function (...args) {
    logArgs.push(args);
  };
};

module.exports = {
  init,
  logs,
  print,
};
