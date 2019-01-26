const dir = require('../lib/node-dir');
const colors = require('colors');

const builder = map => {
  const baseDir = __dirname + '/../templates/' + map.dir;
  const relDir =
    __dirname.replace('/models', '') + '/templates/' + map.dir + '/';

  let files = dir
    .files(baseDir, {
      sync: true
    })
    .filter(function(file) {
      return file.indexOf('.DS_Store') === -1;
    })
    .map(f => {
      return {
        src: f
      };
    })
    .map(f => {
      return {
        src: f.src,
        dist: f.src
          .replace(relDir, '')
          .replace('.css.txt', '.css')
          .replace('.html.txt', '.html')
          .replace('.ts.txt', '.ts')
          .replace('.cs.txt', '.cs')
      };
    })
    .map(f => {
      return {
        src: f.src,
        dist: f.dist
          .replace(/model-name/g, '{{dashlcase}}')
          .replace(/Model/g, '{{titlecase}}')
      };
    });

  return files;
};

const packages = [
  {
    name: 'ns-com',
    dir: 'nativescript-component',
    files: []
  },
  {
    name: 'aspnetcore',
    dir: 'aspnetcore',
    files: []
  },
  {
    name: 'hello-world',
    dir: 'hello',
    files: []
    // files: [{ src: 'User.java', dist: '{{titlecase}}.java' }]
  }
  // ,
  // {
  //   name: 'objective-c-json-model',
  //   dir: 'objective-c/json-model',
  //   files: [
  //     { src: 'Data.h', dist: '{{titlecase}}.h' },
  //     { src: 'Data.m', dist: '{{titlecase}}.m' }
  //   ]
  // },
  // {
  //   name: 'node-api-express',
  //   dir: 'node/api/express',
  //   files: [
  //     { src: 'controller.js', dist: '{{pcamelcase}}Controller.js' },
  //     { src: 'model.js', dist: '{{camelcase}}Model.js' },
  //     { src: 'route.js', dist: 'route.js' }
  //   ]
  // },
  // {
  //   name: 'react-page',
  //   dir: 'react',
  //   files: [
  //     { src: 'actionTypes.js', dist: 'actions/actionTypes.js' },
  //     { src: 'comActions.js', dist: 'actions/{{camelcase}}Actions.js' },
  //     { src: 'ComApi.js', dist: 'api/{{titlecase}}Api.js' },

  //     {
  //       src: 'ComForm.js',
  //       dist: 'components/{{camelcase}}/{{titlecase}}Form.js'
  //     },
  //     {
  //       src: 'ComList.js',
  //       dist: 'components/{{camelcase}}/{{titlecase}}List.js'
  //     },
  //     {
  //       src: 'ComListRow.js',
  //       dist: 'components/{{camelcase}}/{{titlecase}}ListRow.js'
  //     },
  //     {
  //       src: 'ComsPage.js',
  //       dist: 'components/{{camelcase}}/{{plural}}Page.js'
  //     },
  //     {
  //       src: 'ManageComPage.js',
  //       dist: 'components/{{camelcase}}/Manage{{titlecase}}Page.js'
  //     },

  //     { src: 'comReducer.js', dist: 'reducers/{{camelcase}}Reducer.js' }
  //   ]
  // },
  // {
  //   name: 'android-mvp',
  //   dir: 'android/mvp',
  //   files: [
  //     {
  //       src: 'Component.java',
  //       dist: '{{lcase}}/interfaces/{{name}}Component.java'
  //     },
  //     {
  //       src: 'Presenter.java',
  //       dist: '{{lcase}}/interfaces/{{name}}Presenter.java'
  //     },
  //     { src: 'UI.java', dist: '{{lcase}}/interfaces/{{name}}UI.java' },

  //     { src: 'Bus.java', dist: '{{lcase}}/{{name}}Bus.java' },
  //     { src: 'Fragment.java', dist: '{{lcase}}/{{name}}Fragment.java' },
  //     { src: 'Module.java', dist: '{{lcase}}/{{name}}Module.java' },
  //     {
  //       src: 'PresenterImp.java',
  //       dist: '{{lcase}}/{{name}}PresenterImp.java'
  //     },

  //     { src: 'Activity.java', dist: '{{name}}Activity.java' },

  //     {
  //       src: 'activity.xml',
  //       dist: 'res/layout/activity_{{underscorelcase}}.xml'
  //     },
  //     {
  //       src: 'fragment.xml',
  //       dist: 'res/layout/fragment_{{underscorelcase}}.xml'
  //     }
  //   ]
  // },
  // {
  //   name: 'android-dbcontext',
  //   dir: 'android/dbcontext',
  //   files: [{ src: 'DBContext.java', dist: 'sql/DBContext.java' }]
  // },
  // {
  //   name: 'android-json',
  //   dir: 'android/json',
  //   files: [{ src: 'JModel.java', dist: 'jsonmodels/J{{class}}.java' }]
  // },
  // {
  //   name: 'android-table',
  //   dir: 'android/sql',
  //   files: [
  //     { src: 'Entity.java', dist: 'sql/Entity{{class}}.java' },
  //     { src: 'TBTable.java', dist: 'sql/TB{{class}}.java' }
  //   ]
  // },
  // {
  //   name: 'java-object',
  //   dir: 'java',
  //   files: [{ src: 'POJO.java', dist: '{{class}}.java' }]
  // }
];

module.exports = {
  find: function(packageName) {
    const snapPackages = packages.filter(m => {
      return m.name === packageName;
    });
    let snapPackage;

    if (snapPackages.length === 0) {
      console.log(colors.red('snapdev package not found: ' + packageName));
      process.exit();
    } else {
      snapPackage = snapPackages[0];
      let files = builder({
        dir: snapPackage.dir
      });
      snapPackage.files = files;
      console.log(colors.green('snapdev Package: ' + snapPackage.name));
    }

    return snapPackage;
  }
};
