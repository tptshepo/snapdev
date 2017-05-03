import React, {PropTypes} from 'react';
import {CommandButton} from 'office-ui-fabric-react/lib/Button';

const {{titlecase}}ListRow = ({ {{camelcase}}, onRowClick, onRowDeleteClick }) => {

  let onClick = () => {
    onRowClick({{camelcase}});
  };

  let onDeleteClick = () => {
    onRowDeleteClick({{camelcase}});
  };

  return (
    <div className="ms-Table-row">
      {{#properties}}
      {{#tablecell}}<span className="ms-Table-cell" onClick={onClick}>{ {{rcamelcase}}.{{camelcase}} }</span>{{/tablecell}}
      {{/properties}}
      <span className="ms-Table-cell" onClick={onClick}>{ {{camelcase}}.updatedAt}</span>
      <span className="ms-Table-cell">
        <CommandButton onClick={onDeleteClick} icon="Cancel">
          Delete
        </CommandButton>
      </span>
    </div>
  );
};

{{titlecase}}ListRow.propTypes = {
  {{camelcase}}: PropTypes.object.isRequired,
  onRowClick: PropTypes.func.isRequired,
  onRowDeleteClick: PropTypes.func.isRequired
};

export default {{titlecase}}ListRow;
