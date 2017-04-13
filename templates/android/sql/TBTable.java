package {{package}}.sql;

public class TB{{name}} {

    private int id;
    {{#properties}}
    private {{type}} {{prop}};
    {{/properties}}

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    
    {{#properties}}
    public {{type}} get{{ucase}}() {
        return {{prop}};
    }
    public void set{{ucase}}({{type}} {{prop}}) {
        this.{{prop}} = {{prop}};
    }

    {{/properties}}

}
