"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = exports.ConfigModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
Object.defineProperty(exports, "ConfigService", { enumerable: true, get: function () { return config_1.ConfigService; } });
const loadEnv = () => ({
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    BANKING_PROVIDER: process.env.BANKING_PROVIDER || 'mock',
    SMTP_HOST: process.env.SMTP_HOST || '127.0.0.1',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '1025', 10),
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    MAIL_FROM: process.env.MAIL_FROM || 'no-reply@rigo-collect.com'
});
let ConfigModule = class ConfigModule {
};
exports.ConfigModule = ConfigModule;
exports.ConfigModule = ConfigModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot({ isGlobal: true, load: [loadEnv] })],
        providers: [],
        exports: [config_1.ConfigModule]
    })
], ConfigModule);
//# sourceMappingURL=index.js.map