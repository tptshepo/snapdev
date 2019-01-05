module.exports = {
  models: function() {
    return [
      {
        name: 'asp-net-core',
        dir: 'aspnetcore',
        files: [
          {
            src:
              'ClientApp/app/components/model-name/model-name-edit/model-name-edit.activate.ts.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-edit/{{dashlcase}}-edit.activate.ts'
          },
          {
            src:
              'ClientApp/app/components/model-name/model-name-edit/model-name-edit.component.html.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-edit/{{dashlcase}}-edit.component.html'
          },
          {
            src:
              'ClientApp/app/components/model-name/model-name-edit/model-name-edit.component.ts.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-edit/{{dashlcase}}-edit.component.ts'
          },
          {
            src:
              'ClientApp/app/components/model-name/model-name-edit/model-name-edit.component.css.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-edit/{{dashlcase}}-edit.component.css'
          },
          {
            src:
              'ClientApp/app/components/model-name/model-name-create/model-name-create.component.ts.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-create/{{dashlcase}}-create.component.ts'
          },
          {
            src:
              'ClientApp/app/components/model-name/model-name-create/model-name-create.component.css.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-create/{{dashlcase}}-create.component.css'
          },
          {
            src:
              'ClientApp/app/components/model-name/model-name-create/model-name-create.component.html.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-create/{{dashlcase}}-create.component.html'
          },
          {
            src:
              'ClientApp/app/components/model-name/model-name-list/model-name-list.component.html.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-list/{{dashlcase}}-list.component.html'
          },
          {
            src:
              'ClientApp/app/components/model-name/model-name-list/model-name-list.component.css.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-list/{{dashlcase}}-list.component.css'
          },
          {
            src:
              'ClientApp/app/components/model-name/model-name-list/model-name-list.component.ts.txt',
            dist:
              'ClientApp/app/components/{{dashlcase}}/{{dashlcase}}-list/{{dashlcase}}-list.component.ts'
          },
          {
            src: 'ClientApp/app/models/model-name.model.txt',
            dist: 'ClientApp/app/models/{{dashlcase}}.model.ts'
          },
          {
            src: 'ClientApp/app/services/model-name.service.txt',
            dist: 'ClientApp/app/services/{{dashlcase}}.api.service.ts'
          },
          {
            src: 'ClientApp/app/services/app-load.service.txt',
            dist: 'ClientApp/app/services/app-load.service.ts'
          },
          {
            src: 'ClientApp/app/actions.txt',
            dist: 'ClientApp/app/actions.ts'
          },
          {
            src: 'ClientApp/app/app.module.txt',
            dist: 'ClientApp/app/app.module.ts'
          },
          {
            src: 'ClientApp/app/reducers.txt',
            dist: 'ClientApp/app/reducers.ts'
          },
          {
            src: 'ClientApp/app/store.txt',
            dist: 'ClientApp/app/store.ts'
          },
          {
            src: 'Controllers/ModelsController.txt',
            dist: 'Controllers/{{ptitlecase}}Controller.cs'
          },
          {
            src: 'Controllers/Resources/ModelResource.txt',
            dist: 'Controllers/Resources/{{titlecase}}Resource.cs'
          },
          {
            src: 'Controllers/Resources/Query/ModelQueryResource.txt',
            dist: 'Controllers/Resources/Query/{{titlecase}}QueryResource.cs'
          },
          {
            src: 'Extensions/IQueryableExtensions.txt',
            dist: 'Extensions/IQueryableExtensions.cs'
          },
          {
            src: 'Persistence/Interface/IModelRepository.txt',
            dist: 'Persistence/Interface/I{{titlecase}}Repository.cs'
          },
          {
            src: 'Persistence/ModelRepository.txt',
            dist: 'Persistence/{{titlecase}}Repository.cs'
          },
          {
            src: 'Persistence/Core/AppDBContext.txt',
            dist: 'Persistence/Core/AppDBContext.cs'
          },
          {
            src: 'Mapping/MappingProfile.txt',
            dist: 'Mapping/MappingProfile.cs'
          },
          { src: 'Models/Model.txt', dist: 'Models/{{titlecase}}.cs' },
          {
            src: 'Models/Query/ModelQuery.txt',
            dist: 'Models/Query/{{titlecase}}Query.cs'
          },
          {
            src: 'Startup.txt',
            dist: 'Startup.cs'
          }
        ]
      },
      {
        name: 'hello-world',
        dir: 'hello',
        files: [{ src: 'User.java', dist: '{{class}}.java' }]
      },
      {
        name: 'objective-c-json-model',
        dir: 'objective-c/json-model',
        files: [
          { src: 'Data.h', dist: '{{titlecase}}.h' },
          { src: 'Data.m', dist: '{{titlecase}}.m' }
        ]
      },
      {
        name: 'node-api-express',
        dir: 'node/api/express',
        files: [
          { src: 'controller.js', dist: '{{pcamelcase}}Controller.js' },
          { src: 'model.js', dist: '{{camelcase}}Model.js' },
          { src: 'route.js', dist: 'route.js' }
        ]
      },
      {
        name: 'react-page',
        dir: 'react',
        files: [
          { src: 'actionTypes.js', dist: 'actions/actionTypes.js' },
          { src: 'comActions.js', dist: 'actions/{{camelcase}}Actions.js' },
          { src: 'ComApi.js', dist: 'api/{{titlecase}}Api.js' },

          {
            src: 'ComForm.js',
            dist: 'components/{{camelcase}}/{{titlecase}}Form.js'
          },
          {
            src: 'ComList.js',
            dist: 'components/{{camelcase}}/{{titlecase}}List.js'
          },
          {
            src: 'ComListRow.js',
            dist: 'components/{{camelcase}}/{{titlecase}}ListRow.js'
          },
          {
            src: 'ComsPage.js',
            dist: 'components/{{camelcase}}/{{plural}}Page.js'
          },
          {
            src: 'ManageComPage.js',
            dist: 'components/{{camelcase}}/Manage{{titlecase}}Page.js'
          },

          { src: 'comReducer.js', dist: 'reducers/{{camelcase}}Reducer.js' }
        ]
      },
      {
        name: 'android-mvp',
        dir: 'android/mvp',
        files: [
          {
            src: 'Component.java',
            dist: '{{lcase}}/interfaces/{{name}}Component.java'
          },
          {
            src: 'Presenter.java',
            dist: '{{lcase}}/interfaces/{{name}}Presenter.java'
          },
          { src: 'UI.java', dist: '{{lcase}}/interfaces/{{name}}UI.java' },

          { src: 'Bus.java', dist: '{{lcase}}/{{name}}Bus.java' },
          { src: 'Fragment.java', dist: '{{lcase}}/{{name}}Fragment.java' },
          { src: 'Module.java', dist: '{{lcase}}/{{name}}Module.java' },
          {
            src: 'PresenterImp.java',
            dist: '{{lcase}}/{{name}}PresenterImp.java'
          },

          { src: 'Activity.java', dist: '{{name}}Activity.java' },

          {
            src: 'activity.xml',
            dist: 'res/layout/activity_{{underscorelcase}}.xml'
          },
          {
            src: 'fragment.xml',
            dist: 'res/layout/fragment_{{underscorelcase}}.xml'
          }
        ]
      },
      {
        name: 'android-dbcontext',
        dir: 'android/dbcontext',
        files: [{ src: 'DBContext.java', dist: 'sql/DBContext.java' }]
      },
      {
        name: 'android-json',
        dir: 'android/json',
        files: [{ src: 'JModel.java', dist: 'jsonmodels/J{{class}}.java' }]
      },
      {
        name: 'android-table',
        dir: 'android/sql',
        files: [
          { src: 'Entity.java', dist: 'sql/Entity{{class}}.java' },
          { src: 'TBTable.java', dist: 'sql/TB{{class}}.java' }
        ]
      },
      {
        name: 'java-object',
        dir: 'java',
        files: [{ src: 'POJO.java', dist: '{{class}}.java' }]
      }
    ];
  }
};
