export interface TranslatableContentFields {
  fieldName: string;
  text: any;
  output: any;
  status: Status;
}

export enum Status {
  PENDING = 'PENDING',
  TRANSLATING = 'TRANSLATING',
  UPDATED = 'UPDATED',
  COMPLETED = 'COMPLETED',
  TRANSLATED = 'TRANSLATED',
}

export interface FieldMappings {
  [contentType: string]: string[];
}

export const fieldMappings: FieldMappings = {
  blog: [
    'title',
    'content',
    'editors_note',
    'content_summary',
    'faq',
    'pros_and_cons',
    'compare_review',
    'seo',
    'cbc_section',
    'single_review_cta',
  ],
  newsletter: ['title', 'content', 'seo'],
  author: [
    'username',
    'first_name',
    'last_name',
    'bio',
    'knows_about',
    'full_bio:',
    'seo',
  ],
  'blog-category': ['name', 'description', 'seo'],
  'deals-cta-list': ['url'],
  // Add more content types and their respective fields as needed
};

export const commonFields = [
  'slug',
  'views',
  'livePublishedDate',
  'related_articles',
  'author',
  'deals_cta_lists',
  'is_single_review',
  'show_pros_and_cons',
  'is_compare_review',
  'is_editors_pick',
  'cbc_section_visibility',
  'blog_category',
  'feature_image',
];
