const swaggerUi = require('swagger-ui-express');
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Autotransporti',
        version: '0.0.',
        description: 'API para gerenciamento de uma auto transportadora',
    },
    servers: [{
        url: 'http://localhost:3000',
        description: 'Development server',
    }],
 };

 const outputFile = './swagger-output.json';
 const endpointsFiles = ['./src/routes'];

swaggerAutogen(outputFile, endpointsFiles, swaggerDefinition).then(() => {
    require('./index');
});