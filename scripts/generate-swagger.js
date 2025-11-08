/* eslint-disable @typescript-eslint/no-var-requires */
const { NestFactory } = require('@nestjs/core');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
const { AppModule } = require('../dist/app.module');
const fs = require('fs');
const path = require('path');

async function generate() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Movie API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const outputPath = path.join(process.cwd(), 'dist', 'swagger.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  await app.close();
}

generate().catch((err) => {
  console.error('Failed to generate swagger', err);
  process.exit(1);
});
