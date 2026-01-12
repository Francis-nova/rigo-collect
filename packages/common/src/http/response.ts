export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T | null;
}

export function ok<T = any>(data: T, message = 'success'): ApiResponse<T> {
  return { status: true, message, data };
}

export function fail(message: string, data: any = null): ApiResponse<any> {
  return { status: false, message, data };
}
