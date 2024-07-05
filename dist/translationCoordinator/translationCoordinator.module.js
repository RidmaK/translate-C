"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationCoordinatorModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const translatableContent_schema_1 = require("../schemas/translatableContent.schema");
const translationCoordinator_service_1 = require("./translationCoordinator.service");
const translationCoordinator_repository_1 = require("../repository/translationCoordinator.repository");
const translationCoordinator_controller_1 = require("./translationCoordinator.controller");
const axios_1 = require("@nestjs/axios");
let TranslationCoordinatorModule = class TranslationCoordinatorModule {
};
TranslationCoordinatorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: translatableContent_schema_1.TranslatableContent.name, schema: translatableContent_schema_1.TranslatableContentSchema },
            ]),
            axios_1.HttpModule,
        ],
        controllers: [translationCoordinator_controller_1.TranslationCoordinatorController],
        providers: [translationCoordinator_repository_1.TranslationCoordinatorRepository, translationCoordinator_service_1.TranslationCoordinatorService],
    })
], TranslationCoordinatorModule);
exports.TranslationCoordinatorModule = TranslationCoordinatorModule;
//# sourceMappingURL=translationCoordinator.module.js.map