import { TranslationCoordinatorRepository } from 'src/repository/translationCoordinator.repository';
import { ConfigService } from '@nestjs/config';
import { TranslatableContentDocument } from 'src/schemas/translatableContent.schema';
import { HttpService } from '@nestjs/axios';
export declare class TranslationCoordinatorService {
    private translationCoordinatorRepository;
    private configService;
    private httpService;
    private readonly logger;
    constructor(translationCoordinatorRepository: TranslationCoordinatorRepository, configService: ConfigService, httpService: HttpService);
    transformData(comingData: any, locale: any, contentType: string): Promise<{
        contentId: any;
        fields: {
            fieldName: string;
            text: any;
            output: string;
            status: string;
        }[];
        status: string;
        locale: any;
        contentType: string;
    }>;
    createOrUpdateTranslatableContent(entry: any, model: any): Promise<void>;
    getAllTranslatableContent(): Promise<TranslatableContentDocument[]>;
    strapiTranslatedDataUpdate(): Promise<void>;
    callStrapiAndGetContent(id: string, model: string): Promise<void>;
    pluralizeHyphenatedWord(hyphenatedWord: string): string;
    generateStrapiDataAndPost(): Promise<{
        success: string[];
        failed: string[];
    }>;
    buildStrapiData(content: any, getResponse: any, contentType: string): Promise<any>;
    getRelationContentsLocalizationId(contentType: string, contentId: string, locale: string): Promise<string>;
    updateOrCreateTranslation(contentId: string, locale: string, status: string, content_type: string): Promise<{
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        message?: undefined;
        error?: undefined;
    }>;
}
