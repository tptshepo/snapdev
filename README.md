# snapdev

Every developer gets to a point where he or she starts feeling like they are repeating themselves with some of the code they are writing. With snapdev, you can create a template of commonly written code structures and generate the implementation code based on a defined data model.

snapdev crawls through the files in the template and replaces the tokens where ever they are defined. This approach allows for more advanced features like code generating an entire project that can immediately run.

The snapdev commands are inspired by GIT commands in order to be consistent with what developers a familiar with.

## Install

```
$ npm install -g snapdev
```

## Usage

```
$ snapdev --help

snapdev [command]

Commands:
  snapdev init                 Initialize snapdev                   [aliases: i]
  snapdev status               Get status of the current context    [aliases: s]
  snapdev add <model>          Add a model file                     [aliases: a]
  snapdev generate [model]     Generate source code based on a given template
                               and model                            [aliases: g]
  snapdev login                Log in to snapdev online repository  [aliases: l]
  snapdev logout               Log out from snapdev online repository
                                                                    [aliases: o]
  snapdev list                 List all your templates on snapdev online
                               repository.                         [aliases: ls]
  snapdev tag                  Change template configuration        [aliases: t]
  snapdev checkout <template>  Switch context to the specified template
                                                                    [aliases: c]
  snapdev clone <template>     Pull a template from the snapdev online
                               repository
  snapdev push                 Upload a template to snapdev online repository.
                                                                    [aliases: p]
  snapdev version              Snapdev version number               [aliases: v]

Options:
  --help  Show help                                                    [boolean]

```

## Quick start

### Initialize snapdev

```
$ mkdir template-projects
$ cd template-projects

$ snapdev init
Created: ~/template-projects/snapdev.json
```

### Start a new template

```
$ snapdev checkout nodejs-cli --create

Created: ~/template-projects/templates/nodejs-cli/template.json
Created: ~/template-projects/templates/nodejs-cli/README.md
Created: ~/template-projects/templates/nodejs-cli/src/{{titlecase}}.java.txt
Created: ~/template-projects/templates/nodejs-cli/models/default.json
Switched to nodejs-cli
```

### Run the code generator

```
$ snapdev generate

Template name: nodejs-cli
Model filename: default.json
========== Source Code ==========
MyModel.java
```

`MyModel.java` is the output of the code generation. Any code that needs to be generated must be placed in the `src` folder.

A `dist` folder will be created under the `template-projects` folder with the results of the code generation.

## Collaboration

To share your work with other developers, you will need to register for a snapdev free account in order to push and clone templates.

### Register for a free account

```
$ snapdev register
```

### Log into snapdev online repository

```
$ snapdev login

Login with your snapdev username to push and clone templates from snapdev online repository. If you don't have a snapdev username, head over to http://www.snapdev.co.za to create one.
? username:
? password:

Login Succeeded
```

### Context status

To view what template context you are in, run the status command

```
$ snapdev status

Logged in as: snapdev
Template name: nodejs-cli
Template version: 0.0.1
Template root: ~/template-projects/templates/nodejs-cli
```

It's important to note the first line which shows which user you are logged in as. That is the user that will be used by the tag command.

### Push a template

To push a template to the online respository, it must be tagged with the logged in user. In order to tag the template we created above `nodejs-cli` run the following command

```
$ snapdev tag --user

From: ~/template-projects/templates/nodejs-cli
To: ~/template-projects/templates/snapdev/nodejs-cli
Switched to snapdev/nodejs-cli
```

Run status command again to see what has changed

```
Logged in as: snapdev
Template name: snapdev/nodejs-cli
Template version: 0.0.1
Template root: ~/template-projects/templates/snapdev/nodejs-cli
```

The `Template name` and `Template root` have changed to show the user the template was tagged with.

Now you are ready to run the push command

```
$ snapdev push

Pushing...
Push Succeeded
```

The template has now been pushed to the online repository for other developers to clone.

if you want to control the visibility of the template to other developers, run the tag command with a `---private` or `--public` option.

```
$ snapdev tag --private

Marked template as private
```

To view a list of templates available on the online repository, run the following command.

```
$ snapdev list

Getting list...

snapdev/java-app     snapdev/node-app     snapdev/node-app-v2  snapdev/nodejs-cli
```

The private templates will have a yellow font.

## Templating engine

snapdev uses [mustache.js](https://github.com/janl/mustache.js) as the templating engine.

### Variables

Variables are tokens you can add in your template to be later substituted with the real values from the data model. There are certain fields that are expected to be in every data model and they are as follows.

```json
{
  "class|model|name": "User",
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

### Loops

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

```text
{{#stooges}}
<b>{{name}}</b>
{{/stooges}}
```

Output:

```text
<b>Moe</b>
<b>Larry</b>
<b>Curly</b>
```

When looping over an array of strings, a `.` can be used to refer to the current item in the list.

Data model:

```json
{
  "musketeers": ["Athos", "Aramis", "Porthos", "D'Artagnan"]
}
```

Template:

```text
{{#musketeers}}
* {{.}}
{{/musketeers}}
```

Output:

```text
* Athos
* Aramis
* Porthos
* D'Artagnan
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

```text
{{#beatles}}
* {{name}}
{{/beatles}}
```

Output:

```text
* John Lennon
* Paul McCartney
* George Harrison
* Ringo Starr
```

### Replacing Filenames

The following tokens can be added to the file names. As an example, if `class/model/name` was set to `CustomerOrder`, the table will look like the following.

| Keyword    | Token      | Value          |
| ---------- | ---------- | -------------- |
| model-name | dashlcase  | customer-order |
| Models     | ptitlecase | CustomerOrders |
| Model      | titlecase  | CustomerOrder  |

Examples:

Template:

```text
my-model-name.component.css
my-Models.component.html
my-Model.component.ts
```

Output:

```text
my-customer-order.component.css
my-CustomerOrders.component.html
my-CustomerOrder.component.ts
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

```text
* {{name.first}} {{name.last}}
* {{age}}
```

Output:

```text
* Michael Jackson
* RIP
```
