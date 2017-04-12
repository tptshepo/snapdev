package {{package}}.components.{{nameToLower}}.interfaces;

import {{package}}.ApplicationComponent;
import {{package}}.LoginActivity;
import {{package}}.{{name}}Activity;
import {{package}}.base.annotations.PerActivity;
import {{package}}.components.ActivityModule;
import {{package}}.components.{{nameToLower}}.{{name}}Module;

import dagger.Component;

@PerActivity
@Component(dependencies = {ApplicationComponent.class},
        modules = {ActivityModule.class, {{name}}Module.class})
public interface {{name}}Component {
    void inject({{name}}Activity holder);
}
