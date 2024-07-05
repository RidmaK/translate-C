import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { TranslationCoordinatorRepository } from 'src/repository/translationCoordinator.repository';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as address from 'address';
import { TranslatableContentDocument } from 'src/schemas/translatableContent.schema';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import * as pluralize from 'pluralize';

import { catchError, lastValueFrom, map, Observable } from 'rxjs';
import { date } from 'joi';
import {
  Status,
  fieldMappings,
  commonFields,
} from 'src/interfaces/translatableContent.interface';

const ip = address.ip();
@Injectable()
export class TranslationCoordinatorService {
  private readonly logger = new Logger(
    `${ip} src/translationCoordinator/translationCoordinator.service.ts`,
  );
  constructor(
    private translationCoordinatorRepository: TranslationCoordinatorRepository,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async transformData(comingData: any, locale: any, contentType: string) {
    try {
      const fields: {
        fieldName: string;
        text: any;
        output: string;
        status: string;
      }[] = [];

      const addField = (fieldName: string, text: any) => {
        if (text !== undefined && text !== null && text !== '') {
          fields.push({
            fieldName: fieldName,
            text: text,
            output: '',
            status: 'PENDING',
          });
        }
      };

      const getFieldValue = (data: any, path: string) => {
        return path.split('.').reduce((obj, key) => obj?.[key], data);
      };

      const mappings = fieldMappings[contentType];
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
    } catch (error) {
      this.logger.error(
        `transform Data Error = ${error}, time=${new Date().getTime()}`,
      );
    }
  }

  async createOrUpdateTranslatableContent(entry: any, model: any) {
    try {
      if (entry.locale !== 'en') {
        return;
      }

      const locales = await axios.get(
        `${this.configService.get('STRAPI_URL')}/i18n/locales`,
      );

      locales.data.map(async (value: any) => {
        if (value.isDefault) {
          return;
        }
        const saveData = await this.transformData(entry, value.code, model);
        const updateOrCreateTranslation = (model === "blog" || model === "newsletter")  ? await this.updateOrCreateTranslation(entry.id, value.code,"PENDING",model ) : "";
        const existingContent =
          await this.translationCoordinatorRepository.checkContentIdExisting(
            entry.id,
            value.code,
          );

        if (!existingContent.length) {
          const newContent = this.translationCoordinatorRepository
            .createTranslatableContent(saveData)
            .then(() => {
              this.logger.log(
                `Create Translatable Content successful, time=${new Date().getTime()}`,
              );
            })
            .catch((error) => {
              this.logger.log(
                `Create Translatable Content Error = ${error},  time=${new Date().getTime()}`,
              );
            });

          return newContent;
        } else {
          const updatedContent = await this.translationCoordinatorRepository
            .updateTranslatableContent(saveData)
            .then(() => {
              this.logger.log(
                `Update Translatable Content successful, time=${new Date().getTime()}`,
              );
            })
            .catch((error) => {
              this.logger.error(
                `Update Translatable Content Error: ${error}, time=${new Date().getTime()}`,
              );
            });

          return updatedContent;
        }
      });
    } catch (err) {
      this.logger.error(
        `Create or Update Translatable Content Error: ${err}, time=${new Date().getTime()}`,
      );
      throw new Error(
        `Create or Update Translatable Content Error: ${err}, time=${new Date().getTime()}`,
      );
    }
  }

  async getAllTranslatableContent(): Promise<TranslatableContentDocument[]> {
    try {
      return await this.translationCoordinatorRepository.findAll();
    } catch (err) {
      this.logger.error(
        `findAll Translatable Content Error: ${err}, time=${new Date().getTime()}`,
      );
      throw new Error(
        `findAll Translatable Content Error: ${err}, time=${new Date().getTime()}`,
      );
    }
  }

  // ---------------------------------- CoRN FuncTioN ---------------------------------- //
  // @Cron(CronExpression.EVERY_MINUTE)
  async strapiTranslatedDataUpdate() {
    console.log('⌚ Run EVERY_MINUTE... strapiTranslatedDataUpdate');
    try {
      this.logger.log(
        `strapi Translated Data Update successful, time=${new Date(
          new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' }),
        ).toLocaleTimeString('en-US', { hour12: true })}`,
      );
    } catch (error) {
      this.logger.error(
        `strapi Translated Data Update Error: ${error}, time=${new Date().getTime()}`,
      );
      throw new Error(
        `strapi Translated Data Update Error: ${error}, time=${new Date().getTime()}`,
      );
    }
  }

  async callStrapiAndGetContent(id: string, model: string) {
    try {
      // request headers
      const configurations = {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            'STRAPI_API_TOKEN',
          )}`,
        },
      };

      let getRequest = this.httpService
        .get(
          `${this.configService.get<string>(
            'STRAPI_URL',
          )}/${this.pluralizeHyphenatedWord(
            model,
          )}/${id}?populate[faq][populate]=*&populate[pros_and_cons][populate]=*&populate[seo][populate]=*&populate[feature_image][populate]=*&populate[author][populate]=*&populate[blog_category][populate]=*&populate[single_review_cta][populate]=*&populate[compare_review][populate]=*&populate[cbc_section][populate]=*&populate[deals_cta_lists][populate]=*&populate[localizations][populate]=*&populate[display_picture][populate]=*&populate[newsletters][populate]=*&populate[blogs][populate]=*&populate[graduate_from][populate]=*&populate[website_url][populate]=*&populate[cta_banner][populate]=*`,
          configurations,
        )
        .pipe(map((res) => res.data))
        .pipe(
          catchError((error) => {
            this.logger.error(`Error in API call: ${error.message}`);
            throw new ForbiddenException('API not available');
          }),
        );

      const getResponse = await lastValueFrom(getRequest);

      if (getResponse) {
        const entry = getResponse?.data.attributes;
        entry.id = getResponse?.data?.id;
        return this.createOrUpdateTranslatableContent(entry, model);
      } else {
        this.logger.warn(
          `No response received for content ${this.pluralizeHyphenatedWord(
            model,
          )}  ID: ${id}`,
        );
        return;
      }
    } catch (error) {
      this.logger.error(
        `An error occurred in  Call Strapi And Get Content: ${error.message}`,
        error.stack,
      );
    }
  }

  pluralizeHyphenatedWord(hyphenatedWord: string): string {
    // Split the hyphenated word
    const words = hyphenatedWord.split('-');

    // Pluralize only the second word
    if (words.length === 2 && words.length > 1) {
      words[1] = pluralize.plural(words[1]);
    } else if (words.length === 3 && words.length > 2) {
      words[2] = pluralize.plural(words[2]);
    }

    // Rejoin the words with a hyphen
    const pluralizedWord = words.join('-');

    // Add 's' if the last character is not 's'
    if (!pluralizedWord.endsWith('s')) {
      return pluralizedWord + 's';
    }
    // console.log('first', pluralizedWord);
    return pluralizedWord;
  }

  async generateStrapiDataAndPost(): Promise<{
    success: string[];
    failed: string[];
  }> {
    // Fetch translated content data for the specified content type
    const translatedContent =
      await this.translationCoordinatorRepository.getAllFindByStatus(
        Status.TRANSLATED,
      );

    const success: string[] = [];
    const failed: string[] = [];

    // Loop through all translated content data
    for (const content of translatedContent) {
      // Fetch detailed content data from Strapi API
      let getRequest = this.httpService
        .get(
          `${this.configService.get<string>(
            'STRAPI_URL',
          )}/${this.pluralizeHyphenatedWord(content.contentType)}/${
            content.contentId
          }?populate[faq][populate]=*&populate[pros_and_cons][populate]=*&populate[seo][populate]=*&populate[feature_image][populate]=*&populate[author][populate]=*&populate[blog_category][populate]=*&populate[single_review_cta][populate]=*&populate[compare_review][populate]=*&populate[cbc_section][populate]=*&populate[deals_cta_lists][populate]=*&populate[localizations][populate]=*&populate[display_picture][populate]=*&populate[newsletters][populate]=*&populate[blogs][populate]=*&populate[graduate_from][populate]=*&populate[website_url][populate]=*&populate[cta_banner][populate]=*`,
        )
        .pipe(
          map((res) => res.data),
          catchError((error) => {
            throw new Error('Strapi API not available' + error);
          }),
        );

      let getResponse;
      try {
        getResponse = await lastValueFrom(getRequest);
      } catch (error) {
        console.error(
          `Error fetching detailed ${content.contentType} data from Strapi API`,
          error,
        );
        failed.push(content._id);
        continue;
      }

      // Extract localizations from getResponse
      const localizations = getResponse?.data?.attributes.localizations.data;
      const existingLocalization = localizations.find(
        (loc) => loc.attributes.locale === content.locale,
      );

      const configurations = {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>(
            'STRAPI_API_TOKEN',
          )}`,
        },
      };

