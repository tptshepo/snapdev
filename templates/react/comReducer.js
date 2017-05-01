import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function {{camelcase}}Reducer(state = initialState.{{pcamelcase}}, action) {
  switch (action.type) {
    case types.LOAD_{{pucase}}_SUCCESS:
      return action.{{pcamelcase}};

    case types.CREATE_{{ucase}}_SUCCESS:
      return [
        ...state,
        Object.assign({}, action.{{camelcase}})
      ];

    case types.UPDATE_{{ucase}}_SUCCESS:
      return [
        ...state.filter({{camelcase}} => {{camelcase}}.id !== action.{{camelcase}}.id),
        Object.assign({}, action.{{camelcase}})
      ];

    default:
      return state;
  }
}
