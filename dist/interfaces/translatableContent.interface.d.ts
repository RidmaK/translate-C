export interface TranslatableContentFields {
    fieldName: string;
    text: any;
    output: any;
    status: Status;
}
export declare enum Status {
    PENDING = "PENDING",
    TRANSLATING = "TRANSLATING",
    UPDATED = "UPDATED",
    COMPLETED = "COMPLETED",
    TRANSLATED = "TRANSLATED"
}
export interface FieldMappings {
    [contentType: string]: string[];
}
export declare const fieldMappings: FieldMappings;
export declare const commonFields: string[];
