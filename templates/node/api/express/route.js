const {{pcamelcase}}Controller = require("../controllers/{{pcamelcase}}Controller");

module.exports = (app) => {

  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Trip Manager API!'
  }));

  app.post('/api/{{pcamelcase}}', {{pcamelcase}}Controller.create);
  app.put('/api/{{pcamelcase}}/:id', {{pcamelcase}}Controller.update);
  app.get('/api/{{pcamelcase}}/:id', {{pcamelcase}}Controller.get);
  app.delete('/api/{{pcamelcase}}/:id', {{pcamelcase}}Controller.destroy);
  app.get('/api/{{pcamelcase}}', {{pcamelcase}}Controller.list);
};
