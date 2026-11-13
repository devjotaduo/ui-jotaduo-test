import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('WhatsappConnectedDevice')
export class WhatsappConnectedDeviceDTO {
  @Field()
  name: string;

  @Field()
  jid: string;
}

@ObjectType('WhatsappConnectionStatus')
export class WhatsappConnectionStatusDTO {
  @Field()
  isConfigured: boolean;

  @Field()
  isConnected: boolean;

  @Field(() => [WhatsappConnectedDeviceDTO])
  devices: WhatsappConnectedDeviceDTO[];
}

@ObjectType('WhatsappLoginQrCode')
export class WhatsappLoginQrCodeDTO {
  @Field()
  qrCodeDataUrl: string;

  @Field(() => Int)
  expiresInSeconds: number;
}

@ObjectType('WhatsappPairingCode')
export class WhatsappPairingCodeDTO {
  @Field()
  pairingCode: string;

  @Field(() => Int)
  expiresInSeconds: number;
}

@ObjectType('WhatsappMessage')
export class WhatsappMessageDTO {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field()
  timestamp: string;

  @Field()
  isFromMe: boolean;

  @Field(() => String, { nullable: true })
  mediaType: string | null;
}

@ObjectType('WhatsappChat')
export class WhatsappChatDTO {
  @Field()
  jid: string;

  @Field()
  name: string;

  @Field()
  phoneNumber: string;

  @Field(() => String, { nullable: true })
  lastMessageAt: string | null;

  @Field(() => String, { nullable: true })
  lastMessageContent: string | null;

  @Field(() => String, { nullable: true })
  lastMessageMediaType: string | null;

  @Field()
  lastMessageIsFromMe: boolean;
}
