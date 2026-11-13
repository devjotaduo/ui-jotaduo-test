import { Module } from '@nestjs/common';

import { WhatsappConnectionResolver } from 'src/engine/core-modules/whatsapp-connection/resolvers/whatsapp-connection.resolver';
import { WhatsappConversationResolver } from 'src/engine/core-modules/whatsapp-connection/resolvers/whatsapp-conversation.resolver';
import { WhatsappConnectionService } from 'src/engine/core-modules/whatsapp-connection/services/whatsapp-connection.service';

@Module({
  providers: [
    WhatsappConnectionService,
    WhatsappConnectionResolver,
    WhatsappConversationResolver,
  ],
})
export class WhatsappConnectionModule {}
