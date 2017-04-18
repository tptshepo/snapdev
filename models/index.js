module.exports = {
    models: function () {
        return [{
            "name": "android-mvp",
            "dir": "android/mvp",
            "files": [
                { "src": "Component.java", "dist": "{{lcase}}/interfaces/{{name}}Component.java" },
                { "src": "Presenter.java", "dist": "{{lcase}}/interfaces/{{name}}Presenter.java" },
                { "src": "UI.java", "dist": "{{lcase}}/interfaces/{{name}}UI.java" },

                { "src": "Bus.java", "dist": "{{lcase}}/{{name}}Bus.java" },
                { "src": "Fragment.java", "dist": "{{lcase}}/{{name}}Fragment.java" },
                { "src": "Module.java", "dist": "{{lcase}}/{{name}}Module.java" },
                { "src": "PresenterImp.java", "dist": "{{lcase}}/{{name}}PresenterImp.java" },

                { "src": "Activity.java", "dist": "{{name}}Activity.java" },

                { "src": "activity.xml", "dist": "res/layout/activity_{{underscorelcase}}.xml" },
                { "src": "fragment.xml", "dist": "res/layout/fragment_{{underscorelcase}}.xml" }

            ]
        },
        {
            "name": "android-sql-dbcontext",
            "dir": "android/dbcontext",
            "files": [
                { "src": "DBContext.java", "dist": "sql/DBContext.java" }
            ]
        },
        {
            "name": "android-json-model",
            "dir": "android/json",
            "files": [
                { "src": "JModel.java", "dist": "jsonmodels/J{{class}}.java" }
            ]
        },
        {
            "name": "android-sql-table",
            "dir": "android/sql",
            "files": [
                { "src": "Entity.java", "dist": "sql/Entity{{class}}.java" },
                { "src": "TBTable.java", "dist": "sql/TB{{class}}.java" }
            ]
        },
        {
            "name": "java-object",
            "dir": "java",
            "files": [
                { "src": "POJO.java", "dist": "{{class}}.java" }
            ]
        }
        ];
    }
};