package {{package}}.jsonmodels;

import org.json.JSONException;
import org.json.JSONObject;

public class J{{name}} {

    {{#properties}}
    public static final String JField_{{ucase}} = "{{name}}";
    {{/properties}}

    {{#properties}}
    private {{type}} {{name}};
    {{/properties}}
    
    public J{{name}}(
        {{#properties}}
        {{type}} {{name}}{{^last}},{{/last}}
        {{/properties}}
        ){

        {{#properties}}
        this.{{name}} = {{name}};
        {{/properties}}
        
    }

    public static J{{name}} initWithJSONObject(JSONObject json) throws JSONException {

        return new J{{name}}(
                {{#properties}}
                json.getString(JField_{{ucase}}){{^last}},{{/last}}
                {{/properties}}
        );

    }

    public JSONObject getJSONObject() throws JSONException {

        JSONObject json = new JSONObject();

        {{#properties}}
        json.put(JField_{{ucase}}, this.{{name}});
        {{/properties}}

        return json;
    }


    {{#properties}}
    public {{type}} get{{ucase}}() {
        return {{name}};
    }
    public void set{{ucase}}({{type}} {{name}}) {
        this.{{name}} = {{name}};
    }

    {{/properties}}
}
