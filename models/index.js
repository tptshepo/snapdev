module.exports = {
    models: function () {
        return [{
            "name": "android-mvp-activity",
            "dir": "android/mvp/activity",
            "files": [
                { "src": "Activity.java", "dist": "{{name}}Activity.java", "toLowerCase": false },
                { "src": "activity.xml", "dist": "activity_{{name}}.xml", "toLowerCase": true },
                { "src": "fragment.xml", "dist": "fragment_{{name}}.xml", "toLowerCase": true },
                { "src": "Bus.java", "dist": "{{name}}Bus.java", "toLowerCase": false },
                { "src": "Component.java", "dist": "{{name}}Component.java", "toLowerCase": false },
                { "src": "Fragment.java", "dist": "{{name}}Fragment.java", "toLowerCase": false },
                { "src": "Module.java", "dist": "{{name}}Module.java", "toLowerCase": false },
                { "src": "Presenter.java", "dist": "{{name}}Presenter.java", "toLowerCase": false },
                { "src": "PresenterImp.java", "dist": "{{name}}PresenterImp.java", "toLowerCase": false },
                { "src": "UI.java", "dist": "{{name}}UI.java", "toLowerCase": false }
            ]
        }];
    }
};