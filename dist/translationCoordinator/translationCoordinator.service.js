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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationCoordinatorService = void 0;
const common_1 = require("@nestjs/common");
const translationCoordinator_repository_1 = require("../repository/translationCoordinator.repository");
const config_1 = require("@nestjs/config");
const address = require("address");
const axios_1 = require("axios");
const axios_2 = require("@nestjs/axios");
const pluralize = require("pluralize");
const rxjs_1 = require("rxjs");
const translatableContent_interface_1 = require("../interfaces/translatableContent.interface");
const ip = address.ip();
let TranslationCoordinatorService = class TranslationCoordinatorService {
    constructor(translationCoordinatorRepository, configService, httpService) {
        this.translationCoordinatorRepository = translationCoordinatorRepository;
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(`${ip} src/translationCoordinator/translationCoordinator.service.ts`);
    }
    async transformData(comingData, locale, contentType) {
        try {
            const fields = [];
            const addField = (fieldName, text) => {
                if (text !== undefined && text !== null && text !== '') {
                    fields.push({
                        fieldName: fieldName,
                        text: text,
                        output: '',
                        status: 'PENDING',
                    });
                }
            };
            const getFieldValue = (data, path) => {
                return path.split('.').reduce((obj, key) => obj === null || obj === void 0 ? void 0 : obj[key], data);
            };
            const mappings = translatableContent_interface_1.fieldMappings[contentType];
            if (!mappings) {
                throw new Error(`Unknown content type: ${contentType}`);
            }
            mappings.forEach((field) => {
                const value = getFieldValue(comingData, field);
                addField(field, value);
            });
            const data = {
                contentId: comingData.id,
                fields: fields,
                status: 'PENDING',
                locale: locale,
                contentType: contentType,
            };
            this.logger.log(`transform Data success, time=${new Date().getTime()}`);
            return data;
        }
        catch (error) {
            this.logger.error(`transform Data Error = ${error}, time=${new Date().getTime()}`);
        }
    }
    async createOrUpdateTranslatableContent(entry, model) {
        try {
            if (entry.locale !== 'en') {
                return;
            }
            const locales = await axios_1.default.get(`${this.configService.get('STRAPI_URL')}/i18n/locales`);
            locales.data.map(async (value) => {
                if (value.isDefault) {
                    return;
                }
                const saveData = await this.transformData(entry, value.code, model);
                const updateOrCreateTranslation = await this.updateOrCreateTranslation(entry.id, value.code, "PENDING", model);
                const existingContent = await this.translationCoordinatorRepository.checkContentIdExisting(entry.id, value.code);
                if (!existingContent.length) {
                    const newContent = this.translationCoordinatorRepository
                        .createTranslatableContent(saveData)
                        .then(() => {
                        this.logger.log(`Create Translatable Content successful, time=${new Date().getTime()}`);
                    })
                        .catch((error) => {
                        this.logger.log(`Create Translatable Content Error = ${error},  time=${new Date().getTime()}`);
                    });
                    return newContent;
                }
                else {
                    const updatedContent = await this.translationCoordinatorRepository
                        .updateTranslatableContent(saveData)
                        .then(() => {
                        this.logger.log(`Update Translatable Content successful, time=${new Date().getTime()}`);
                    })
                        .catch((error) => {
                        this.logger.error(`Update Translatable Content Error: ${error}, time=${new Date().getTime()}`);
                    });
                    return updatedContent;
                }
            });
        }
        catch (err) {
            this.logger.error(`Create or Update Translatable Content Error: ${err}, time=${new Date().getTime()}`);
            throw new Error(`Create or Update Translatable Content Error: ${err}, time=${new Date().getTime()}`);
        }
    }
    async getAllTranslatableContent() {
        try {
            return await this.translationCoordinatorRepository.findAll();
        }
        catch (err) {
            this.logger.error(`findAll Translatable Content Error: ${err}, time=${new Date().getTime()}`);
            throw new Error(`findAll Translatable Content Error: ${err}, time=${new Date().getTime()}`);
        }
    }
    async strapiTranslatedDataUpdate() {
        console.log('⌚ Run EVERY_MINUTE... strapiTranslatedDataUpdate');
        try {
            this.logger.log(`strapi Translated Data Update successful, time=${new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })).toLocaleTimeString('en-US', { hour12: true })}`);
        }
        catch (error) {
            this.logger.error(`strapi Translated Data Update Error: ${error}, time=${new Date().getTime()}`);
            throw new Error(`strapi Translated Data Update Error: ${error}, time=${new Date().getTime()}`);
        }
    }
    async callStrapiAndGetContent(id, model) {
        var _a;
        try {
            const configurations = {
                headers: {
                    Authorization: `Bearer ${this.configService.get('STRAPI_API_TOKEN')}`,
                },
            };
            let getRequest = this.httpService
                .get(`${this.configService.get('STRAPI_URL')}/${this.pluralizeHyphenatedWord(model)}/${id}?populate[faq][populate]=*&populate[pros_and_cons][populate]=*&populate[seo][populate]=*&populate[feature_image][populate]=*&populate[author][populate]=*&populate[blog_category][populate]=*&populate[single_review_cta][populate]=*&populate[compare_review][populate]=*&populate[cbc_section][populate]=*&populate[deals_cta_lists][populate]=*&populate[localizations][populate]=*&populate[display_picture][populate]=*&populate[newsletters][populate]=*&populate[blogs][populate]=*&populate[graduate_from][populate]=*&populate[website_url][populate]=*&populate[cta_banner][populate]=*`, configurations)
                .pipe((0, rxjs_1.map)((res) => res.data))
                .pipe((0, rxjs_1.catchError)((error) => {
                this.logger.error(`Error in API call: ${error.message}`);
                throw new common_1.ForbiddenException('API not available');
            }));
            const getResponse = await (0, rxjs_1.lastValueFrom)(getRequest);
            if (getResponse) {
                const entry = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data.attributes;
                entry.id = (_a = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _a === void 0 ? void 0 : _a.id;
                return this.createOrUpdateTranslatableContent(entry, model);
            }
            else {
                this.logger.warn(`No response received for content ${this.pluralizeHyphenatedWord(model)}  ID: ${id}`);
                return;
            }
        }
        catch (error) {
            this.logger.error(`An error occurred in  Call Strapi And Get Content: ${error.message}`, error.stack);
        }
    }
    pluralizeHyphenatedWord(hyphenatedWord) {
        const words = hyphenatedWord.split('-');
        if (words.length === 2 && words.length > 1) {
            words[1] = pluralize.plural(words[1]);
        }
        else if (words.length === 3 && words.length > 2) {
            words[2] = pluralize.plural(words[2]);
        }
        const pluralizedWord = words.join('-');
        if (!pluralizedWord.endsWith('s')) {
            return pluralizedWord + 's';
        }
        return pluralizedWord;
    }
    async generateStrapiDataAndPost() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55;
        const translatedContent = await this.translationCoordinatorRepository.getAllFindByStatus(translatableContent_interface_1.Status.TRANSLATED);
        const success = [];
        const failed = [];
        for (const content of translatedContent) {
            let getRequest = this.httpService
                .get(`${this.configService.get('STRAPI_URL')}/${this.pluralizeHyphenatedWord(content.contentType)}/${content.contentId}?populate[faq][populate]=*&populate[pros_and_cons][populate]=*&populate[seo][populate]=*&populate[feature_image][populate]=*&populate[author][populate]=*&populate[blog_category][populate]=*&populate[single_review_cta][populate]=*&populate[compare_review][populate]=*&populate[cbc_section][populate]=*&populate[deals_cta_lists][populate]=*&populate[localizations][populate]=*&populate[display_picture][populate]=*&populate[newsletters][populate]=*&populate[blogs][populate]=*&populate[graduate_from][populate]=*&populate[website_url][populate]=*&populate[cta_banner][populate]=*`)
                .pipe((0, rxjs_1.map)((res) => res.data), (0, rxjs_1.catchError)((error) => {
                throw new Error('Strapi API not available' + error);
            }));
            let getResponse;
            try {
                getResponse = await (0, rxjs_1.lastValueFrom)(getRequest);
            }
            catch (error) {
                console.error(`Error fetching detailed ${content.contentType} data from Strapi API`, error);
                failed.push(content._id);
                continue;
            }
            const localizations = (_a = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _a === void 0 ? void 0 : _a.attributes.localizations.data;
            const existingLocalization = localizations.find((loc) => loc.attributes.locale === content.locale);
            const configurations = {
                headers: {
                    Authorization: `Bearer ${this.configService.get('STRAPI_API_TOKEN')}`,
                },
            };
            let postRequest;
            if (existingLocalization) {
                const strapiData = await this.buildStrapiData(content, { data: existingLocalization }, content.contentType);
                (_b = strapiData === null || strapiData === void 0 ? void 0 : strapiData.seo) === null || _b === void 0 ? true : delete _b.video_structured_data;
                (_c = strapiData === null || strapiData === void 0 ? void 0 : strapiData.seo) === null || _c === void 0 ? true : delete _c.id;
                if ((strapiData === null || strapiData === void 0 ? void 0 : strapiData.faq) && Array.isArray(strapiData === null || strapiData === void 0 ? void 0 : strapiData.faq)) {
                    strapiData.faq.forEach((faq) => {
                        delete faq.id;
                    });
                }
                strapiData === null || strapiData === void 0 ? true : delete strapiData.slug;
                (_d = strapiData === null || strapiData === void 0 ? void 0 : strapiData.compare_review) === null || _d === void 0 ? true : delete _d.id;
                (_e = strapiData === null || strapiData === void 0 ? void 0 : strapiData.single_review_cta) === null || _e === void 0 ? true : delete _e.id;
                (_f = strapiData === null || strapiData === void 0 ? void 0 : strapiData.cbc_section) === null || _f === void 0 ? true : delete _f.id;
                (_h = (_g = strapiData === null || strapiData === void 0 ? void 0 : strapiData.cbc_section) === null || _g === void 0 ? void 0 : _g.logo) === null || _h === void 0 ? true : delete _h.id;
                strapiData === null || strapiData === void 0 ? true : delete strapiData.locale;
                if (content.contentType === 'author') {
                    if ((_m = (_l = (_k = (_j = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _j === void 0 ? void 0 : _j.attributes) === null || _k === void 0 ? void 0 : _k.display_picture) === null || _l === void 0 ? void 0 : _l.data) === null || _m === void 0 ? void 0 : _m.attributes) {
                        strapiData.display_picture =
                            (_r = (_q = (_p = (_o = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _o === void 0 ? void 0 : _o.attributes) === null || _p === void 0 ? void 0 : _p.display_picture) === null || _q === void 0 ? void 0 : _q.data) === null || _r === void 0 ? void 0 : _r.attributes;
                        strapiData.display_picture.id =
                            (_v = (_u = (_t = (_s = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _s === void 0 ? void 0 : _s.attributes) === null || _t === void 0 ? void 0 : _t.display_picture) === null || _u === void 0 ? void 0 : _u.data) === null || _v === void 0 ? void 0 : _v.id;
                        (_w = strapiData === null || strapiData === void 0 ? void 0 : strapiData.display_picture) === null || _w === void 0 ? true : delete _w.related;
                    }
                    strapiData.website_url = (_y = (_x = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _x === void 0 ? void 0 : _x.attributes) === null || _y === void 0 ? void 0 : _y.website_url;
                    strapiData.graduate_from =
                        (_0 = (_z = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _z === void 0 ? void 0 : _z.attributes) === null || _0 === void 0 ? void 0 : _0.graduate_from;
                    (_1 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.website_url) === null || _1 === void 0 ? true : delete _1.id;
                    (_2 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.graduate_from) === null || _2 === void 0 ? true : delete _2.id;
                    if ((strapiData === null || strapiData === void 0 ? void 0 : strapiData.website_url) &&
                        Array.isArray(strapiData === null || strapiData === void 0 ? void 0 : strapiData.website_url)) {
                        strapiData === null || strapiData === void 0 ? void 0 : strapiData.website_url.forEach((url) => {
                            delete url.id;
                        });
                    }
                    if ((strapiData === null || strapiData === void 0 ? void 0 : strapiData.graduate_from) &&
                        Array.isArray(strapiData === null || strapiData === void 0 ? void 0 : strapiData.graduate_from)) {
                        strapiData === null || strapiData === void 0 ? void 0 : strapiData.graduate_from.forEach((data) => {
                            delete data.id;
                        });
                    }
                }
                if (content.contentType === 'blog') {
                    if ((_5 = (_4 = (_3 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _3 === void 0 ? void 0 : _3.attributes.feature_image) === null || _4 === void 0 ? void 0 : _4.data) === null || _5 === void 0 ? void 0 : _5.attributes) {
                        strapiData.feature_image =
                            (_6 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _6 === void 0 ? void 0 : _6.attributes.feature_image.data.attributes;
                        strapiData.feature_image.id =
                            (_7 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _7 === void 0 ? void 0 : _7.attributes.feature_image.data.id;
                        delete strapiData.feature_image.related;
                    }
                    if ((_11 = (_10 = (_9 = (_8 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _8 === void 0 ? void 0 : _8.attributes) === null || _9 === void 0 ? void 0 : _9.single_review_cta) === null || _10 === void 0 ? void 0 : _10.logo) === null || _11 === void 0 ? void 0 : _11.data) {
                        strapiData.single_review_cta.logo.id =
                            (_15 = (_14 = (_13 = (_12 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _12 === void 0 ? void 0 : _12.attributes) === null || _13 === void 0 ? void 0 : _13.single_review_cta.logo) === null || _14 === void 0 ? void 0 : _14.data) === null || _15 === void 0 ? void 0 : _15.id;
                    }
                    if ((_19 = (_18 = (_17 = (_16 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _16 === void 0 ? void 0 : _16.attributes) === null || _17 === void 0 ? void 0 : _17.compare_review) === null || _18 === void 0 ? void 0 : _18.company_one_logo) === null || _19 === void 0 ? void 0 : _19.data) {
                        strapiData.compare_review.company_one_logo.id =
                            (_24 = (_23 = (_22 = (_21 = (_20 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _20 === void 0 ? void 0 : _20.attributes) === null || _21 === void 0 ? void 0 : _21.compare_review) === null || _22 === void 0 ? void 0 : _22.company_one_logo) === null || _23 === void 0 ? void 0 : _23.data) === null || _24 === void 0 ? void 0 : _24.id;
                    }
                    if ((_28 = (_27 = (_26 = (_25 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _25 === void 0 ? void 0 : _25.attributes) === null || _26 === void 0 ? void 0 : _26.compare_review) === null || _27 === void 0 ? void 0 : _27.company_two_logo) === null || _28 === void 0 ? void 0 : _28.data) {
                        strapiData.compare_review.company_two_logo.id =
                            (_33 = (_32 = (_31 = (_30 = (_29 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _29 === void 0 ? void 0 : _29.attributes) === null || _30 === void 0 ? void 0 : _30.compare_review) === null || _31 === void 0 ? void 0 : _31.company_two_logo) === null || _32 === void 0 ? void 0 : _32.data) === null || _33 === void 0 ? void 0 : _33.id;
                    }
                }
                if (content.contentType === 'deals-cta-list') {
                    if ((_37 = (_36 = (_35 = (_34 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _34 === void 0 ? void 0 : _34.attributes) === null || _35 === void 0 ? void 0 : _35.cta_banner) === null || _36 === void 0 ? void 0 : _36.data) === null || _37 === void 0 ? void 0 : _37.attributes) {
                        strapiData.cta_banner =
                            (_41 = (_40 = (_39 = (_38 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _38 === void 0 ? void 0 : _38.attributes) === null || _39 === void 0 ? void 0 : _39.cta_banner) === null || _40 === void 0 ? void 0 : _40.data) === null || _41 === void 0 ? void 0 : _41.attributes;
                        strapiData.cta_banner.id =
                            (_45 = (_44 = (_43 = (_42 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _42 === void 0 ? void 0 : _42.attributes) === null || _43 === void 0 ? void 0 : _43.cta_banner) === null || _44 === void 0 ? void 0 : _44.data) === null || _45 === void 0 ? void 0 : _45.id;
                        (_46 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.cta_banner) === null || _46 === void 0 ? true : delete _46.related;
                    }
                }
                console.log('strapiData 🍔🍔🍔🍔🍔🍔', strapiData);
                postRequest = this.httpService
                    .put(`${this.configService.get('STRAPI_URL')}/${this.pluralizeHyphenatedWord(content.contentType)}/${existingLocalization.id}`, { data: strapiData }, configurations)
                    .pipe((0, rxjs_1.map)((res) => {
                    console.log('updated ✅✅✅✅✅✅:checkered_flag:');
                    return res.data;
                }));
            }
            else {
                const strapiData = await this.buildStrapiData(content, getResponse, content.contentType);
                (_47 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.seo) === null || _47 === void 0 ? true : delete _47.video_structured_data;
                (_48 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.seo) === null || _48 === void 0 ? true : delete _48.id;
                (_49 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.compare_review) === null || _49 === void 0 ? true : delete _49.id;
                (_50 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.single_review_cta) === null || _50 === void 0 ? true : delete _50.id;
                (_51 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.cbc_section) === null || _51 === void 0 ? true : delete _51.id;
                (_53 = (_52 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.cbc_section) === null || _52 === void 0 ? void 0 : _52.logo) === null || _53 === void 0 ? true : delete _53.id;
                if (content.contentType === 'author') {
                    (_54 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.website_url) === null || _54 === void 0 ? true : delete _54.id;
                    (_55 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.graduate_from) === null || _55 === void 0 ? true : delete _55.id;
                    if ((strapiData === null || strapiData === void 0 ? void 0 : strapiData.website_url) &&
                        Array.isArray(strapiData === null || strapiData === void 0 ? void 0 : strapiData.website_url)) {
                        strapiData === null || strapiData === void 0 ? void 0 : strapiData.website_url.forEach((url) => {
                            delete url.id;
                        });
                    }
                    if ((strapiData === null || strapiData === void 0 ? void 0 : strapiData.graduate_from) &&
                        Array.isArray(strapiData === null || strapiData === void 0 ? void 0 : strapiData.graduate_from)) {
                        strapiData === null || strapiData === void 0 ? void 0 : strapiData.graduate_from.forEach((data) => {
                            delete data.id;
                        });
                    }
                }
                if ((strapiData === null || strapiData === void 0 ? void 0 : strapiData.faq) && Array.isArray(strapiData === null || strapiData === void 0 ? void 0 : strapiData.faq)) {
                    strapiData === null || strapiData === void 0 ? void 0 : strapiData.faq.forEach((faq) => {
                        faq === null || faq === void 0 ? true : delete faq.id;
                    });
                }
                console.log('strapiData 🌲🌲🌲🌲🌲🌲🌲🌲', strapiData);
                postRequest = this.httpService
                    .post(`${this.configService.get('STRAPI_URL')}/${this.pluralizeHyphenatedWord(content.contentType)}/${content.contentId}/localizations`, strapiData, configurations)
                    .pipe((0, rxjs_1.map)((res) => {
                    console.log('Created 🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁:checkered_flag:');
                    return res.data;
                }));
            }
            try {
                getResponse = await (0, rxjs_1.lastValueFrom)(postRequest);
            }
            catch (error) {
                console.error('Error posting strapiData to Strapi API', error);
                failed.push(content._id);
                continue;
            }
            try {
                await this.translationCoordinatorRepository.updateTranslatableContentStatus(translatableContent_interface_1.Status.COMPLETED, content._id);
                const updateOrCreateTranslation = await this.updateOrCreateTranslation(content.contentId, content.locale, translatableContent_interface_1.Status.COMPLETED, content.contentType);
                console.log('Updated MongoDB content status to COMPLETED for contentId:', content.contentId);
                success.push(content._id);
            }
            catch (error) {
                console.error('Error updating MongoDB status to COMPLETED:', error);
                failed.push(content._id);
            }
        }
        return {
            success,
            failed,
        };
    }
    async buildStrapiData(content, getResponse, contentType) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80;
        const strapiData = {};
        for (const field of translatableContent_interface_1.commonFields) {
            if (((_a = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _a === void 0 ? void 0 : _a.attributes[field]) !== undefined) {
                strapiData[field] = (_b = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _b === void 0 ? void 0 : _b.attributes[field];
            }
        }
        if (contentType === 'blog') {
            strapiData.push_to_top = 1;
            strapiData.pushing_timestamp = new Date().toISOString();
            if ((_f = (_e = (_d = (_c = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _c === void 0 ? void 0 : _c.attributes) === null || _d === void 0 ? void 0 : _d.author) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.id) {
                strapiData.author =
                    content.locale === ((_h = (_g = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _g === void 0 ? void 0 : _g.attributes) === null || _h === void 0 ? void 0 : _h.locale)
                        ? [(_m = (_l = (_k = (_j = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _j === void 0 ? void 0 : _j.attributes) === null || _k === void 0 ? void 0 : _k.author) === null || _l === void 0 ? void 0 : _l.data) === null || _m === void 0 ? void 0 : _m.id]
                        : [
                            await this.getRelationContentsLocalizationId('author', (_r = (_q = (_p = (_o = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _o === void 0 ? void 0 : _o.attributes) === null || _p === void 0 ? void 0 : _p.author) === null || _q === void 0 ? void 0 : _q.data) === null || _r === void 0 ? void 0 : _r.id, content.locale),
                        ];
            }
            if ((_v = (_u = (_t = (_s = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _s === void 0 ? void 0 : _s.attributes) === null || _t === void 0 ? void 0 : _t.blog_category) === null || _u === void 0 ? void 0 : _u.data) === null || _v === void 0 ? void 0 : _v.id) {
                strapiData.blog_category =
                    content.locale === ((_x = (_w = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _w === void 0 ? void 0 : _w.attributes) === null || _x === void 0 ? void 0 : _x.locale)
                        ? [(_1 = (_0 = (_z = (_y = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _y === void 0 ? void 0 : _y.attributes) === null || _z === void 0 ? void 0 : _z.blog_category) === null || _0 === void 0 ? void 0 : _0.data) === null || _1 === void 0 ? void 0 : _1.id]
                        : [
                            await this.getRelationContentsLocalizationId('blog-category', (_5 = (_4 = (_3 = (_2 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _2 === void 0 ? void 0 : _2.attributes) === null || _3 === void 0 ? void 0 : _3.blog_category) === null || _4 === void 0 ? void 0 : _4.data) === null || _5 === void 0 ? void 0 : _5.id, content.locale),
                        ];
            }
            if ((_8 = (_7 = (_6 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _6 === void 0 ? void 0 : _6.attributes) === null || _7 === void 0 ? void 0 : _7.deals_cta_lists) === null || _8 === void 0 ? void 0 : _8.data) {
                const ids = await Promise.all(getResponse.data.attributes.deals_cta_lists.data.map(async (deal) => {
                    var _a, _b;
                    return content.locale === ((_b = (_a = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.locale)
                        ? deal.id
                        : await this.getRelationContentsLocalizationId('deals-cta-list', deal.id, content.locale);
                }));
                strapiData.deals_cta_lists = ids;
            }
            if ((_12 = (_11 = (_10 = (_9 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _9 === void 0 ? void 0 : _9.attributes) === null || _10 === void 0 ? void 0 : _10.feature_image) === null || _11 === void 0 ? void 0 : _11.data) === null || _12 === void 0 ? void 0 : _12.attributes) {
                strapiData.feature_image =
                    (_16 = (_15 = (_14 = (_13 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _13 === void 0 ? void 0 : _13.attributes) === null || _14 === void 0 ? void 0 : _14.feature_image) === null || _15 === void 0 ? void 0 : _15.data) === null || _16 === void 0 ? void 0 : _16.attributes;
                strapiData.feature_image.id =
                    (_20 = (_19 = (_18 = (_17 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _17 === void 0 ? void 0 : _17.attributes) === null || _18 === void 0 ? void 0 : _18.feature_image) === null || _19 === void 0 ? void 0 : _19.data) === null || _20 === void 0 ? void 0 : _20.id;
                (_21 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.feature_image) === null || _21 === void 0 ? true : delete _21.related;
            }
        }
        if (contentType === 'author') {
            strapiData.email = (_23 = (_22 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _22 === void 0 ? void 0 : _22.attributes.email) !== null && _23 !== void 0 ? _23 : '-';
        }
        const randomNumber = Math.floor(Math.random() * 10000);
        strapiData.slug += `-${content.locale}-${randomNumber}`;
        strapiData.locale = content.locale;
        strapiData.publishedAt = new Date().toISOString();
        const contentFields = translatableContent_interface_1.fieldMappings[contentType] || [];
        for (const field of contentFields) {
            const fieldData = (_24 = content.fields.find((f) => f.fieldName === field)) === null || _24 === void 0 ? void 0 : _24.output;
            if (field === 'faq' && fieldData && fieldData.text) {
                strapiData[field] = fieldData.text.map((item) => ({
                    question: item.question,
                    answer: item.answer,
                }));
            }
            else if (field === 'pros_and_cons' && fieldData) {
                const prosAndConsData = Array.isArray(fieldData)
                    ? fieldData
                    : [fieldData];
                strapiData[field] = prosAndConsData.reduce((acc, item) => {
                    const { pros, cons } = item;
                    return {
                        pros: [
                            ...acc.pros,
                            ...pros.map(({ text, link }) => ({ text, link })),
                        ],
                        cons: [
                            ...acc.cons,
                            ...cons.map(({ text, link }) => ({ text, link })),
                        ],
                    };
                }, { pros: [], cons: [] });
            }
            else if (fieldData !== undefined) {
                strapiData[field] = fieldData;
            }
        }
        if (contentType === 'blog') {
            if ((_28 = (_27 = (_26 = (_25 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _25 === void 0 ? void 0 : _25.attributes) === null || _26 === void 0 ? void 0 : _26.single_review_cta) === null || _27 === void 0 ? void 0 : _27.logo) === null || _28 === void 0 ? void 0 : _28.data) {
                strapiData.single_review_cta.logo.id =
                    (_32 = (_31 = (_30 = (_29 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _29 === void 0 ? void 0 : _29.attributes) === null || _30 === void 0 ? void 0 : _30.single_review_cta.logo) === null || _31 === void 0 ? void 0 : _31.data) === null || _32 === void 0 ? void 0 : _32.id;
            }
            if ((_36 = (_35 = (_34 = (_33 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _33 === void 0 ? void 0 : _33.attributes) === null || _34 === void 0 ? void 0 : _34.compare_review) === null || _35 === void 0 ? void 0 : _35.company_one_logo) === null || _36 === void 0 ? void 0 : _36.data) {
                strapiData.compare_review.company_one_logo.id =
                    (_41 = (_40 = (_39 = (_38 = (_37 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _37 === void 0 ? void 0 : _37.attributes) === null || _38 === void 0 ? void 0 : _38.compare_review) === null || _39 === void 0 ? void 0 : _39.company_one_logo) === null || _40 === void 0 ? void 0 : _40.data) === null || _41 === void 0 ? void 0 : _41.id;
            }
            if ((_45 = (_44 = (_43 = (_42 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _42 === void 0 ? void 0 : _42.attributes) === null || _43 === void 0 ? void 0 : _43.compare_review) === null || _44 === void 0 ? void 0 : _44.company_two_logo) === null || _45 === void 0 ? void 0 : _45.data) {
                strapiData.compare_review.company_two_logo.id =
                    (_50 = (_49 = (_48 = (_47 = (_46 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _46 === void 0 ? void 0 : _46.attributes) === null || _47 === void 0 ? void 0 : _47.compare_review) === null || _48 === void 0 ? void 0 : _48.company_two_logo) === null || _49 === void 0 ? void 0 : _49.data) === null || _50 === void 0 ? void 0 : _50.id;
            }
        }
        if (contentType === 'blog-category') {
            strapiData.name += `-${content.locale}`;
        }
        if (contentType === 'deals-cta-list') {
            strapiData.url = (_52 = (_51 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _51 === void 0 ? void 0 : _51.attributes) === null || _52 === void 0 ? void 0 : _52.url;
            strapiData.name = (_54 = (_53 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _53 === void 0 ? void 0 : _53.attributes) === null || _54 === void 0 ? void 0 : _54.name;
            if ((_58 = (_57 = (_56 = (_55 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _55 === void 0 ? void 0 : _55.attributes) === null || _56 === void 0 ? void 0 : _56.cta_banner) === null || _57 === void 0 ? void 0 : _57.data) === null || _58 === void 0 ? void 0 : _58.attributes) {
                strapiData.cta_banner =
                    (_62 = (_61 = (_60 = (_59 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _59 === void 0 ? void 0 : _59.attributes) === null || _60 === void 0 ? void 0 : _60.cta_banner) === null || _61 === void 0 ? void 0 : _61.data) === null || _62 === void 0 ? void 0 : _62.attributes;
                strapiData.cta_banner.id =
                    (_66 = (_65 = (_64 = (_63 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _63 === void 0 ? void 0 : _63.attributes) === null || _64 === void 0 ? void 0 : _64.cta_banner) === null || _65 === void 0 ? void 0 : _65.data) === null || _66 === void 0 ? void 0 : _66.id;
                (_67 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.cta_banner) === null || _67 === void 0 ? true : delete _67.related;
            }
        }
        if (contentType === 'author') {
            strapiData.username += `-${content.locale}`;
            if ((_71 = (_70 = (_69 = (_68 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _68 === void 0 ? void 0 : _68.attributes) === null || _69 === void 0 ? void 0 : _69.display_picture) === null || _70 === void 0 ? void 0 : _70.data) === null || _71 === void 0 ? void 0 : _71.attributes) {
                strapiData.display_picture =
                    (_75 = (_74 = (_73 = (_72 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _72 === void 0 ? void 0 : _72.attributes) === null || _73 === void 0 ? void 0 : _73.display_picture) === null || _74 === void 0 ? void 0 : _74.data) === null || _75 === void 0 ? void 0 : _75.attributes;
                strapiData.display_picture.id =
                    (_79 = (_78 = (_77 = (_76 = getResponse === null || getResponse === void 0 ? void 0 : getResponse.data) === null || _76 === void 0 ? void 0 : _76.attributes) === null || _77 === void 0 ? void 0 : _77.display_picture) === null || _78 === void 0 ? void 0 : _78.data) === null || _79 === void 0 ? void 0 : _79.id;
                (_80 = strapiData === null || strapiData === void 0 ? void 0 : strapiData.display_picture) === null || _80 === void 0 ? true : delete _80.related;
            }
        }
        return strapiData;
    }
    async getRelationContentsLocalizationId(contentType, contentId, locale) {
        var _a, _b, _c;
        try {
            let getRequest = this.httpService
                .get(`${this.configService.get('STRAPI_URL')}/${this.pluralizeHyphenatedWord(contentType)}/${contentId}?populate[faq][populate]=*&populate[pros_and_cons][populate]=*&populate[seo][populate]=*&populate[feature_image][populate]=*&populate[author][populate]=*&populate[blog_category][populate]=*&populate[single_review_cta][populate]=*&populate[compare_review][populate]=*&populate[cbc_section][populate]=*&populate[deals_cta_lists][populate]=*&populate[localizations][populate]=*&populate[display_picture][populate]=*&populate[newsletters][populate]=*&populate[blogs][populate]=*&populate[graduate_from][populate]=*&populate[website_url][populate]=*&populate[cta_banner][populate]=*`)
                .pipe((0, rxjs_1.map)((res) => res.data), (0, rxjs_1.catchError)((error) => {
                throw new Error('Strapi API not available' + error);
            }));
            let getResponse;
            try {
                getResponse = await (0, rxjs_1.lastValueFrom)(getRequest);
            }
            catch (error) {
                console.error(`Error fetching detailed ${contentType} data from Strapi API`, error);
            }
            const localizations = (_c = (_b = (_a = getResponse.data) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.localizations) === null || _c === void 0 ? void 0 : _c.data;
            if (!localizations) {
                throw new Error('Localizations not found');
            }
            const existingLocalization = localizations.find((loc) => loc.attributes.locale === locale);
            if (!existingLocalization) {
                throw new Error(`Localization for locale ${locale} not found`);
            }
            return existingLocalization.id;
        }
        catch (error) {
            throw new Error('Strapi API not available: ' + error.message);
        }
    }
    async updateOrCreateTranslation(contentId, locale, status, content_type) {
        let getResponse;
        const configurations = {
            headers: {
                Authorization: `Bearer ${this.configService.get('STRAPI_API_TOKEN')}`,
            },
        };
        const strapiData = {
            "content_type": content_type,
            "blog": [contentId],
            "status": status,
            "locale": locale,
            "content_id": contentId,
        };
        const getRequest = this.httpService
            .get(`${this.configService.get('STRAPI_URL')}/translations?filters[content_id][$eq]=${contentId}&filters[locale][$eq]=${locale}&populate[blog][populate]=*`)
            .pipe((0, rxjs_1.map)((res) => res.data), (0, rxjs_1.catchError)((error) => {
            throw new Error('Strapi API not available: ' + error);
        }));
        try {
            getResponse = await (0, rxjs_1.lastValueFrom)(getRequest);
        }
        catch (error) {
            console.error(`Error fetching detailed translations data from Strapi API`, error);
            return { success: false, message: 'Error fetching existing localization', error };
        }
        if (getResponse.data && getResponse.data.length > 0) {
            const updateRequest = this.httpService
                .put(`${this.configService.get('STRAPI_URL')}/translations/${getResponse.data[0].id}`, { data: strapiData }, configurations)
                .pipe((0, rxjs_1.map)((res) => {
                return res.data;
            }));
            try {
                getResponse = await (0, rxjs_1.lastValueFrom)(updateRequest);
            }
            catch (error) {
                console.error('Error updating strapiData in Strapi API', error);
                return { success: false, message: 'Error updating translation', error };
            }
        }
        else {
            const createRequest = this.httpService
                .post(`${this.configService.get('STRAPI_URL')}/translations`, { data: strapiData }, configurations)
                .pipe((0, rxjs_1.map)((res) => {
                return res.data;
            }));
            try {
                getResponse = await (0, rxjs_1.lastValueFrom)(createRequest);
            }
            catch (error) {
                console.error('Error creating strapiData in Strapi API', error);
                return { success: false, message: 'Error creating translation', error };
            }
        }
        return { success: true, data: getResponse };
    }
};
TranslationCoordinatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [translationCoordinator_repository_1.TranslationCoordinatorRepository,
        config_1.ConfigService,
        axios_2.HttpService])
], TranslationCoordinatorService);
exports.TranslationCoordinatorService = TranslationCoordinatorService;
//# sourceMappingURL=translationCoordinator.service.js.map