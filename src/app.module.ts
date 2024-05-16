import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_NAME: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
      }),
    }),
    {
      global: true,
      ...HttpModule.registerAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          baseURL: config.get<string>('KEYCLOAK_URL'),
        }),
      }),
    },
    CategoryModule,
    AuthModule,
  ],
})
export class AppModule {}
