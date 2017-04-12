module.exports = {
    models: function() {
        return [{
            "name": "android-mvp-activity",
            "dir": "android/mvp/activity",
            "files": [
                { "src": "Component.java", "dist": "interfaces/{{name}}Component.java", "toLowerCase": false },
                { "src": "Presenter.java", "dist": "interfaces/{{name}}Presenter.java", "toLowerCase": false },
                { "src": "UI.java", "dist": "interfaces/{{name}}UI.java", "toLowerCase": false },

                { "src": "Activity.java", "dist": "{{name}}Activity.java", "toLowerCase": false },

                { "src": "Bus.java", "dist": "{{name}}Bus.java", "toLowerCase": false },
                { "src": "Fragment.java", "dist": "{{name}}Fragment.java", "toLowerCase": false },
                { "src": "Module.java", "dist": "{{name}}Module.java", "toLowerCase": false },
                { "src": "PresenterImp.java", "dist": "{{name}}PresenterImp.java", "toLowerCase": false },

                { "src": "activity.xml", "dist": "res/layout/activity_{{name}}.xml", "toLowerCase": true },
                { "src": "fragment.xml", "dist": "res/layout/fragment_{{name}}.xml", "toLowerCase": true }

            ]
        }];
    }
};