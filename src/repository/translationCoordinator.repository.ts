import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from 'src/interfaces/translatableContent.interface';

import {
  TranslatableContent,
  TranslatableContentDocument,
} from 'src/schemas/translatableContent.schema';

@Injectable()
export class TranslationCoordinatorRepository {
  constructor(
    @InjectModel(TranslatableContent.name)
    private translatableContentModel: Model<TranslatableContentDocument>,
  ) {}

  async createTranslatableContent(entry: any) {
    const { title, id, field, locale } = entry;

    const createdTranslatableContent = new this.translatableContentModel(entry);
    return await createdTranslatableContent.save();
  }

  async findAll(): Promise<TranslatableContentDocument[]> {
    return this.translatableContentModel.find().exec();
  }

  async getAllFindByStatus(status: any): Promise<any[]> {
    return await this.translatableContentModel.find({ status: status }).exec();
  }
  async checkContentIdExisting(entryId: any, locale: any) {
    return this.translatableContentModel
      .find({ contentId: entryId, locale: locale })
      .exec();
  }

  async updateTranslatableContentStatus(status: Status, contentId: any) {
    return await this.translatableContentModel
      .updateOne({ _id: contentId }, { $set: { status: status } })
      .exec();
  }

  async updateTranslatableContent(entry: any) {
    console.log('entry.contentId', entry.contentId);

    return this.translatableContentModel.updateOne(
      {
        contentId: entry.contentId,
        locale: entry.locale,
      },
      entry,
    );
  }

  async updateTranslatedContentStatus(
    contentId: any,
    newStatus: any,
    locale: any,
  ): Promise<any> {
    return this.translatableContentModel
      .updateOne(
        {
          contentId,
          locale,
        },
        { $set: { status: newStatus } },
      )
      .exec();
  }
}
