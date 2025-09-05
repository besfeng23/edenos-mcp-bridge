export declare const auditRouter: any;
export declare function audit(evt: {
    type: string;
    actor?: string;
    meta?: any;
}): Promise<void>;
