import React, {PropTypes} from 'react';
import FabricTextInput from '../common/FabricTextInput';
import FabricDropDown from '../common/FabricDropDown';
import {PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import toastr from 'toastr';

const {{titlecase}}Form = ({
  {{#properties}}
  {{#dropdown}}
  {{options}},
  {{/dropdown}}
  {{/properties}}
  {{camelcase}},
  onSave,
  onChange,
  saving,
  errors
}) => {

  let saveChanges = (event) => {
    let isValid = true;
    for (let field in errors) {
      if (errors[field].length > 0) {
        isValid = false;
      }
    }
    if (isValid) {
      onSave(event);
    } else {
      toastr.error('Please capture all required fields');
    }
  };

  return (
    <div className="page-form">
      {{#properties}}
      {{#show}}
      {{#text}}
      <FabricTextInput
        name="{{camelcase}}"
        label="{{label}}"
        value={ {{rcamelcase}}.{{camelcase}} }
        onChange={onChange}
        error={ errors.{{camelcase}} }
        />
      {{/text}}
      {{#dropdown}}
      <FabricDropDown
        name="{{camelcase}}"
        label="{{label}}"
        value={ {{rcamelcase}}.{{camelcase}} }
        onChange={onChange}
        options={ {{options}} }
        error={ errors.{{camelcase}} }
        />
      {{/dropdown}}
      <br/>
      {{/show}}
      {{/properties}}
      <br/>
      <PrimaryButton disabled={saving} iconProps={ {iconName: "Save"} } text={saving ? 'Saving...': 'Save Changes'} onClick={saveChanges}/>
    </div>
  );
};

{{titlecase}}Form.propTypes = {
  {{#properties}}
  {{#dropdown}}{{options}}: PropTypes.array.isRequired,{{/dropdown}}
  {{/properties}}
  {{camelcase}}: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  errors: PropTypes.object
};

export default {{titlecase}}Form;
