const tripdb = require('../tripDb');

function create(req, res) {

  {{#properties}}
  {{#validate}}
  {{#text}}
  if (typeof req.body.{{camelcase}} !== 'string' || req.body.{{camelcase}}.length === 0) {
    res.status(400).send({
      message: "{{titlecase}} is required"
    });
    return;
  }
  {{/text}}
  {{#number}}
  if (typeof req.body.{{camelcase}} !== 'number' || req.body.{{camelcase}} === 0) {
    res.status(400).send({
      message: "{{titlecase}} is required"
    });
    return;
  }
  {{/number}}
  {{/validate}}
  {{/properties}}

  let params = {
    {{#properties}}
    {{#validate}}
    {{camelcase}}: req.body.{{camelcase}}{{^last}},{{/last}}
    {{/validate}}
    {{/properties}}
  };

  tripdb.{{titlecase}}
    .create(params)
    .then({{camelcase}} => res.status(200).send({{camelcase}}))
    .catch(error => res.status(400).send(error));
}

function update(req, res) {

  {{#properties}}
  {{#validate}}
  {{#text}}
  if (typeof req.body.{{camelcase}} !== 'string' || req.body.{{camelcase}}.length === 0) {
    res.status(400).send({
      message: "{{titlecase}} is required"
    });
    return;
  }
  {{/text}}
  {{#number}}
  if (typeof req.body.{{camelcase}} !== 'number' || req.body.{{camelcase}} === 0) {
    res.status(400).send({
      message: "{{titlecase}} is required"
    });
    return;
  }
  {{/number}}
  {{/validate}}
  {{/properties}}

  let params = {
    {{#properties}}
    {{#validate}}
    {{camelcase}}: req.body.{{camelcase}}{{^last}},{{/last}}
    {{/validate}}
    {{/properties}}
  };

  tripdb.{{titlecase}}
    .findById(req.params.id).then({{camelcase}} => {
      if (!{{camelcase}}) {
        res.status(400).send({
          message: "{{titlecase}} not found"
        });
      } else {
        // update
        {{camelcase}}.update(params)
          .then({{camelcase}} => res.status(200).send({{camelcase}}))
          .catch(error => res.status(400).send(error));
      }
    })
    .catch(error => res.status(400).send(error));

}

function get(req, res) {

  tripdb.{{titlecase}}
    .findById(req.params.id)
    .then({{camelcase}} => {
      if (!{{camelcase}}) {
        res.status(400).send({
          message: "{{titlecase}} not found"
        });
      } else {
        res.status(200).send({{camelcase}})
      }
    })
    .catch(error => res.status(400).send(error));

}

function destroy(req, res) {

  let params = {
    id: req.params.id
  };

  tripdb.{{titlecase}}
    .destroy({
      where: params
    })
    .then(rows => res.status(200).send({
      rows
    }))
    .catch(error => res.status(400).send(error));

}

function list(req, res) {

  let params = {
    order: [
      {{#properties}}
      {{#orderby}}
      ['{{camelcase}}', 'ASC']
      {{/orderby}}
      {{/properties}}
    ]
  };

  if (req.query && typeof req.query.name === 'string') {
    params.where = {
      {{#properties}}
      {{#searchby}}
      {{camelcase}}: req.query.{{camelcase}}
      {{/searchby}}
      {{/properties}}
    };
  }

  tripdb.{{titlecase}}
    .findAll(params)
    .then({{pcamelcase}} => res.status(200).send({{pcamelcase}}))
    .catch(error => res.status(400).send(error));

}

module.exports = {
  create,
  update,
  get,
  destroy,
  list
};
