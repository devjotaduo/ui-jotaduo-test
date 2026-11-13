import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const ADDED_WIDGET_TYPES = ['KPI_NUMBER', 'ACTION_BUTTONS', 'NEXT_ACTIONS'];

@RegisteredInstanceCommand('2.59.0', 1794547668846)
export class AddKpiActionButtonsNextActionsWidgetTypesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Appending a label is catalog-only; recreating the type would lock the instance-wide widget table
    for (const widgetType of ADDED_WIDGET_TYPES) {
      await queryRunner.query(
        `ALTER TYPE "core"."pageLayoutWidget_type_enum" ADD VALUE IF NOT EXISTS '${widgetType}'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "core"."pageLayoutWidget" WHERE "type"::text = ANY($1)`,
      [ADDED_WIDGET_TYPES],
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"pageLayoutWidget_type_enum_old\" AS ENUM('CALENDAR', 'CALL_RECORDING_SUMMARY', 'CALL_RECORDING_TRANSCRIPT', 'CHAT', 'CHAT_THREADS', 'EMAILS', 'EMAIL_THREAD', 'FIELD', 'FIELDS', 'FIELD_RICH_TEXT', 'FILES', 'FORM_FIELD', 'FRONT_COMPONENT', 'GRAPH', 'IFRAME', 'MESSAGE_CAMPAIGN_BODY', 'MESSAGE_CAMPAIGN_DETAILS', 'NOTES', 'OBJECT_LIST', 'PIX_CHARGE', 'RECORD_TABLE', 'STANDALONE_RICH_TEXT', 'TASKS', 'TIMELINE', 'VIEW', 'WORKFLOW', 'WORKFLOW_RUN', 'WHATSAPP_CONNECTION', 'WHATSAPP_CHATS', 'WHATSAPP_CONVERSATION', 'WORKFLOW_VERSION')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" TYPE "core"."pageLayoutWidget_type_enum_old" USING "type"::"text"::"core"."pageLayoutWidget_type_enum_old"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" SET DEFAULT \'VIEW\'',
    );
    await queryRunner.query('DROP TYPE "core"."pageLayoutWidget_type_enum"');
    await queryRunner.query(
      'ALTER TYPE "core"."pageLayoutWidget_type_enum_old" RENAME TO "pageLayoutWidget_type_enum"',
    );
  }
}
