"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonFields = exports.fieldMappings = exports.Status = void 0;
var Status;
(function (Status) {
    Status["PENDING"] = "PENDING";
    Status["TRANSLATING"] = "TRANSLATING";
    Status["UPDATED"] = "UPDATED";
    Status["COMPLETED"] = "COMPLETED";
    Status["TRANSLATED"] = "TRANSLATED";
})(Status = exports.Status || (exports.Status = {}));
exports.fieldMappings = {
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
};
exports.commonFields = [
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
//# sourceMappingURL=translatableContent.interface.js.map