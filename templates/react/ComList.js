import React, {PropTypes} from 'react';
import {{titlecase}}ListRow from './{{titlecase}}ListRow';

const {{titlecase}}List = ({ {{pcamelcase}}, onRowClick, onRowDeleteClick }) => {
  return (
    <div className="ms-Table">
      <div className="ms-Table-row">
        {{#properties}}
        {{#tablecell}}<span className="ms-Table-cell ms-Table-col">{{titlecase}}</span>{{/tablecell}}
        {{/properties}}
        <span className="ms-Table-cell ms-Table-col">Last Update</span>
        <span className="ms-Table-cell ms-Table-col"></span>
      </div>
      { {{pcamelcase}}.map({{camelcase}} => <{{titlecase}}ListRow key={ {{{camelcase}}}.id } {{camelcase}}={ {{camelcase}} } onRowClick={onRowClick} onRowDeleteClick={onRowDeleteClick}/>)}
    </div>
  );
};

{{titlecase}}List.propTypes = {
  {{pcamelcase}}: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
  onRowDeleteClick: PropTypes.func.isRequired
};

export default {{titlecase}}List;
