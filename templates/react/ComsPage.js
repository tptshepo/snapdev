import React, {PropTypes} from 'react';
import {TextField} from 'office-ui-fabric-react/lib/TextField';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as {{camelcase}}Actions from '../../actions/{{camelcase}}Actions';
import {{titlecase}}List from './{{titlecase}}List';
import {browserHistory} from 'react-router';
import toastr from 'toastr';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';
import {Dialog, DialogType, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {Button, ButtonType} from 'office-ui-fabric-react/lib/Button';

class {{ptitlecase}}Page extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onFilterChanged = this.onFilterChanged.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.onRowDeleteClick = this.onRowDeleteClick.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.onDelete = this.onDelete.bind(this);

    this.state = {
      term: '',
      {{pcamelcase}}: [...this.props.{{pcamelcase}}],
      deleting: false,
      showDeleteDialog: false,
      itemToDelete: {}
    };

  }

  componentWillReceiveProps(nextProps) {
    // Necessary to populate form when loaded directly.
    this.setState({
      {{pcamelcase}}: [...nextProps.{{pcamelcase}}]
    });
  }

  onFilterChanged(term) {
    if (term.length > 0) {
      let newList = [...this.props.{{pcamelcase}}].filter(function({{camelcase}}) {
        return {{camelcase}}.name.toLowerCase().indexOf(term) != -1;
      });
      this.setState({
        term: term,
        {{pcamelcase}}: [...newList]
      });
    } else {
      this.setState({
        term: term,
        {{pcamelcase}}: [...this.props.{{pcamelcase}}]
      });
    }
  }

  onRowClick({{camelcase}}) {
    this.context.router.push('/{{camelcase}}/' + {{camelcase}}.id);
  }

  onRowDeleteClick({{camelcase}}) {
    this.setState({showDeleteDialog: true, itemToDelete: {{camelcase}}});
  }

  closeDialog() {
    this.setState({showDeleteDialog: false});
  }

  onDelete() {
    this.setState({showDeleteDialog: false, deleting: true});

    this.props.actions.delete{{titlecase}}(this.state.itemToDelete).then(() => {
      this.props.actions.load{{ptitlecase}}().then(() => {
        this.setState({deleting: false});
        toastr.success("{{titlecase}} deleted");
      });
    }).catch(error => {
      toastr.error(error);
      this.setState({deleting: false});
    });

  }

  render() {
    let isBlocking = true;
    return (
      <div className="panel">
        <h2>{{ptitlecase}}</h2>
        <div className="table-filter">
          <TextField label={"Filter by name"} value={this.state.term} onBeforeChange={this.onFilterChanged}/>
        </div >
        <br/>
        <{{titlecase}}List {{pcamelcase}}={ this.state.{{pcamelcase}} } onRowClick={this.onRowClick} onRowDeleteClick={this.onRowDeleteClick}/>

        <div>
          <Dialog isOpen={this.state.showDeleteDialog} type={DialogType.normal} onDismiss={this.closeDialog} title="Delete" subText={`Are you sure you want to delete '${this.state.itemToDelete.name}'`} isBlocking={isBlocking}>
            <DialogFooter>
              <Button buttonType={ButtonType.primary} onClick={this.onDelete}>Delete</Button>
              <Button onClick={this.closeDialog}>Cancel</Button>
            </DialogFooter>
          </Dialog>
        </div>
      </div >
    );
  }
}

{{ptitlecase}}Page.contextTypes = {
  router: PropTypes.object
};

{{ptitlecase}}Page.propTypes = {
  {{pcamelcase}}: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    {{pcamelcase}}: state.{{pcamelcase}}/*same name from reducers*/
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({{camelcase}}Actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)({{ptitlecase}}Page);
