const express = require('express');
const router = express.Router();

const templates = require('../../templates');

router.get('/', function(req, res, next) {
  res.json({ status: 'ok', templates: templates.list() });
});

module.exports = router;
