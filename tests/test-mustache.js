const mustache = require('mustache');

let dataModel = {
  name: 'Chris',
  company: '<b>GitHub</b>'
};

let template = `
1* {{name}}
2* {{age}}
3* {{company}}
4* {{{company}}}
5* {{&company}}
{{=<% %>=}}
6* {{company}}
<%={{ }}=%>
`;

let output = mustache.render(template, dataModel);

console.log(output);
