import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('PixCharge')
export class PixChargeDTO {
  @Field()
  isConfigured: boolean;

  @Field(() => String, { nullable: true })
  brCode: string | null;

  @Field(() => String, { nullable: true })
  merchantName: string | null;
}
