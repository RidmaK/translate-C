declare const saveData: {
    id: number;
    fields: {
        filedName: string;
        text: string;
        output: string;
        status: string;
    }[];
    status: string;
    locale: string;
};
interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    search_rank: number | null;
}
interface SEO {
    id: number;
    seo_title: string;
    seo_description: string;
    seo_robots: string;
    canonical: string | null;
    og_type: string;
    twitter_card: string;
    keywords: string;
    seo_thumbnail: string | null;
    meta_social: any[];
    video_structured_data: any | null;
}
interface ComingData {
    id: number;
    title: string;
    content: string;
    editors_note: string;
    blog_category: BlogCategory;
    seo: SEO;
}
interface Field {
    filedName: string;
    text: string;
    output: string;
    status: string;
}
interface SaveData {
    id: number;
    fields: Field[];
    status: string;
    locale: string;
}
declare const transformData: (comingData: any) => SaveData;
declare const comingData: ComingData;
declare const savedData: SaveData;
declare const data: {
    id: number;
    title: string;
    content: string;
    slug: string;
    is_single_review: boolean;
    show_pros_and_cons: boolean;
    is_compare_review: boolean;
    is_editors_pick: boolean;
    views: number;
    cbc_section_visibility: boolean;
    livePublishedDate: string;
    editors_note: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    content_summary: string;
    push_to_top: number;
    pushing_timestamp: string;
    related_articles: string[];
    feature_image: {
        id: number;
        name: string;
        alternativeText: any;
        caption: any;
        width: number;
        height: number;
        formats: {
            large: ObjectConstructor[];
            small: ObjectConstructor[];
            medium: ObjectConstructor[];
            thumbnail: ObjectConstructor[];
        };
        hash: string;
        ext: string;
        mime: string;
        size: number;
        url: string;
        previewUrl: any;
        provider: string;
        provider_metadata: any;
        createdAt: string;
        updatedAt: string;
    };
    faq: {
        id: number;
        question: string;
        answer: string;
    }[];
    author: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        role: string;
        bio: string;
        slug: string;
        knows_about: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        locale: string;
        full_bio: any;
        email: string;
        residence: any;
        is_show_coinbureau_author_page: any;
    };
    blog_category: {
        id: number;
        name: string;
        slug: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        locale: string;
        search_rank: any;
    };
    single_review_cta: any;
    pros_and_cons: any;
    compare_review: any;
    seo: {
        id: number;
        seo_title: string;
        seo_description: string;
        seo_robots: string;
        canonical: any;
        og_type: string;
        twitter_card: string;
        keywords: string;
        seo_thumbnail: any;
        meta_social: any[];
        video_structured_data: any;
    };
    cbc_section: any;
    deals_cta_lists: {
        id: number;
        name: string;
        url: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        locale: string;
    }[];
    localizations: any[];
};
declare const comingStrapiData: {
    id: number;
    title: string;
    content: string;
    slug: string;
    is_single_review: boolean;
    show_pros_and_cons: boolean;
    is_compare_review: boolean;
    is_editors_pick: boolean;
    views: number;
    cbc_section_visibility: boolean;
    livePublishedDate: string;
    editors_note: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    content_summary: string;
    push_to_top: number;
    pushing_timestamp: any;
    related_articles: string[];
    feature_image: {
        id: number;
        name: string;
        alternativeText: string;
        caption: any;
        width: number;
        height: number;
        formats: {
            large: ObjectConstructor[];
            small: ObjectConstructor[];
            medium: ObjectConstructor[];
            thumbnail: ObjectConstructor[];
        };
        hash: string;
        ext: string;
        mime: string;
        size: number;
        url: string;
        previewUrl: any;
        provider: string;
        provider_metadata: any;
        createdAt: string;
        updatedAt: string;
    };
    faq: {
        question: string;
        answer: string;
    }[];
    author: {
        username: string;
        first_name: string;
        last_name: string;
        role: string;
        bio: string;
        slug: string;
        knows_about: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        locale: string;
        full_bio: any;
        email: any;
        residence: any;
        is_show_coinbureau_author_page: any;
    };
    blog_category: {
        name: string;
        slug: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        locale: string;
        search_rank: any;
    };
    single_review_cta: {
        name: string;
        rating: number;
        affiliate_link: string;
        summary: string;
        tagline: string;
        logo: {
            name: string;
            alternativeText: string;
            caption: string;
            width: number;
            height: number;
            formats: any;
            hash: string;
            ext: string;
            mime: string;
            size: number;
            url: string;
            previewUrl: any;
            provider: string;
            provider_metadata: any;
            createdAt: string;
            updatedAt: string;
        };
    };
    pros_and_cons: {
        pros: {
            text: string;
            link: any;
        }[];
        cons: {
            text: string;
            link: any;
        }[];
    };
    compare_review: any;
    seo: {
        seo_title: string;
        seo_description: string;
        seo_robots: string;
        canonical: any;
        og_type: string;
        twitter_card: string;
        keywords: string;
        seo_thumbnail: any;
        meta_social: any[];
        video_structured_data: {
            name: string;
            description: string;
            duration: string;
            is_family_friendly: boolean;
            in_language: string;
            video_id: string;
        };
    };
    cbc_section: any;
    deals_cta_lists: {
        id: number;
        name: string;
        url: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        locale: string;
    }[];
    localizations: any[];
};
declare const translatedContent: {
    contentId: string;
    fields: ({
        filedName: string;
        text: string;
        output: string;
        status: string;
    } | {
        filedName: string;
        text: ArrayConstructor[];
        output: {
            id: number;
            question: string;
            answer: string;
        }[];
        status: string;
    } | {
        filedName: string;
        text: ObjectConstructor[];
        output: {
            pros: {
                id: number;
                text: string;
                link: any;
            }[];
            cons: {
                id: number;
                text: string;
                link: any;
            }[];
        };
        status: string;
    } | {
        filedName: string;
        text: number;
        output: string;
        status: string;
    })[];
    status: string;
    locale: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
};
