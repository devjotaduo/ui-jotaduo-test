import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import {
  WhatsappChatDTO,
  WhatsappMessageDTO,
} from 'src/engine/core-modules/whatsapp-connection/dtos/whatsapp-connection.dto';
import { WhatsappConnectionService } from 'src/engine/core-modules/whatsapp-connection/services/whatsapp-connection.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';

const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 200;
const DEFAULT_CHAT_LIMIT = 20;
const MAX_CHAT_LIMIT = 50;

// Any signed-in member can talk to customers; linking or unlinking the number stays with workspace admins
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
    requiredPermissionFlags: [],
  }),
)
export class WhatsappConversationResolver {
  constructor(
    private readonly whatsappConnectionService: WhatsappConnectionService,
  ) {}

  @Query(() => [WhatsappChatDTO])
  async whatsappChats(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    this.whatsappConnectionService.assertWorkspaceCanUseWhatsapp(workspace.id);

    return this.whatsappConnectionService.getChats(
      Math.min(Math.max(limit ?? DEFAULT_CHAT_LIMIT, 1), MAX_CHAT_LIMIT),
    );
  }

  @Query(() => [WhatsappMessageDTO])
  async whatsappMessages(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('phoneNumber') phoneNumber: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    this.whatsappConnectionService.assertWorkspaceCanUseWhatsapp(workspace.id);

    return this.whatsappConnectionService.getMessages(
      phoneNumber,
      Math.min(Math.max(limit ?? DEFAULT_MESSAGE_LIMIT, 1), MAX_MESSAGE_LIMIT),
    );
  }

  @Mutation(() => Boolean)
  async sendWhatsappMessage(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('phoneNumber') phoneNumber: string,
    @Args('message') message: string,
  ) {
    this.whatsappConnectionService.assertWorkspaceCanUseWhatsapp(workspace.id);

    return this.whatsappConnectionService.sendMessage(phoneNumber, message);
  }
}
