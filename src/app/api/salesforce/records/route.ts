import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSalesforceConnection,
  decodeSalesforceSession,
  getSalesforceErrorMessage,
  SALESFORCE_SESSION_COOKIE,
} from "@/lib/salesforce";

export const runtime = "nodejs";

type CreateRecordRequest = {
  objectApiName?: string;
  fields?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export async function POST(request: Request) {
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

    const body = (await request.json()) as CreateRecordRequest;
    const objectApiName = body.objectApiName?.trim();

    if (!objectApiName) {
      return NextResponse.json(
        { error: "Select a Salesforce object before creating a record." },
        { status: 400 },
      );
    }

    const records = Array.isArray(body.fields) ? body.fields : [body.fields];

    if (
      !records.length ||
      records.some(
        (record) =>
          !record || typeof record !== "object" || Array.isArray(record),
      )
    ) {
      return NextResponse.json(
        { error: "Record fields must be a JSON object or array of objects." },
        { status: 400 },
      );
    }

    const connection = createSalesforceConnection(session);
    const result = await connection.sobject(objectApiName).create(records);
    const results = Array.isArray(result) ? result : [result];
    const failures = results.filter((recordResult) => !recordResult.success);

    if (failures.length) {
      return NextResponse.json(
        {
          error:
            failures
              .flatMap((failure) => failure.errors ?? [])
              .map((salesforceError) => salesforceError.message)
              .join(" ") ||
            "Salesforce did not create the record.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      count: results.length,
      ids: results.map((recordResult) => recordResult.id),
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getSalesforceErrorMessage(error) },
      { status: 500 },
    );
  }
}
