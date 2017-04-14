package {{package}}.sql;

public class TB{{class}} {

    private int id;
    {{#properties}}
    private {{type}} {{camelcase}};
    {{/properties}}

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    
    {{#properties}}
    public {{type}} get{{titlecase}}() {
        return {{camelcase}};
    }
    public void set{{titlecase}}({{type}} {{camelcase}}) {
        this.{{camelcase}} = {{camelcase}};
    }

    {{/properties}}

}
