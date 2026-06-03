import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSalesforceConnection,
  decodeSalesforceSession,
  getSalesforceErrorMessage,
  SALESFORCE_SESSION_COOKIE,
} from "@/lib/salesforce";

export const runtime = "nodejs";

const supportedFieldTypes = new Set([
  "boolean",
  "currency",
  "date",
  "datetime",
  "double",
  "email",
  "int",
  "multipicklist",
  "percent",
  "phone",
  "picklist",
  "string",
  "textarea",
  "url",
]);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = decodeSalesforceSession(
      cookieStore.get(SALESFORCE_SESSION_COOKIE)?.value,
    );

    if (!session) {
      return NextResponse.json(
        { error: "Please login to Salesforce again." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const objectApiName = searchParams.get("objectApiName")?.trim();

    if (!objectApiName) {
      return NextResponse.json(
        { error: "Select a Salesforce object to load fields." },
        { status: 400 },
      );
    }

    const connection = createSalesforceConnection(session);
    const describe = await connection.sobject(objectApiName).describe();
    const recordTypes =
      describe.recordTypeInfos
        ?.filter((recordType) => recordType.available && !recordType.master)
        .map((recordType) => ({
          default: recordType.defaultRecordTypeMapping,
          label: recordType.name,
          value: recordType.recordTypeId,
        })) ?? [];
    const defaultRecordTypeId =
      recordTypes.find((recordType) => recordType.default)?.value ??
      recordTypes[0]?.value ??
      "";
    const fields = describe.fields
      .filter((field) => {
        return (
          field.createable &&
          !field.calculated &&
          !field.autoNumber &&
          supportedFieldTypes.has(field.type)
        );
      })
      .map((field) => ({
        apiName: field.name,
        dataType: field.type,
        label: field.label,
        picklistValues:
          field.picklistValues
            ?.filter((value) => value.active)
            .map((value) => ({
              label: value.label,
              value: value.value,
            })) ?? [],
        required: !field.nillable && !field.defaultedOnCreate,
      }))
      .sort((first, second) => {
        if (first.required !== second.required) {
          return first.required ? -1 : 1;
        }

        return first.label.localeCompare(second.label);
      });

    return NextResponse.json({
      defaultRecordTypeId,
      fields,
      objectLabel: describe.label,
      recordTypes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getSalesforceErrorMessage(error) },
      { status: 500 },
    );
  }
}
