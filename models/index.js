module.exports = {
    models: function() {
        return [{
                "name": "android-mvp-activity",
                "dir": "android/mvp/activity",
                "files": [
                    { "src": "Component.java", "dist": "{{nameToLower}}/interfaces/{{name}}Component.java", "toLowerCase": false },
                    { "src": "Presenter.java", "dist": "{{nameToLower}}/interfaces/{{name}}Presenter.java", "toLowerCase": false },
                    { "src": "UI.java", "dist": "{{nameToLower}}/interfaces/{{name}}UI.java", "toLowerCase": false },

                    { "src": "Bus.java", "dist": "{{nameToLower}}/{{name}}Bus.java", "toLowerCase": false },
                    { "src": "Fragment.java", "dist": "{{nameToLower}}/{{name}}Fragment.java", "toLowerCase": false },
                    { "src": "Module.java", "dist": "{{nameToLower}}/{{name}}Module.java", "toLowerCase": false },
                    { "src": "PresenterImp.java", "dist": "{{nameToLower}}/{{name}}PresenterImp.java", "toLowerCase": false },

                    { "src": "Activity.java", "dist": "{{name}}Activity.java", "toLowerCase": false },

                    { "src": "activity.xml", "dist": "res/layout/activity_{{name}}.xml", "toLowerCase": true },
                    { "src": "fragment.xml", "dist": "res/layout/fragment_{{name}}.xml", "toLowerCase": true }

                ]
            },
            {
                "name": "android-coredata",
                "dir": "android/coredata",
                "files": [
                    { "src": "TBTable.java", "dist": "coredata/TB{{name}}.java", "toLowerCase": false }
                ]
            },
            {
                "name": "android-json",
                "dir": "android/json",
                "files": [
                    { "src": "JModel.java", "dist": "jsonmodels/J{{name}}.java", "toLowerCase": false }
                ]
            },
            {
                "name": "android-sql",
                "dir": "android/sql",
                "files": [
                    { "src": "Entity.java", "dist": "sql/Entity{{name}}.java", "toLowerCase": false }
                ]
            }
        ];
    }
};