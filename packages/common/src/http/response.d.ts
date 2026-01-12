export interface ApiResponse<T = any> {
    status: boolean;
    message: string;
    data: T | null;
}
export declare function ok<T = any>(data: T, message?: string): ApiResponse<T>;
export declare function fail(message: string, data?: any): ApiResponse<any>;
