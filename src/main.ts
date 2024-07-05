import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logtail = new Logtail('WG16Up6HW4ba2a78hQfuRo4n');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new LogtailTransport(logtail),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    }),
  });
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  // Increase the payload size limit
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(port);
}
bootstrap();
