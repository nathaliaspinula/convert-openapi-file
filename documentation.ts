import * as fs from 'fs';

class Documentation {
  private jsonDocument: any;
  private textDocument: string;

  constructor(jsonDocument: any) {
    this.jsonDocument = jsonDocument;
    this.textDocument = '';
  }

  saveToFile(fileName: string, content: string) {
    fs.writeFileSync(fileName, content);
  }

  generateTextDocumentation() {
    const swagger = this.jsonDocument;
    let documentation = `## ${swagger.info.title} Documentation\n`;
    documentation += `*Automatically Generated at: ${new Date()}*\n\n`;

    // Paths
    Object.keys(swagger.paths).forEach((path) => {
      const methods = swagger.paths[path];
      Object.keys(methods).forEach((method) => {
        const details = methods[method];
        documentation += `### [${method.toUpperCase()}] ${path}\n`;
        documentation += `**Description:** ${details.description}\n`;

        // Parameters
        if (details.parameters) {
          documentation += `**Parameters:**\n`;
          details.parameters.forEach((param) => {
            documentation += `- **(${param.in}) ${param.name}**:\n`;
            documentation += `  - Description: ${param?.description}\n`;
            documentation += `  - Type: ${param.schema.type}\n`;
            documentation += `  - Required: ${param.required}\n\n`;
          });
        }

        // Responses
        documentation += `**Responses:**\n`;
        Object.keys(details.responses).forEach((status) => {
          documentation += `- ${status}: ${details.responses[status].description}\n`;

          if (details.responses[status].content) {
            const ref =
              details.responses[status].content['application/json'].schema[
                '$ref'
              ];

            // Schema
            const schema = swagger.components.schemas[ref.split('/')[3]];

            Object.keys(schema.properties).forEach((prop) => {
              documentation += `  - ${prop}: ${schema.properties[prop].description}\n`;

              const items = schema.properties[prop].items;
              if (items) {
                documentation += `   - Items:\n`;
                Object.keys(items.properties).forEach((item) => {
                  documentation += `      - ${item}: ${items.properties[item].type}\n`;
                });
              }
            });
          }
        });

        documentation += '\n';
      });
    });

    this.textDocument = documentation;
  }

  buildTextDocumentation() {
    this.generateTextDocumentation();
    this.saveToFile('./src/docs/documentation.txt', this.textDocument);
  }
}

export default Documentation;
