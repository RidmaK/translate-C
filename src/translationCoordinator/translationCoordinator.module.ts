import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TranslatableContent,
  TranslatableContentSchema,
} from 'src/schemas/translatableContent.schema';
import { TranslationCoordinatorService } from './translationCoordinator.service';
import { TranslationCoordinatorRepository } from 'src/repository/translationCoordinator.repository';
import { TranslationCoordinatorController } from './translationCoordinator.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TranslatableContent.name, schema: TranslatableContentSchema },
    ]),
    HttpModule,
  ],
  controllers: [TranslationCoordinatorController],
  providers: [TranslationCoordinatorRepository, TranslationCoordinatorService],
})
export class TranslationCoordinatorModule {}
