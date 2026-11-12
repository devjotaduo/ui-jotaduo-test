import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import {
  WhatsappConnectionStatusDTO,
  WhatsappLoginQrCodeDTO,
  WhatsappPairingCodeDTO,
} from 'src/engine/core-modules/whatsapp-connection/dtos/whatsapp-connection.dto';
import { WhatsappConnectionService } from 'src/engine/core-modules/whatsapp-connection/services/whatsapp-connection.service';
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
        impersonated: false,
        playground: false,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    },
    requiredPermissionFlags: [PermissionFlagType.WORKSPACE],
  }),
)
export class WhatsappConnectionResolver {
  constructor(
    private readonly whatsappConnectionService: WhatsappConnectionService,
  ) {}

  @Query(() => WhatsappConnectionStatusDTO)
  async whatsappConnectionStatus(
    @Args('deviceId', { nullable: true }) deviceId?: string,
  ) {
    return this.whatsappConnectionService.getStatus(deviceId);
  }

  @Mutation(() => WhatsappLoginQrCodeDTO)
  async generateWhatsappLoginQrCode(
    @Args('deviceId', { nullable: true }) deviceId?: string,
  ) {
    return this.whatsappConnectionService.getLoginQrCode(deviceId);
  }

  @Mutation(() => WhatsappPairingCodeDTO)
  async generateWhatsappPairingCode(
    @Args('phoneNumber') phoneNumber: string,
    @Args('deviceId', { nullable: true }) deviceId?: string,
  ) {
    return this.whatsappConnectionService.getPairingCode(phoneNumber, deviceId);
  }

  @Mutation(() => Boolean)
  async disconnectWhatsapp(
    @Args('deviceId', { nullable: true }) deviceId?: string,
  ) {
    return this.whatsappConnectionService.logout(deviceId);
  }
}
