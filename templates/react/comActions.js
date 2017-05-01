import * as types from './actionTypes';
import {{camelcase}}Api from '../api/{{titlecase}}Api';
import {beginAjaxCall,ajaxCallError} from './ajaxStatusActions';

export function load{{ptitlecase}}Success({{pcamelcase}}) {
  return {
    type: types.LOAD_{{pucase}}_SUCCESS,
    {{pcamelcase}}
  };
}

export function create{{titlecase}}Success({{camelcase}}) {
  return {
    type: types.CREATE_{{ucase}}_SUCCESS,
    {{camelcase}}
  };
}

export function update{{titlecase}}Success({{camelcase}}) {
  return {
    type: types.UPDATE_{{ucase}}_SUCCESS,
    {{camelcase}}
  };
}

export function delete{{titlecase}}Success() {
  return {
    type: types.DELETE_{{ucase}}_SUCCESS
  };
}

export function load{{ptitlecase}}() {
  return function(dispatch) {
    dispatch(beginAjaxCall());
    return {{camelcase}}Api.getAll{{ptitlecase}}().then({{pcamelcase}} => {
      dispatch(load{{ptitlecase}}Success({{pcamelcase}}));
    }).catch(error => {
      dispatch(ajaxCallError(error));
      throw (error);
    });
  };
}

export function save{{titlecase}}({{camelcase}}) {
  return function(dispatch, getState) {
    dispatch(beginAjaxCall());
    return {{camelcase}}Api.save{{titlecase}}({{camelcase}}).then(saved{{titlecase}} => {
      {{camelcase}}.id ? dispatch(update{{titlecase}}Success(saved{{titlecase}})) :
        dispatch(create{{titlecase}}Success(saved{{titlecase}}));
    }).catch(error => {
      dispatch(ajaxCallError(error));
      throw (error);
    });
  };
}

export function delete{{titlecase}}({{camelcase}}) {
  return function(dispatch, getState) {
    dispatch(beginAjaxCall());
    return {{camelcase}}Api.delete{{titlecase}}({{camelcase}}.id).then(() => {
      dispatch(delete{{titlecase}}Success());
    }).catch(error => {
      dispatch(ajaxCallError(error));
      throw (error);
    });
  };
}
