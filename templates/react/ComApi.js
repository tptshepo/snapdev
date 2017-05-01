import http from './http';

class {{titlecase}}Api {

  static getAll{{ptitlecase}}() {
    return new Promise((resolve, reject) => {
      http.get('/{{pcamelcase}}')
        .then(response => {
          resolve(Object.assign([], response.data));
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  static save{{titlecase}}({{camelcase}}) {
    {{camelcase}} = Object.assign({}, {{camelcase}}); // to avoid manipulating object passed in.
    return new Promise((resolve, reject) => {

      if ({{camelcase}}.id === 0) {
        /* Add new */
        http.post('/{{pcamelcase}}', {{camelcase}})
          .then(response => {
            resolve(Object.assign({}, response.data));
          })
          .catch(error => {
            reject(error);
          });

      } else {
        /* Update */
        http.put('/{{pcamelcase}}/' + {{camelcase}}.id, {{camelcase}})
          .then(response => {
            resolve(Object.assign({}, response.data));
          })
          .catch(error => {
            reject(error);
          });
      }

    });
  }

  static delete{{titlecase}}(id) {
    return new Promise((resolve, reject) => {
      http.delete('/{{pcamelcase}}/' + id)
        .then(response => {
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

export default {{titlecase}}Api;
