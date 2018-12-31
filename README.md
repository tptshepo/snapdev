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

### Step2: Register the package with the code generator

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

### Step3: Define the data model

The data model is a json file that is used for merging with your template files in order to create the final output. The json model can be defined in any structure that makes sense to your template files.
Go into the `/data` folder and create a folder called `hello` and inside that folder create a file called `hello.json`.
Add the following contect to the file.

```json
{
  "package": "com.example.helloworld",
  "class": "User",
  "properties": [
    { "name": "FirstName", "type": "String" },
    { "name": "LastName", "type": "String" },
    { "name": "Email", "type": "String" },
    { "name": "Age", "type": "int" }
  ]
}
```

### Step4: Run the code generator

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