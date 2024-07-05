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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationCoordinatorRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const translatableContent_schema_1 = require("../schemas/translatableContent.schema");
let TranslationCoordinatorRepository = class TranslationCoordinatorRepository {
    constructor(translatableContentModel) {
        this.translatableContentModel = translatableContentModel;
    }
    async createTranslatableContent(entry) {
        const { title, id, field, locale } = entry;
        const createdTranslatableContent = new this.translatableContentModel(entry);
        return await createdTranslatableContent.save();
    }
    async findAll() {
        return this.translatableContentModel.find().exec();
    }
    async getAllFindByStatus(status) {
        return await this.translatableContentModel.find({ status: status }).exec();
    }
    async checkContentIdExisting(entryId, locale) {
        return this.translatableContentModel
            .find({ contentId: entryId, locale: locale })
            .exec();
    }
    async updateTranslatableContentStatus(status, contentId) {
        return await this.translatableContentModel
            .updateOne({ _id: contentId }, { $set: { status: status } })
            .exec();
    }
    async updateTranslatableContent(entry) {
        console.log('entry.contentId', entry.contentId);
        return this.translatableContentModel.updateOne({
            contentId: entry.contentId,
            locale: entry.locale,
        }, entry);
    }
    async updateTranslatedContentStatus(contentId, newStatus, locale) {
        return this.translatableContentModel
            .updateOne({
            contentId,
            locale,
        }, { $set: { status: newStatus } })
            .exec();
    }
};
TranslationCoordinatorRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(translatableContent_schema_1.TranslatableContent.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TranslationCoordinatorRepository);
exports.TranslationCoordinatorRepository = TranslationCoordinatorRepository;
//# sourceMappingURL=translationCoordinator.repository.js.map