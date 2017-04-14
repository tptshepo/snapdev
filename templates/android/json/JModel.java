package {{package}}.jsonmodels;

import org.json.JSONException;
import org.json.JSONObject;

public class J{{class}} {

    {{#properties}}
    public static final String JField_{{titlecase}} = "{{name}}";
    {{/properties}}

    {{#properties}}
    private {{type}} {{camelcase}};
    {{/properties}}
    
    public J{{class}}(
        {{#properties}}
        {{type}} {{camelcase}}{{^last}},{{/last}}
        {{/properties}}
        ){

        {{#properties}}
        this.{{camelcase}} = {{camelcase}};
        {{/properties}}
        
    }

    public static J{{class}} initWithJSONObject(JSONObject json) throws JSONException {

        return new J{{class}}(
                {{#properties}}
                json.getString(JField_{{titlecase}}){{^last}},{{/last}}
                {{/properties}}
        );

    }

    public JSONObject getJSONObject() throws JSONException {

        JSONObject json = new JSONObject();

        {{#properties}}
        json.put(JField_{{titlecase}}, this.{{camelcase}});
        {{/properties}}

        return json;
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
