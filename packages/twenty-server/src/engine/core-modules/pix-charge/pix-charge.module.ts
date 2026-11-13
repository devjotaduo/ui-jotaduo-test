import { Module } from '@nestjs/common';

import { PixChargeResolver } from 'src/engine/core-modules/pix-charge/resolvers/pix-charge.resolver';
import { PixChargeService } from 'src/engine/core-modules/pix-charge/services/pix-charge.service';

@Module({
  providers: [PixChargeService, PixChargeResolver],
})
export class PixChargeModule {}
