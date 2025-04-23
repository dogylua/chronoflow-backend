import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./core/filters/http-exception.filter";
import { LoggingInterceptor } from "./core/interceptors/logging.interceptor";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(compression());
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Validation and Error Handling
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle("ChronoFlow API")
    .setDescription("The ChronoFlow API description")
    .setVersion("1.0")
    .addBearerAuth()
    .addServer("http://localhost:8080")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: "ChronoFlow API Documentation",
  });

  // Start the application
  const port = configService.get<number>("PORT") || 8080;
  await app.listen(port);
  console.log(`
🚀 Application is running on: http://localhost:${port}
📝 API Documentation: http://localhost:${port}/swagger
  `);
}

bootstrap();
