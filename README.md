# snapdev code generator

Every developer knows that we get to a point where we start feeling like we are repeating ourselves with some of the code we are writing. With snapdev you can create a package of commonly written code structures and generate the implementation code based on a defined data model. This is especially useful when you want to quickly generate the CRUD functions for your frontend and backend code.

```bash
Usage: snapdev -p [package name] -d [data model]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -p, --package  Specify the package name
    -d, --data     Specify the data model
    -c, --clear    Clear the destination folder before generating new files
    -o, --output   Output the data model used by the templates
    -v, --verbose  Show additional logs

```

## Hello world example

In this example we are going to create a simple java class file for a User object.

### Step 1: Define a package

Go into the `/template` folder and create a new folder called `hello`. inside the `hello` folder create a file called `User.java` and add the following contents.

```java
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

```

snapdev uses [mustache.js](https://github.com/janl/mustache.js) as the templating engine.

### Step 2: Register the package with the code generator

Now that we have created our package, the next step is to register it with the code generator by describing how the files will be outputed.

Open the `/models/index.js` file with your text editor and add the following contents.

```javascript
module.exports = {
  models: function() {
    return [
      {
        name: 'hello-world',
        dir: 'hello',
        files: [{ src: 'User.java', dist: '{{class}}.java' }]
      }
    ];
  }
};
```

### Step 3: Define the data model

The data model is a json file that is used for merging with your template files in order to create the final output. The json model can be defined in any structure that makes sense to your template files.
Go into the `/data` folder and create a folder called `hello` and inside that folder create a file called `hello.json`.
Add the following contect to the file.

```json
{
  "package": "com.example.helloworld",
  "class": "User",
  "plural": "Users",
  "properties": [
    { "name": "FirstName", "type": "String" },
    { "name": "LastName", "type": "String" },
    { "name": "Email", "type": "String" },
    { "name": "Age", "type": "int" }
  ]
}
```

### Step 4: Run the code generator

```bash
node snapdev -p hello-world -d data/hello/hello.json

[Console output]
Snap Package: hello-world
Generating files...
User.java
Done!

```

You can add the `-c` flag to clear the destination folder.

The output should be the following java class file in the `/dist` folder.

```java
package com.example.helloworld;

public class User {

    private String firstName;
    private String lastName;
    private String email;
    private int age;

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }

}

```

This is how snapdev works in a nutshell.

## Variables

Variables are tokens you can add in your template to be later substituted with the real values from the data model. There are certain fields that are expected to be in every data model and they are as follows.

```json
{
  "class/model/name": "User",
  "properties": [
    {
      "name": "FirstName"
    }
  ]
}
```

The `class`, `model` or `name` root property is required. The `properties` collection is required with at least the `name` property in the object.

You can add additional fields and collections anywhere else in the file as needeed by your template,

During the code generation additional variables are created for your convenience for accessing the different formats of your model name `class/model/name` and property name `properties[name]`.

If class/model/name was **User**, the additional variables will be as follows.

| Token            | Value |
| ---------------- | ----- |
| camelcase        | user  |
| lcase            | user  |
| ucase            | USER  |
| underscorelcase  | user  |
| underscoreucase  | USER  |
| dashlcase        | user  |
| dashucase        | USER  |
| titlecase        | User  |
| rcamelcase       | user  |
| rlcase           | user  |
| rucase           | USER  |
| runderscorelcase | user  |
| runderscoreucase | USER  |
| rdashlcase       | user  |
| rdashucase       | USER  |
| rtitlecase       | User  |
| **Plural**       |       |
| pcamelcase       | users |
| plcase           | users |
| pucase           | USERS |
| punderscorelcase | users |
| punderscoreucase | USERS |
| pdashlcase       | users |
| pdashucase       | USERS |
| ptitlecase       | Users |

Or if class/model/name was **CustomerOrder**, the additional variables will be as follows.

| Token            | Value           |
| ---------------- | --------------- |
| camelcase        | customerOrder   |
| lcase            | customerorder   |
| ucase            | CUSTOMERORDER   |
| underscorelcase  | customer_order  |
| underscoreucase  | CUSTOMER_ORDER  |
| dashlcase        | customer-order  |
| dashucase        | CUSTOMER-ORDER  |
| titlecase        | CustomerOrder   |
| rcamelcase       | customerOrder   |
| rlcase           | customerorder   |
| rucase           | CUSTOMERORDER   |
| runderscorelcase | customer_order  |
| runderscoreucase | CUSTOMER_ORDER  |
| rdashlcase       | customer-order  |
| rdashucase       | CUSTOMER-ORDER  |
| rtitlecase       | CustomerOrder   |
| **Plural**       |                 |
| pcamelcase       | customerOrders  |
| plcase           | customerorders  |
| pucase           | CUSTOMERORDERS  |
| punderscorelcase | customer_orders |
| punderscoreucase | CUSTOMER_ORDERS |
| pdashlcase       | customer-orders |
| pdashucase       | CUSTOMER-ORDERS |
| ptitlecase       | CustomerOrders  |

## Loops

To loop through the collection of objects defined in the `properties` property, use the following syntax.

Data model:

```text
{
  "properties": [
    { "name": "FirstName" },
    { "name": "LastName" },
    { "name": "Email" }
  ]
}
```

Template:

```text
    {{#properties}}
    The context of this field is {{camelcase}}
    {{/properties}}
```

Output:

```text
The context of this field is firstName
The context of this field is lastName
The context of this field is email
```

#### Non-Empty Lists

If the `person` key exists and is not `null`, `undefined`, or `false`, and is not an empty list the block will be rendered one or more times.

When the value is a list, the block is rendered once for each item in the list. The context of the block is set to the current item in the list for each iteration. In this way we can loop over collections.

Data model:

```json
{
  "stooges": [{ "name": "Moe" }, { "name": "Larry" }, { "name": "Curly" }]
}
```

Template:

```html
{{#stooges}} <b>{{name}}</b> {{/stooges}}
```

Output:

```html
<b>Moe</b> <b>Larry</b> <b>Curly</b>
```

When looping over an array of strings, a `.` can be used to refer to the current item in the list.

Data model:

```json
{
  "musketeers": ["Athos", "Aramis", "Porthos", "D'Artagnan"]
}
```

Template:

```html
{{#musketeers}} * {{.}} {{/musketeers}}
```

Output:

```html
* Athos * Aramis * Porthos * D'Artagnan
```

If the value of a section variable is a function, it will be called in the context of the current item in the list on each iteration.

Data model:

```js
{
  "beatles": [
    { "firstName": "John", "lastName": "Lennon" },
    { "firstName": "Paul", "lastName": "McCartney" },
    { "firstName": "George", "lastName": "Harrison" },
    { "firstName": "Ringo", "lastName": "Starr" }
  ],
  "name": function () {
    return this.firstName + " " + this.lastName;
  }
}
```

Template:

```html
{{#beatles}} * {{name}} {{/beatles}}
```

Output:

```html
* John Lennon * Paul McCartney * George Harrison * Ringo Starr
```

### Escaping Variables

The most basic tag type is a simple variable. A `{{name}}` tag renders the value of the `name` key in the current context. If there is no such key, nothing is rendered.

All variables are HTML-escaped by default. If you want to render unescaped HTML, use the triple mustache: `{{{name}}}`. You can also use `&` to unescape a variable.

Data model:

```json
{
  "name": "Chris",
  "company": "<b>GitHub</b>"
}
```

Template:

```
* {{name}}
* {{age}}
* {{company}}
* {{{company}}}
* {{&company}}
{{=<% %>=}}
* {{company}}
<%={{ }}=%>
```

Output:

```text
* Chris
*
* &lt;b&gt;GitHub&lt;/b&gt;
* <b>GitHub</b>
* <b>GitHub</b>
* {{company}}
```

### JavaScript's dot notation

Data model:

```json
{
  "name": {
    "first": "Michael",
    "last": "Jackson"
  },
  "age": "RIP"
}
```

Template:

```html
* {{name.first}} {{name.last}} * {{age}}
```

Output:

```html
* Michael Jackson * RIP
```
