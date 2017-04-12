package {{package}}.coredata;

public class TB{{name}} {

    {{#properties}}
    private {{type}} {{name}};
    {{/properties}}

    {{#properties}}
    public {{type}} get{{ucase}}() {
        return {{name}};
    }
    public void set{{ucase}}({{type}} {{name}}) {
        this.{{name}} = {{name}};
    }

    {{/properties}}

}
