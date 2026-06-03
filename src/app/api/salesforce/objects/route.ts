import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSalesforceConnection,
  decodeSalesforceSession,
  getSalesforceErrorMessage,
  SALESFORCE_SESSION_COOKIE,
} from "@/lib/salesforce";

export const runtime = "nodejs";

export async function GET() {
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

    const connection = createSalesforceConnection(session);
    const describe = await connection.describeGlobal();
    const objects = describe.sobjects
      .filter((object) => object.createable)
      .map((object) => ({
        custom: object.custom,
        label: object.label,
        name: object.name,
      }))
      .sort((first, second) => first.label.localeCompare(second.label));

    return NextResponse.json({ objects, username: session.username });
  } catch (error) {
    return NextResponse.json(
      { error: getSalesforceErrorMessage(error) },
      { status: 500 },
    );
  }
}
