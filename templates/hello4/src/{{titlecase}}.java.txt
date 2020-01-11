package {{package}};

public class {{class}} {

    {{#properties}}
    private {{type}} {{camelcase}};
    {{/properties}}
    
    {{#properties}}
    public {{type}} get{{titlecase}}() {
        return {{camelcase}};
    }
    public void set{{titlecase}}({{type}} {{camelcase}}) {
        this.{{camelcase}} = {{camelcase}};
    }

    {{/properties}}

}