      let postRequest;
      if (existingLocalization) {
        const strapiData = await this.buildStrapiData(
          content,
          { data: existingLocalization },
          content.contentType,
        );
        delete strapiData?.seo?.video_structured_data;
        delete strapiData?.seo?.id;

        if (strapiData?.faq && Array.isArray(strapiData?.faq)) {
          strapiData.faq.forEach((faq) => {
            delete faq.id;
          });
        }

        delete strapiData?.slug;
        delete strapiData?.compare_review?.id;
        // delete strapiData?.compare_review?.company_one_logo?.id;
        // delete strapiData?.compare_review?.company_two_logo?.id;
        delete strapiData?.single_review_cta?.id;
        // delete strapiData?.single_review_cta?.logo?.data.id;
        delete strapiData?.cbc_section?.id;
        delete strapiData?.cbc_section?.logo?.id;
        delete strapiData?.locale;

        if (content.contentType === 'author') {
          // Handle feature_image
          if (
            getResponse?.data?.attributes?.display_picture?.data?.attributes
          ) {
            strapiData.display_picture =
              getResponse?.data?.attributes?.display_picture?.data?.attributes;
            strapiData.display_picture.id =
              getResponse?.data?.attributes?.display_picture?.data?.id;
            delete strapiData?.display_picture?.related;
          }
          strapiData.website_url = getResponse?.data?.attributes?.website_url;
          strapiData.graduate_from =
            getResponse?.data?.attributes?.graduate_from;
          delete strapiData?.website_url?.id;
          delete strapiData?.graduate_from?.id;

          if (
            strapiData?.website_url &&
            Array.isArray(strapiData?.website_url)
          ) {
            strapiData?.website_url.forEach((url) => {
              delete url.id;
            });
          }
          if (
            strapiData?.graduate_from &&
            Array.isArray(strapiData?.graduate_from)
          ) {
            strapiData?.graduate_from.forEach((data) => {
              delete data.id;
            });
          }
        }

        if (content.contentType === 'blog') {
          // Handle feature_image
          if (getResponse?.data?.attributes.feature_image?.data?.attributes) {
            strapiData.feature_image =
              getResponse?.data?.attributes.feature_image.data.attributes;
            strapiData.feature_image.id =
              getResponse?.data?.attributes.feature_image.data.id;
            delete strapiData.feature_image.related;
          }

          //  SEO IMAGE AND CTA IMAGE SHOULD HANDLE HERE
          if (getResponse?.data?.attributes?.single_review_cta?.logo?.data) {
            strapiData.single_review_cta.logo.id =
              getResponse?.data?.attributes?.single_review_cta.logo?.data?.id;
          }

          // compare_review company_one_logo IMAGE SHOULD HANDLE HERE
          if (
            getResponse?.data?.attributes?.compare_review?.company_one_logo
              ?.data
          ) {
            strapiData.compare_review.company_one_logo.id =
              getResponse?.data?.attributes?.compare_review?.company_one_logo?.data?.id;
          }
          // compare_review company_two_logo IMAGE SHOULD HANDLE HERE
          if (
            getResponse?.data?.attributes?.compare_review?.company_two_logo
              ?.data
          ) {
            strapiData.compare_review.company_two_logo.id =
              getResponse?.data?.attributes?.compare_review?.company_two_logo?.data?.id;
          }
        }

        if (content.contentType === 'deals-cta-list') {
          // Handle cta_banner
          if (getResponse?.data?.attributes?.cta_banner?.data?.attributes) {
            strapiData.cta_banner =
              getResponse?.data?.attributes?.cta_banner?.data?.attributes;
            strapiData.cta_banner.id =
              getResponse?.data?.attributes?.cta_banner?.data?.id;
            delete strapiData?.cta_banner?.related;
          }
        }

        // Post the strapiData object
        console.log('strapiData 🍔🍔🍔🍔🍔🍔', strapiData);

        // Update existing localization
        postRequest = this.httpService
          .put(
            `${this.configService.get<string>(
              'STRAPI_URL',
            )}/${this.pluralizeHyphenatedWord(content.contentType)}/${
              existingLocalization.id
            }`,
            { data: strapiData },
            configurations,
          )
          .pipe(
            map((res) => {
              console.log('updated ✅✅✅✅✅✅:checkered_flag:');
              return res.data;
            }),
          );
      } else {
        const strapiData = await this.buildStrapiData(
          content,
          getResponse,
          content.contentType,
        );

        delete strapiData?.seo?.video_structured_data;
        delete strapiData?.seo?.id;
        delete strapiData?.compare_review?.id;

        // delete strapiData?.compare_review?.company_one_logo?.id;
        // delete strapiData?.compare_review?.company_two_logo?.id;
        delete strapiData?.single_review_cta?.id;
        // delete strapiData?.single_review_cta?.logo?.id;
        delete strapiData?.cbc_section?.id;
        delete strapiData?.cbc_section?.logo?.id;

        if (content.contentType === 'author') {
          delete strapiData?.website_url?.id;
          delete strapiData?.graduate_from?.id;

          if (
            strapiData?.website_url &&
            Array.isArray(strapiData?.website_url)
          ) {
            strapiData?.website_url.forEach((url) => {
              delete url.id;
            });
          }
          if (
            strapiData?.graduate_from &&
            Array.isArray(strapiData?.graduate_from)
          ) {
            strapiData?.graduate_from.forEach((data) => {
              delete data.id;
            });
          }
        }

        if (strapiData?.faq && Array.isArray(strapiData?.faq)) {
          strapiData?.faq.forEach((faq) => {
            delete faq?.id;
          });
        }

        // Post the strapiData object
        console.log('strapiData 🌲🌲🌲🌲🌲🌲🌲🌲', strapiData);
        postRequest = this.httpService
          .post(
            `${this.configService.get<string>(
              'STRAPI_URL',
            )}/${this.pluralizeHyphenatedWord(content.contentType)}/${
              content.contentId
            }/localizations`,
            strapiData,
            configurations,
          )
          .pipe(
            map((res) => {
              console.log('Created 🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁:checkered_flag:');
              return res.data;
            }),
          );
      }

