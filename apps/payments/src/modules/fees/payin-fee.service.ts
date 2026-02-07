import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PayinFeeConfig } from '../../entities/payin-fee-config.entity';

export interface PayinFeeRule {
  currencyCode: string;
  flatFee: number;
  percentFee: number;
  percentCap: number | null;
}

export interface PayinFeeComputation {
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  breakdown: {
    flatFee: number;
    percentComponent: number;
    percentCapApplied: number | null;
  };
  rule: PayinFeeRule;
}

const DEFAULT_RULE: PayinFeeRule = {
  currencyCode: 'NGN',
  flatFee: 100,
  percentFee: 1.4,
  percentCap: 2000,
};

@Injectable()
export class PayinFeeService {
  constructor(
    @InjectRepository(PayinFeeConfig)
    private readonly repo: Repository<PayinFeeConfig>,
  ) {}

  async getEffectiveRule(businessId: string | null, currencyCode = 'NGN'): Promise<PayinFeeRule> {
    if (businessId) {
      const override = await this.repo.findOne({ where: { businessId, currencyCode, isActive: true } });
      if (override) return this.toRule(override);
    }

    const fallback = await this.repo.findOne({ where: { businessId: IsNull(), currencyCode, isActive: true } });
    if (fallback) return this.toRule(fallback);

    // final fallback: baked-in defaults
    return { ...DEFAULT_RULE, currencyCode };
  }

  calculate(amount: number, rule: PayinFeeRule): PayinFeeComputation {
    const gross = this.round(amount);
    const percentComponent = rule.percentFee > 0 ? (gross * (rule.percentFee / 100)) : 0;
    const cappedPercent = rule.percentCap != null ? Math.min(percentComponent, rule.percentCap) : percentComponent;

    const fee = this.round(rule.flatFee + cappedPercent);
    const net = this.round(Math.max(gross - fee, 0));

    return {
      grossAmount: gross,
      feeAmount: fee,
      netAmount: net,
      breakdown: {
        flatFee: this.round(rule.flatFee),
        percentComponent: this.round(percentComponent),
        percentCapApplied: rule.percentCap != null ? rule.percentCap : null,
      },
      rule,
    };
  }

  describeRule(rule: PayinFeeRule) {
    return {
      currencyCode: rule.currencyCode,
      flatFee: this.round(rule.flatFee),
      percentFee: this.round(rule.percentFee),
      percentCap: rule.percentCap != null ? this.round(rule.percentCap) : null,
    };
  }

  private toRule(row: PayinFeeConfig): PayinFeeRule {
    return {
      currencyCode: row.currencyCode,
      flatFee: Number(row.flatFee) || 0,
      percentFee: Number(row.percentFee) || 0,
      percentCap: row.percentCap != null ? Number(row.percentCap) : null,
    };
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
