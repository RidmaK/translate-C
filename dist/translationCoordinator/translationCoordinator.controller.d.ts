import { TranslationCoordinatorService } from './translationCoordinator.service';
import { ContentBodyDto } from './dtos/content-body.dto';
export declare class TranslationCoordinatorController {
    private translationCoordinatorService;
    private readonly logger;
    constructor(translationCoordinatorService: TranslationCoordinatorService);
    createTranslatableContent(createTranslatableContentDto: any): Promise<any>;
    getAllTranslatableContent(): Promise<import("../schemas/translatableContent.schema").TranslatableContentDocument[]>;
    updateStrapiTranslatableContent(): Promise<any>;
    saveTranslatableContentByIds(contentBodyDto: ContentBodyDto): Promise<any>;
}
