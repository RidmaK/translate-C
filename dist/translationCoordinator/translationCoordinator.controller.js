"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TranslationCoordinatorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationCoordinatorController = void 0;
const common_1 = require("@nestjs/common");
const translationCoordinator_service_1 = require("./translationCoordinator.service");
const content_body_dto_1 = require("./dtos/content-body.dto");
let TranslationCoordinatorController = TranslationCoordinatorController_1 = class TranslationCoordinatorController {
    constructor(translationCoordinatorService) {
        this.translationCoordinatorService = translationCoordinatorService;
        this.logger = new common_1.Logger(TranslationCoordinatorController_1.name);
    }
    async createTranslatableContent(createTranslatableContentDto) {
        try {
            const { event, model, entry } = createTranslatableContentDto;
            if (!event || !model || !entry) {
                throw new common_1.BadRequestException('Missing required fields: event, model, or entry');
            }
            this.logger.log(`Received createTranslatableContent request:`);
            const result = await this.translationCoordinatorService.createOrUpdateTranslatableContent(entry, model);
            this.logger.log(`Successfully processed createTranslatableContent request for model: ${model}, event: ${event}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error in createTranslatableContent: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('An error occurred while creating translatable content');
        }
    }
    async getAllTranslatableContent() {
        return await this.translationCoordinatorService.getAllTranslatableContent();
    }
    async updateStrapiTranslatableContent() {
        try {
            this.logger.log('Starting updateStrapiTranslatableContent request');
            const result = await this.translationCoordinatorService.generateStrapiDataAndPost();
            this.logger.log('Successfully updated Strapi translatable content');
            return result;
        }
        catch (error) {
            this.logger.error(`Error in updateStrapiTranslatableContent: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('An error occurred while updating Strapi translatable content');
        }
    }
    async saveTranslatableContentByIds(contentBodyDto) {
        try {
            if (!contentBodyDto.ids || contentBodyDto.ids.length === 0) {
                throw new common_1.BadRequestException('No IDs provided');
            }
            const documentContent = contentBodyDto.ids;
            const model = contentBodyDto.model;
            const updateResults = [];
            for (const id of documentContent) {
                try {
                    const updateContent = await this.translationCoordinatorService.callStrapiAndGetContent(id, model);
                    updateResults.push({ id, updateContent });
                }
                catch (error) {
                    this.logger.error(`Error updating content for ID ${id}: ${error.message}`, error.stack);
                    updateResults.push({ id, error: error.message });
                }
            }
        }
        catch (error) {
            this.logger.error(`Error in translationByIds: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('An error occurred while processing the translation requests');
        }
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TranslationCoordinatorController.prototype, "createTranslatableContent", null);
__decorate([
    (0, common_1.Get)('get-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TranslationCoordinatorController.prototype, "getAllTranslatableContent", null);
__decorate([
    (0, common_1.Post)('update-content'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TranslationCoordinatorController.prototype, "updateStrapiTranslatableContent", null);
__decorate([
    (0, common_1.Post)('/save-translatable-content-by-id'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [content_body_dto_1.ContentBodyDto]),
    __metadata("design:returntype", Promise)
], TranslationCoordinatorController.prototype, "saveTranslatableContentByIds", null);
TranslationCoordinatorController = TranslationCoordinatorController_1 = __decorate([
    (0, common_1.Controller)('translations-coordinator'),
    __metadata("design:paramtypes", [translationCoordinator_service_1.TranslationCoordinatorService])
], TranslationCoordinatorController);
exports.TranslationCoordinatorController = TranslationCoordinatorController;
//# sourceMappingURL=translationCoordinator.controller.js.map