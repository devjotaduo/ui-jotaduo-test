import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Float, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { PixChargeDTO } from 'src/engine/core-modules/pix-charge/dtos/pix-charge.dto';
import { PixChargeService } from 'src/engine/core-modules/pix-charge/services/pix-charge.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';

@MetadataResolver()
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [],
  }),
)
export class PixChargeResolver {
  constructor(private readonly pixChargeService: PixChargeService) {}

  @Query(() => PixChargeDTO)
  pixCharge(
    @Args('amount', { type: () => Float }) amount: number,
    @Args('txid', { nullable: true }) txid?: string,
    @Args('description', { nullable: true }) description?: string,
  ) {
    return this.pixChargeService.getCharge({ amount, txid, description });
  }
}
