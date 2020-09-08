![Build, test, and deploy](https://github.com/tptshepo/snapdev/workflows/Build,%20test,%20and%20deploy/badge.svg)

# snapdev

`snapdev` is a developer productivity tool to build and reuse code snippets which are packaged in  a form of templates. The tool is not specific to any programming language which gives you the flexibility to generate any piece of code.

The goal behind `snapdev` is to take best practices within a codebase and turn them into reusable templates (components) that can be used on other projects. It also promotes the maintainability of code across teams since everybody will be working off the same set of templates.

`snapdev` has collaboration features that allow you to share your templates with other `snapdev` users. If you don’t want to share your work you can just mark your templates as private.

`snapdev` allows for:
- Rapid application development
- Consistency in UI, UX and architecture
- More maintainable codebase

You can use the online portal https://www.snapdevhub.com to discover public templates and also view your template library.

There is also an online model editor for rapidly creating a model based on the schema of the template. This takes away the hassle of crafting the JSON model by hand and instead it is generated as you fill out the form.

Please send any enquiries to support@snapdevhub.com or you can open a GitHub issue https://github.com/tptshepo/snapdev/issues.


# Table of Contents
- [Install](#install)
- [Usage](#usage)
- [Quick start](#quick-start)
    - [Initialize new snapdev project](#initialize-new-snapdev-project)
    - [Start a new template](#start-a-new-template)
    - [Run the code generator](#run-the-code-generator)
    - [Deploy the generated code](#deploy-the-generated-code)
- [Collaboration](#collaboration)
    - [Register for a free account](#register-for-a-free-account)
    - [Log into snapdev online repository](#log-into-snapdev-online-repository)
    - [Context status](#context-status)
    - [Push a template](#push-a-template)
    - [Delete a template](#delete-a-template)
    - [Using an existing template](#using-an-existing-template)
- [Templating engine](#templating-engine)
    - [Variables](#variables)
    - [Special fields](#special-fields)
    - [Sections](#sections)
        - [False Values or Empty Lists](#false-values-or-empty-lists)
        - [Non-Empty Lists](#non-empty-lists)
    - [Functions](#functions)
    - [Inverted Sections](#inverted-sections)
    - [Comments](#comments)
    - [Replacing Filenames](#replacing-filenames)



## Install

```
$ npm install -g snapdev
```

## Usage

```
$ snapdev --help

snapdev [command]

Commands:
  snapdev init [project]       Initialize snapdev                 [aliases: new]
  snapdev status               Get status of the current context    [aliases: s]
  snapdev add <model>          Add a model file
  snapdev model                Perform actions related to model files
  snapdev clean                Cleans the dist folder of generated files
  snapdev generate <model>     Generate source code based on a given model
                                                                  [aliases: g]
  snapdev register             Register for a free snapdev account
  snapdev login                Log in to snapdev online repository
  snapdev logout               Log out from snapdev online repository
  snapdev list                 List all your templates on snapdev online
                               repository                          [aliases: ls]
  snapdev tag                  Update current active template configuration
  snapdev create <template>    Create a new template
  snapdev checkout <template>  Switch context to the specified template
  snapdev clone <template>     Clone a template from the snapdev online
                               repository
  snapdev pull                 Update the current template from the snapdev
                               online repository
  snapdev push                 Upload a template to snapdev online repository
  snapdev deploy               Copy the generated code to the snapdev parent
                               folder
  snapdev reset                Revert the current template to the latest version
                               on the online repository
  snapdev update               Change template behaviour
  snapdev delete <template>    Delete a template from your local repository
  snapdev deregister           Delete snapdev online account
  snapdev version              Snapdev version number               [aliases: v]

Options:
  --help  Show help                                                    [boolean]

```

## Quick start

### Initialize new snapdev project

```
$ snapdev new my-project
Created: ~/my-project/snapdev/snapdev.json

$ cd my-project/snapdev
```

### Start a new template

```
$ snapdev create java-cli

Created: ~/my-project/snapdev/templates/java-cli/template.json
Created: ~/my-project/snapdev/templates/java-cli/schema.json
Created: ~/my-project/snapdev/templates/java-cli/README.md
Created: ~/my-project/snapdev/templates/java-cli/src/{{titlecase}}.java.txt
Created: ~/my-project/snapdev/templates/java-cli/models/default.json
Switched to java-cli
```

### Run the code generator

Note that the default location for model files is `~/my-project/snapdev/models/`.

```
$ snapdev generate default.json

Template name: java-cli
Model filename: default.json
Model path: ~/my-project/snapdev/models/default.json
========== Source Code ==========
MyAppModel.java

Done.
```

`MyAppModel.java` is the output of the code generation. Any code that needs to be generated must be placed in the `src` folder.

A `dist` folder will be created under the `my-project` folder with the results of the code generation.

### Deploy the generated code

To copy the code that was generated into your project folder `my-project`, run the following command

```
$ snapdev deploy

Destination: ~/my-project/
Copied: MyAppModel.java

Done.
```

You can run the command again when you make changes to your template. if you want to override existing file, in the project folder, add the `--force` flag.

## Collaboration

To share your work with other developers, you will need to register for a snapdev free account in order to push and clone templates.

### Register for a free account

You can use the `register` CLI command or go to https://www.snapdevhub.com/#/register to create an account.

```
$ snapdev register

Register for a free snapdev account to push and clone templates.
? Email: snapdev@example.co.za
? Username: snapdev
? Password: [hidden]
? Password again: [hidden]

Account created
```

### Log into snapdev online repository

```
$ snapdev login

Login with your snapdev username to push and clone templates from snapdev online repository.
? Username: snapdev
? Password: [hidden]

Login Succeeded
```

To log out

```
$ snapdev logout

Logged out!
```

### Context status

To view what template context you are in, run the status command

```
$ snapdev status

API endpoint: https://api.snapdevhub.com
API version: 1.7.36
Logged in as: snapdev
Template name: java-cli
Template version: 0.0.1
Template tags: component
Template acl: private
Template root: ~/my-project/snapdev/templates/java-cli
Last commit:
```

It's important to note the first line which shows which user you are logged in as. That is the user that will be used as the owner of a template.

### Push a template

To push a template to the online respository, it must be tagged with the logged in user. In order to tag the template we created above `java-cli` run the following command

```
$ snapdev tag --user

From: ~/my-project/snapdev/templates/java-cli
To: ~/my-project/snapdev/templates/snapdev/java-cli
Switched to snapdev/java-cli
```

Run status command again to see what has changed

```
API endpoint: https://api.snapdevhub.com
API version: 1.7.36
Logged in as: snapdev
Template name: snapdev/java-cli
Template version: 0.0.1
Template tags: component
Template acl: private
Template root: ~/my-project/snapdev/templates/snapdev/java-cli
```

The `Template name` and `Template root` have changed to include the user the template was tagged with.

Now you are ready to run the push command

```
$ snapdev push

Pushing...
Upload size: 1977 bytes
Push Succeeded
```

The template has now been pushed to the online repository for other developers to clone.

If you want to control the visibility of the template to other developers, run the tag command with a `---private` or `--public` option.

```
$ snapdev tag --private

Marked template as private
```
To mark as public again
```
$ snapdev tag --public

Marked template as public
```
Then run the push command again.

If you get the `Version conflict` error, include the `--force` flag so that the version is bumped. Note that you cannot push the same version twice.
```
$ snapdev push --force

Version set to 0.0.2
Pushing...
Upload size: 1998 bytes
Push Succeeded
```

To view a list of templates available on the online repository, run the following command.

```
$ snapdev list

Getting lists...

=== Remote ===

snapdev/nodejs-api      snapdev/nodejs-service      snapdev/java-cli

=== Local ===

snapdev/java-cli
```

The private templates will have a yellow font.

### Delete a template

To remove a template locally, run the this command

```
$ snapdev delete snapdev/java-cli

? Are you sure you want to delete java-cli Yes
[Local] java-cli removed

```

To remove the same template on the online repository, add the `--remote` flag.

```
$ snapdev delete snapdev/java-cli --remote
? Are you sure you want to delete snapdev/java-cli [Y/n]
[Remote] snapdev/java-cli removed
[Local] snapdev/java-cli removed
```

### Using an existing template

To use a template that was created by another developer you must clone it with the following command

```
$ snapdev clone snapdev/nodejs-api

Cloning template....
Download size: 22383 bytes
Clone location: ~/my-project/snapdev/templates/snapdev/nodejs-api
Version: 0.0.18
Switched to snapdev/nodejs-api
```

To create the model, go to  https://www.snapdevhub.com/#/templates/community and find the template then click on `Create Model`.

After you are done with populating the model form, click `Commit` then click `Snapdev Generate` and copy the generate link.

Head over to your terminal and paste the link while you are still on your snapdev workspace.

```
$ snapdev generate https://api.snapdevhub.com/m/snapdev/nodejs-api/my-model
```

Now you can deploy the generated code in your project workspace.
```
$ snapdev deploy
```

### Forking an existing template

If you want to improve the template and change the source code, tag the template with your logged in user

```
$ snapdev tag --user

Tagged qualipsolutions/nodejs-api
Switched to qualipsolutions/nodejs-api
```

Now you can make changes to the template and use it as per normal. If you want to share your version with the community, simply push the template

```
$ snapdev push

Pushing...
Upload size: 1998 bytes
Push Succeeded

```

View your template list

```
$ snapdev list

Getting lists...

=== Remote ===

qualipsolutions/nodejs-api

=== Local ===

qualipsolutions/nodejs-api  snapdev/nodejs-api
```

## Templating engine

snapdev uses [mustache.js](https://github.com/janl/mustache.js) as the templating engine.

A template is a string that contains any number of mustache tags. Tags are indicated by the double mustaches that surround them. {{person}} is a tag, as is {{#person}}. In both examples we refer to person as the tag's key. There are several types of tags available as described below.

### Variables

The most basic tag type is a simple variable. A {{name}} tag renders the value of the name key in the current context. If there is no such key, nothing is rendered.

All variables are HTML-escaped by default. If you want to render unescaped HTML, use the triple mustache: {{{name}}}. You can also use & to unescape a variable.

If you want {{name}} not to be interpreted as a mustache tag, but rather to appear exactly as {{name}} in the output, you must change and then restore the default delimiter.

Model:

```json
{
  "name": "Tshepo",
  "company": "<b>Qualip Solutions</b>"
}
```

Template:

```
* {{name}}
* {{age}} # Non-existent field
* {{company}}
* {{{company}}}
* {{&company}}

# keep mustache tags
{{=<% %>=}}
* {{company}}
<%={{ }}=%>

```

Output:

```
* Tshepo
* # Non-existent field
* &lt;b&gt;Qualip Solutions&lt;/b&gt;
* <b>GitHub</b>
* <b>GitHub</b>

# keep mustache tags
* {{company}}
```

JavaScript's dot notation may be used to access keys that are properties of objects in a view.

Model:

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

### Special fields

The `name` and `plural` are special properties that provides addition convenient string features.

Here is an example of how they can be used

Model:

```json
{
  "name": "CustomerOrder",
  "plural": "CustomerOrders"
}
```

Template:

```
camelcase        => {{camelcase}}
lcase            => {{lcase}}
ucase            => {{ucase}}
ulcase           => {{ulcase}}
uucase           => {{uucase}}
dashlcase        => {{dashlcase}}
dashucase        => {{dashucase}}
titlecase        => {{titlecase}}
rcamelcase       => {{rcamelcase}}
rlcase           => {{rlcase}}
rucase           => {{rucase}}
rulcase          => {{rulcase}}
ruucase          => {{ruucase}}
rdashlcase       => {{rdashlcase}}
rdashucase       => {{rdashucase}}
rtitlecase       => {{rtitlecase}}
rtitlename       => {{rtitlename}}

**Plural**

pcamelcase       => {{pcamelcase}}
plcase           => {{plcase}}
pucase           => {{pucase}}
pulcase          => {{pulcase}}
puucase          => {{puucase}}
pdashlcase       => {{pdashlcase}}
pdashucase       => {{pdashucase}}
ptitlecase       => {{ptitlecase}}
ptitlename       => {{ptitlename}}
```

Output:

```
camelcase        => customerOrder
lcase            => customerorder
ucase            => CUSTOMERORDER
ulcase           => customer_order
uucase           => CUSTOMER_ORDER
dashlcase        => customer-order
dashucase        => CUSTOMER-ORDER
titlecase        => CustomerOrder
rcamelcase       => customerOrder
rlcase           => customerorder
rucase           => CUSTOMERORDER
rulcase          => customer_order
ruucase          => CUSTOMER_ORDER
rdashlcase       => customer-order
rdashucase       => CUSTOMER-ORDER
rtitlecase       => CustomerOrder
rtitlename       => Customer Order

**Plural**

pcamelcase       => customerOrders
plcase           => customerorders
pucase           => CUSTOMERORDERS
pulcase          => customer_orders
puucase          => CUSTOMER_ORDERS
pdashlcase       => customer-orders
pdashucase       => CUSTOMER-ORDERS
ptitlecase       => CustomerOrders
ptitlename       => Customer Orders
```

When `name` and `plural` are detected anywhere in your JSON model, snapdev will generate these additional fields at the same hierachy level.

### Sections

Sections render blocks of text one or more times, depending on the value of the key in the current context.

A section begins with a pound and ends with a slash. That is, `{{#person}}` begins a `person` section, while `{{/person}}` ends it. The text between the two tags is referred to as that section's "block".

The behavior of the section is determined by the value of the key.

#### False Values or Empty Lists

If the `person` key does not exist, or exists and has a value of `null`, `undefined`, `false`, `0`, or `NaN`, or is an empty string or an empty list, the block will not be rendered.

Model:

```json
{
  "person": false
}
```

Template:

```html
Shown. {{#person}} Never shown! {{/person}}
```

Output:

```html
Shown.
```

#### Non-Empty Lists

If the `person` key exists and is not `null`, `undefined`, or `false`, and is not an empty list the block will be rendered one or more times.

When the value is a list, the block is rendered once for each item in the list. The context of the block is set to the current item in the list for each iteration. In this way we can loop over collections.

Model:

```json
{
  "stooges": [{ "name": "Moe" }, { "name": "Larry" }, { "name": "Curly" }]
}
```

Template:

```html
{{#stooges}}
<b>{{name}}</b>
{{/stooges}}
```

Output:

```html
<b>Moe</b>
<b>Larry</b>
<b>Curly</b>
```

When looping over an array of strings, a `.` can be used to refer to the current item in the list.

Model:

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

Model:

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

### Functions

If the value of a section key is a function, it is called with the section's literal block of text, un-rendered, as its first argument. The second argument is a special rendering function that uses the current view as its view argument. It is called in the context of the current view object.

Model:

```js
{
  "name": "Tater",
  "bold": function () {
    return function (text, render) {
      return "<b>" + render(text) + "</b>";
    }
  }
}
```

Template:

```html
{{#bold}}Hi {{name}}.{{/bold}}
```

Output:

```html
<b>Hi Tater.</b>
```

### Inverted Sections

An inverted section opens with `{{^section}}` instead of `{{#section}}`. The block of an inverted section is rendered only if the value of that section's tag is `null`, `undefined`, `false`, _falsy_ or an empty list.

Model:

```json
{
  "repos": []
}
```

Template:

```html
{{#repos}}<b>{{name}}</b>{{/repos}} {{^repos}}No repos :({{/repos}}
```

Output:

```html
No repos :(
```

### Comments

Comments begin with a bang and are ignored. The following template:

```html
<h1>Today{{! ignore me }}.</h1>
```

Will render as follows:

```html
<h1>Today.</h1>
```

Comments may contain newlines.

### Replacing Filenames

Tokens can also be placed on file names.

Model:

```json
{
  "name": "CustomerOrder"
}
```

Template:

```text
{{dashlcase}}.component.css
{{dashlcase}}.component.html
{{dashlcase}}.component.ts
```

Output:

```text
customer-order.component.css
CustomerOrders.component.html
CustomerOrder.component.ts
```
