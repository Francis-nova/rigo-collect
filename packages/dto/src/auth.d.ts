export declare class signinDto {
    email: string;
    password: string;
}
export declare class signupDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    businessName: string;
}
export declare class otpDto {
    otp: string;
}
export declare class RefreshDto {
    refreshToken: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class ForgotPasswordInitDto {
    email: string;
}
export declare class ForgotPasswordCompleteDto {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class UserSigninResponseDto {
    token: string;
    refreshToken: string;
}
export declare class MerchantOnboardDto {
    businessName: string;
}
export declare class ApiKeyVerifyRequestDto {
    apiKey: string;
}
export declare class ApiKeyVerifyResponseDto {
    valid: boolean;
    merchantId?: string;
}
export declare enum IBusinessTypes {
    SOLE_PROPRIETORSHIP = "SOLE_PROPRIETORSHIP",
    PARTNERSHIP = "PARTNERSHIP",
    CORPORATION = "CORPORATION",
    LLC = "LLC",
    NON_PROFIT = "NON_PROFIT",
    COOPERATIVE = "COOPERATIVE",
    FRANCHISE = "FRANCHISE",
    OTHER = "OTHER"
}
export declare class SwitchBusinessDto {
    businessId: string;
}
