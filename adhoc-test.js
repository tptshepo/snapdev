const json = require('json-update');

(async () => {
  await json.update('test.json', { pushId: '1234564', surname: 'mgaga', test: 1 });

  let dat = await json.load('test.json');
  console.log(dat.test);


})();
