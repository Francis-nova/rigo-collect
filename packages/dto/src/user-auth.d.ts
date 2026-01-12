export declare enum UserTypeDto {
    user = "user",
    admin = "admin"
}
export declare class UserSignupDto {
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
    businessType: string;
    userType: UserTypeDto;
}
export declare class VerifyEmailDto {
    email: string;
    code: string;
}
export declare class RequestPhoneOtpDto {
    email: string;
    phone: string;
}
export declare class VerifyPhoneDto {
    email: string;
    code: string;
}
export declare class UserResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    status: string;
    userType: string;
}
