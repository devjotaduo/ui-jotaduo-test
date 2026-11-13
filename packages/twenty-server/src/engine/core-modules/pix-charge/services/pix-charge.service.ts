import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type PixChargeDTO } from 'src/engine/core-modules/pix-charge/dtos/pix-charge.dto';
import { buildPixBrCode } from 'src/engine/core-modules/pix-charge/utils/build-pix-br-code.util';

@Injectable()
export class PixChargeService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getCharge({
    amount,
    txid,
    description,
  }: {
    amount: number;
    txid?: string;
    description?: string;
  }): PixChargeDTO {
    const pixKey = this.twentyConfigService.get('PIX_KEY');
    const merchantName = this.twentyConfigService.get('PIX_MERCHANT_NAME');
    const merchantCity = this.twentyConfigService.get('PIX_MERCHANT_CITY');

    if (
      !isNonEmptyString(pixKey) ||
      !isNonEmptyString(merchantName) ||
      !isNonEmptyString(merchantCity)
    ) {
      return { isConfigured: false, brCode: null, merchantName: null };
    }

    return {
      isConfigured: true,
      merchantName,
      brCode: buildPixBrCode({
        pixKey,
        merchantName,
        merchantCity,
        amount,
        txid,
        description,
      }),
    };
  }
}
