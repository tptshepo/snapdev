# {{name}} Template

This template describes what is available in template and how to use it.

# Data Model

```json
{
  "package": "co.za.snapdev",
  "name": "MyModel",
  "plural": "MyModels",
  "properties": [
    {
      "name": "Field1",
      "type": "String"
    },
    {
      "name": "Field2",
      "type": "String"
    }
  ]
}
```

# Tokens

Output from the default.json model

| Token            | Value     |
| ---------------- | --------- |
| camelcase        | myModel   |
| lcase            | mymodel   |
| ucase            | MYMODEL   |
| underscorelcase  | my_model  |
| underscoreucase  | MY_MODEL  |
| dashlcase        | my-model  |
| dashucase        | MY-MODEL  |
| titlecase        | MyModel   |
| rcamelcase       | myModel   |
| rlcase           | mymodel   |
| rucase           | MYMODEL   |
| runderscorelcase | my_model  |
| runderscoreucase | MY_MODEL  |
| rdashlcase       | my-model  |
| rdashucase       | MY-MODEL  |
| rtitlecase       | MyModel   |
| **Plural**       |           |
| pcamelcase       | myModels  |
| plcase           | mymodels  |
| pucase           | MYMODELS  |
| punderscorelcase | my_models |
| punderscoreucase | MY_MODELS |
| pdashlcase       | my-models |
| pdashucase       | MY-MODELS |
| ptitlecase       | MyModels  |
