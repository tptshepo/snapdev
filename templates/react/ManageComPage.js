import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as {{camelcase}}Actions from '../../actions/{{camelcase}}Actions';
import {{titlecase}}Form from './{{titlecase}}Form';
import toastr from 'toastr';
import validator from '../../validator.js';

class Manage{{titlecase}}Page extends React.Component {

  constructor(props, context) {
    super(props, context);

    let errors = {
      {{#properties}}
      {{#validate}}{{camelcase}}: {{#text}}""{{/text}}{{#number}}0{{/number}}{{^last}},{{/last}}{{/validate}}
      {{/properties}}
    };

    validator(this.props.{{camelcase}}, errors);

    this.state = {
      {{camelcase}}: Object.assign({}, this.props.{{camelcase}}),
      isNew: this.props.isNew,
      errors: errors,
      saving: false
    };

    this.update{{titlecase}}State = this.update{{titlecase}}State.bind(this);
    this.save{{titlecase}} = this.save{{titlecase}}.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.{{camelcase}}.id != nextProps.{{camelcase}}.id) {
      // Necessary to populate form when existing {{camelcase}} is loaded directly.
      this.setState({
        {{camelcase}}: Object.assign({}, nextProps.{{camelcase}}),
        isNew: nextProps.isNew
      });
    }
  }

  update{{titlecase}}State(event) {
    const field = event.target.name;
    let {{camelcase}} = this.state.{{camelcase}};
    let errors = this.state.errors;
    {{camelcase}}[field] = event.target.value;
    validator({{camelcase}}, errors);
    return this.setState({
      {{camelcase}}: {{camelcase}},
      errors: errors
    });
  }

  save{{titlecase}}(event) {
    event.preventDefault();
    this.setState({saving: true});
    this.props.actions.save{{titlecase}}(this.state.{{camelcase}}).then(() => this.redirect()).catch(error => {
      toastr.error(error);
      this.setState({saving: false});
    });
  }

  redirect() {
    this.setState({saving: false});
    toastr.success('{{titlecase}} saved');
    this.context.router.push('/{{pcamelcase}}');
  }

  render() {
    return (
      <div>
        <h2>
          {this.state.isNew
            ? "Add New {{titlecase}}"
            : "Edit {{titlecase}}"}
        </h2>
        <{{titlecase}}Form
          {{#properties}}
          {{#dropdown}}{{options}}={this.props.{{options}}}{{/dropdown}}
          {{/properties}}
          onChange={this.update{{titlecase}}State}
          onSave={this.save{{titlecase}}}
          {{camelcase}}={this.state.{{camelcase}}}
          errors={this.state.errors}
          saving={this.state.saving}/>
      </div>
    );
  }
}

Manage{{titlecase}}Page.propTypes = {
  {{camelcase}}: PropTypes.object.isRequired,
  {{#properties}}
  {{#dropdown}}{{options}}: PropTypes.array.isRequired,{{/dropdown}}
  {{/properties}}
  isNew: PropTypes.bool,
  actions: PropTypes.object.isRequired
};

//Pull in the React Router context so router is available on this.context.router.
Manage{{titlecase}}Page.contextTypes = {
  router: PropTypes.object
};

function get{{titlecase}}ById({{pcamelcase}}, id) {
  const {{camelcase}} = {{pcamelcase}}.filter({{camelcase}} => {{camelcase}}.id == id);
  if ({{camelcase}})
    return {{camelcase}}[0]; //since filter returns an array, have to grab the first.
  return null;
}

function mapStateToProps(state, ownProps) {
  const {{camelcase}}Id = ownProps.params.id; // from the path `/{{camelcase}}/:id`

  let {{camelcase}} = {
    {{#properties}}
    {{camelcase}}: {{#text}}""{{/text}}{{#number}}0{{/number}}{{^last}},{{/last}}
    {{/properties}}
  };

  if ({{camelcase}}Id && state.{{pcamelcase}}.length > 0) {
    {{camelcase}} = get{{titlecase}}ById(state.{{pcamelcase}}, {{camelcase}}Id);
  }

  {{#properties}}
  {{#dropdown}}
  const {{options}}ForDropdown = state.{{options}}.map(model => {
    return {value: model.id, text: model.name};
  });
  {{/dropdown}}
  {{/properties}}

  /*same name from reducers*/
  return {
    {{camelcase}}: {{camelcase}},
    {{#properties}}
    {{#dropdown}}
    {{options}}: [
      {
        text: "--- Please Select ---",
        value: 0
      },
      ...{{options}}ForDropdown
    ],
    {{/dropdown}}
    {{/properties}}
    isNew: {{camelcase}}.id === 0
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({{camelcase}}Actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Manage{{titlecase}}Page);
