module.exports = (sequelize, Sequelize) => {
  const Model = sequelize.define('{{camelcase}}', {
    {{#properties}}
    {{#serial}}
    {{camelcase}}: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    }
    {{/serial}}
    {{#text}}
    {{camelcase}}: {
      type: Sequelize.STRING
    }
    {{/text}}
    {{#number}}
    {{camelcase}}: {
      type: Sequelize.INTEGER
    }
    {{/number}}{{^last}},{{/last}}
    {{/properties}}
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Model;
};
