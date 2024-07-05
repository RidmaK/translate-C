import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TranslationCoordinatorService } from './translationCoordinator.service';
import { ContentBodyDto } from './dtos/content-body.dto';

@Controller('translations-coordinator')
export class TranslationCoordinatorController {
  private readonly logger = new Logger(TranslationCoordinatorController.name);
  constructor(
    private translationCoordinatorService: TranslationCoordinatorService,
  ) {}

  @Post()
  async createTranslatableContent(
    @Body() createTranslatableContentDto: any,
  ): Promise<any> {
    try {
      const { event, model, entry } = createTranslatableContentDto;

      if (!event || !model || !entry) {
        throw new BadRequestException(
          'Missing required fields: event, model, or entry',
        );
      }

      this.logger.log(`Received createTranslatableContent request:`);

      const result =
        await this.translationCoordinatorService.createOrUpdateTranslatableContent(
          entry,
          model,
        );
      this.logger.log(
        `Successfully processed createTranslatableContent request for model: ${model}, event: ${event}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error in createTranslatableContent: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred while creating translatable content',
      );
    }
  }

  @Get('get-all')
  async getAllTranslatableContent() {
    return await this.translationCoordinatorService.getAllTranslatableContent();
  }

  @Post('update-content')
  async updateStrapiTranslatableContent(): Promise<any> {
    try {
      this.logger.log('Starting updateStrapiTranslatableContent request');

      // Call the service method to generate and post Strapi data
      const result =
        await this.translationCoordinatorService.generateStrapiDataAndPost();

      this.logger.log('Successfully updated Strapi translatable content');
      return result;
    } catch (error) {
      this.logger.error(
        `Error in updateStrapiTranslatableContent: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred while updating Strapi translatable content',
      );
    }
  }

  @Post('/save-translatable-content-by-id')
  async saveTranslatableContentByIds(
    @Body() contentBodyDto: ContentBodyDto,
  ): Promise<any> {
    try {
      if (!contentBodyDto.ids || contentBodyDto.ids.length === 0) {
        throw new BadRequestException('No IDs provided');
      }

      const documentContent = contentBodyDto.ids;
      const model = contentBodyDto.model;

      const updateResults = [];

      for (const id of documentContent) {
        try {
          const updateContent =
            await this.translationCoordinatorService.callStrapiAndGetContent(
              id,
              model,
            );
          updateResults.push({ id, updateContent });
        } catch (error) {
          this.logger.error(
            `Error updating content for ID ${id}: ${error.message}`,
            error.stack,
          );
          updateResults.push({ id, error: error.message });
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in translationByIds: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An error occurred while processing the translation requests',
      );
    }
  }
}