      try {
        getResponse = await lastValueFrom(postRequest);
      } catch (error) {
        console.error('Error posting strapiData to Strapi API', error);
        failed.push(content._id);
        continue;
      }

      // Update MongoDB with COMPLETED status
      try {
        await this.translationCoordinatorRepository.updateTranslatableContentStatus(
          Status.COMPLETED,
          content._id,
        );
        const updateOrCreateTranslation = (content.contentType === "blog" || content.contentType === "newsletter")  ? await this.updateOrCreateTranslation(content.contentId, content.locale,Status.COMPLETED,content.contentType ) : "";

        console.log(
          'Updated MongoDB content status to COMPLETED for contentId:',
          content.contentId,
        );
        success.push(content._id);
      } catch (error) {
        console.error('Error updating MongoDB status to COMPLETED:', error);
        failed.push(content._id);
      }
    }

    return {
      success,
      failed,
    };
  }

  async buildStrapiData(
    content: any,
    getResponse: any,
    contentType: string,
  ): Promise<any> {
    // Return type is `Promise<any>`

    const strapiData: any = {};

    // Common fields fetched from getResponse
    for (const field of commonFields) {
      if (getResponse?.data?.attributes[field] !== undefined) {
        strapiData[field] = getResponse?.data?.attributes[field];
      }
    }

    if (contentType === 'blog') {
      strapiData.push_to_top = 1;
      strapiData.pushing_timestamp = new Date().toISOString();
      if (getResponse?.data?.attributes?.author?.data?.id) {
        strapiData.author =
          content.locale === getResponse?.data?.attributes?.locale
            ? [getResponse?.data?.attributes?.author?.data?.id]
            : [
                await this.getRelationContentsLocalizationId(
                  'author',
                  getResponse?.data?.attributes?.author?.data?.id,
                  content.locale,
                ),
              ];
      }

      if (getResponse?.data?.attributes?.blog_category?.data?.id) {
        strapiData.blog_category =
          content.locale === getResponse?.data?.attributes?.locale
            ? [getResponse?.data?.attributes?.blog_category?.data?.id]
            : [
                await this.getRelationContentsLocalizationId(
                  'blog-category',
                  getResponse?.data?.attributes?.blog_category?.data?.id,
                  content.locale,
                ),
              ];
      }
      if (getResponse?.data?.attributes?.deals_cta_lists?.data) {
        const ids = await Promise.all(
          getResponse.data.attributes.deals_cta_lists.data.map(async (deal) => {
            return content.locale === getResponse?.data?.attributes?.locale
              ? deal.id
              : await this.getRelationContentsLocalizationId(
                  'deals-cta-list',
                  deal.id,
                  content.locale,
                );
          }),
        );
        strapiData.deals_cta_lists = ids;
      }

      // Handle feature_image
      if (getResponse?.data?.attributes?.feature_image?.data?.attributes) {
        strapiData.feature_image =
          getResponse?.data?.attributes?.feature_image?.data?.attributes;
        strapiData.feature_image.id =
          getResponse?.data?.attributes?.feature_image?.data?.id;
        delete strapiData?.feature_image?.related;
      }
    }

    if (contentType === 'author') {
      strapiData.email = getResponse?.data?.attributes.email ?? '-';
    }

    // Generate a random number
    const randomNumber = Math.floor(Math.random() * 10000);

    strapiData.slug += `-${content.locale}-${randomNumber}`;
    strapiData.locale = content.locale;
    strapiData.publishedAt = new Date().toISOString();

    // Fields fetched from content.fields based on fieldMappings
    const contentFields = fieldMappings[contentType] || [];
    for (const field of contentFields) {
      const fieldData = content.fields.find(
        (f) => f.fieldName === field,
      )?.output;

      if (field === 'faq' && fieldData && fieldData.text) {
        strapiData[field] = fieldData.text.map((item: any) => ({
          question: item.question,
          answer: item.answer,
        }));
      } else if (field === 'pros_and_cons' && fieldData) {
        const prosAndConsData = Array.isArray(fieldData)
          ? fieldData
          : [fieldData];
        strapiData[field] = prosAndConsData.reduce(
          (acc: any, item: any) => {
            const { pros, cons } = item;
            return {
              pros: [
                ...acc.pros,
                ...pros.map(({ text, link }: any) => ({ text, link })),
              ],
              cons: [
                ...acc.cons,
                ...cons.map(({ text, link }: any) => ({ text, link })),
              ],
            };
          },
          { pros: [], cons: [] },
        );
      } else if (fieldData !== undefined) {
        // Only assign if fieldData is defined
        strapiData[field] = fieldData;
      }
    }

    if (contentType === 'blog') {
      //  SEO IMAGE AND CTA IMAGE SHOULD HANDLE HERE
      if (getResponse?.data?.attributes?.single_review_cta?.logo?.data) {
        strapiData.single_review_cta.logo.id =
          getResponse?.data?.attributes?.single_review_cta.logo?.data?.id;
      }
      // compare_review company_one_logo IMAGE SHOULD HANDLE HERE
      if (
        getResponse?.data?.attributes?.compare_review?.company_one_logo?.data
      ) {
        strapiData.compare_review.company_one_logo.id =
          getResponse?.data?.attributes?.compare_review?.company_one_logo?.data?.id;
      }
      // compare_review company_two_logo IMAGE SHOULD HANDLE HERE
      if (
        getResponse?.data?.attributes?.compare_review?.company_two_logo?.data
      ) {
        strapiData.compare_review.company_two_logo.id =
          getResponse?.data?.attributes?.compare_review?.company_two_logo?.data?.id;
      }
    }

    if (contentType === 'blog-category') {
      strapiData.name += `-${content.locale}`;
    }
    if (contentType === 'deals-cta-list') {
      strapiData.url = getResponse?.data?.attributes?.url;
      strapiData.name = getResponse?.data?.attributes?.name;
      // Handle cta_banner
      if (getResponse?.data?.attributes?.cta_banner?.data?.attributes) {
        strapiData.cta_banner =
          getResponse?.data?.attributes?.cta_banner?.data?.attributes;
        strapiData.cta_banner.id =
          getResponse?.data?.attributes?.cta_banner?.data?.id;
        delete strapiData?.cta_banner?.related;
      }
    }
    if (contentType === 'author') {
      strapiData.username += `-${content.locale}`;
      // Handle feature_image
      if (getResponse?.data?.attributes?.display_picture?.data?.attributes) {
        strapiData.display_picture =
          getResponse?.data?.attributes?.display_picture?.data?.attributes;
        strapiData.display_picture.id =
          getResponse?.data?.attributes?.display_picture?.data?.id;
        delete strapiData?.display_picture?.related;
      }
    }
    return strapiData; // Return the constructed `strapiData`
  }

  async getRelationContentsLocalizationId(
    contentType: string,
    contentId: string,
    locale: string,
  ): Promise<string> {
    try {
      let getRequest = this.httpService
        .get(
          `${this.configService.get<string>(
            'STRAPI_URL',
          )}/${this.pluralizeHyphenatedWord(
            contentType,
          )}/${contentId}?populate[faq][populate]=*&populate[pros_and_cons][populate]=*&populate[seo][populate]=*&populate[feature_image][populate]=*&populate[author][populate]=*&populate[blog_category][populate]=*&populate[single_review_cta][populate]=*&populate[compare_review][populate]=*&populate[cbc_section][populate]=*&populate[deals_cta_lists][populate]=*&populate[localizations][populate]=*&populate[display_picture][populate]=*&populate[newsletters][populate]=*&populate[blogs][populate]=*&populate[graduate_from][populate]=*&populate[website_url][populate]=*&populate[cta_banner][populate]=*`,
        )
        .pipe(
          map((res) => res.data),
          catchError((error) => {
            throw new Error('Strapi API not available' + error);
          }),
        );

      let getResponse;
      try {
        getResponse = await lastValueFrom(getRequest);
      } catch (error) {
        console.error(
          `Error fetching detailed ${contentType} data from Strapi API`,
          error,
        );
      }
      const localizations = getResponse.data?.attributes?.localizations?.data;
      if (!localizations) {
        throw new Error('Localizations not found');
      }
      const existingLocalization = localizations.find(
        (loc) => loc.attributes.locale === locale,
      );
      if (!existingLocalization) {
        throw new Error(`Localization for locale ${locale} not found`);
      }
      return existingLocalization.id;
    } catch (error) {
      throw new Error('Strapi API not available: ' + error.message);
    }
  }

  async updateOrCreateTranslation(contentId: string, locale: string, status: string, content_type: string) {

    let getResponse;
    const configurations = {
      headers: {
        Authorization: `Bearer ${this.configService.get<string>(
          'STRAPI_API_TOKEN',
        )}`,
      },
    };

    const strapiData = {
      "content_type": content_type,
      "blog": [contentId],
      "status" : status,
      "locale" : locale,
      "content_id" : contentId,
    }

    // Fetch existing localization
    const getRequest = this.httpService
      .get(
        `${this.configService.get<string>('STRAPI_URL')}/translations?filters[content_id][$eq]=${contentId}&filters[locale][$eq]=${locale}&populate[blog][populate]=*`,
      )
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          throw new Error('Strapi API not available: ' + error);
        }),
      );

    try {
      getResponse = await lastValueFrom(getRequest);
      
    } catch (error) {
      console.error(`Error fetching detailed translations data from Strapi API`, error);
      return { success: false, message: 'Error fetching existing localization', error };
    }

    if (getResponse.data && getResponse.data.length > 0)  {
      // Update existing localization
      const updateRequest = this.httpService
        .put(
          `${this.configService.get<string>('STRAPI_URL')}/translations/${getResponse.data[0].id}`,
          { data: strapiData },
          configurations,
        )
        .pipe(
          map((res) => {
            return res.data;
          }),
        );

      try {
        getResponse = await lastValueFrom(updateRequest);
      } catch (error) {
        console.error('Error updating strapiData in Strapi API', error);
        return { success: false, message: 'Error updating translation', error };
      }
    } else {
      // Create new localization
      const createRequest = this.httpService
        .post(
          `${this.configService.get<string>('STRAPI_URL')}/translations`,
          { data: strapiData },
          configurations,
        )
        .pipe(
          map((res) => {
            return res.data;
          }),
        );

      try {
        getResponse = await lastValueFrom(createRequest);
      } catch (error) {
        console.error('Error creating strapiData in Strapi API', error);
        return { success: false, message: 'Error creating translation', error };
      }
    }

    return { success: true, data: getResponse };
  }
}
