import React from 'react';
import {TextField} from 'office-ui-fabric-react/lib/TextField';
import {PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import toastr from 'toastr';

const {{titlecase}}Form = ({ {{{camelcase}}}, onSave, onChange, saving, errors}) => {
  let fields = {
    {{#properties}}
    {{#isUI}}{{camelcase}}: ""{{^last}},{{/last}}{{/isUI}}
    {{/properties}}
  };

  let saveChanges = (event) => {
    let isValid = true;
    for (let field in fields) {
      if (fields[field].length > 0)
        isValid = false;
      }

    if (isValid) {
      onSave(event);
    } else {
      toastr.error('Please capture all required fields');
    }
  };

  {{#properties}}
  {{#isUI}}
  let on{{titlecase}}Changed = (text) => {
    onChange({target: {name: "{{camelcase}}", value: text}});
  };
  let get{{titlecase}}ErrorMessage = (value) => {
    fields.{{camelcase}} = value.length > 0 ? "" : "Field is required";
    return fields.{{camelcase}};
  };
  {{/isUI}}
  {{/properties}}

  return (
    <div className="page-form">

      {{#properties}}
      {{#isUI}}
      <TextField
        label="{{titlecase}}"
        placeholder=""
        value={ {{{rcamelcase}}}.{{{camelcase}}} }
        onChanged={on{{titlecase}}Changed}
        onGetErrorMessage={get{{titlecase}}ErrorMessage}
        validateOnFocusOut/>
      {{/isUI}}
      {{/properties}}

      <br/>
      <br/>
      <br/>
      <PrimaryButton
        disabled={saving}
        iconProps={ {iconName: "Save"} }
        text={saving ? 'Saving...' : 'Save Changes'}
        onClick={saveChanges}/>
    </div>
  );
};

{{titlecase}}Form.propTypes = {
  {{camelcase}}: React.PropTypes.object.isRequired,
  onSave: React.PropTypes.func.isRequired,
  onChange: React.PropTypes.func.isRequired,
  saving: React.PropTypes.bool,
  errors: React.PropTypes.object
};

export default {{titlecase}}Form;
