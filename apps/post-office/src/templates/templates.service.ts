import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { basename, join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { promises as fsp } from 'fs';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);
  private readonly templatesDir = __dirname;
  private readonly partialsDir = join(this.templatesDir, 'partials');
  private readonly cache = new Map<string, Handlebars.TemplateDelegate>();

  constructor() {
    this.registerPartials();
  }

  private registerPartials() {
    if (!existsSync(this.partialsDir)) {
      this.logger.warn(`Partials directory not found: ${this.partialsDir}`);
      return;
    }

    const files = readdirSync(this.partialsDir).filter((file) => file.endsWith('.hbs'));
    files.forEach((file) => {
      try {
        const source = readFileSync(join(this.partialsDir, file), 'utf8');
        const name = basename(file, '.hbs');
        Handlebars.registerPartial(name, source);
      } catch (error: any) {
        this.logger.error(`Failed to register partial ${file}: ${error?.message ?? error}`);
      }
    });
  }

  async render(templateName: string, context: Record<string, any>) {
    const template = await this.getTemplate(templateName);
    return template(context);
  }

  private async getTemplate(templateName: string) {
    if (this.cache.has(templateName)) {
      return this.cache.get(templateName)!;
    }

    const templatePath = join(this.templatesDir, `${templateName}.hbs`);
    if (!existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const source = await fsp.readFile(templatePath, 'utf8');
    const compiled = Handlebars.compile(source);
    this.cache.set(templateName, compiled);
    return compiled;
  }
}
