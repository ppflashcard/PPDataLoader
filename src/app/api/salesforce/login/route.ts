import { NextResponse } from "next/server";
import {
  createSalesforceConnection,
  encodeSalesforceSession,
  getSalesforceErrorMessage,
  SALESFORCE_SESSION_COOKIE,
} from "@/lib/salesforce";

export const runtime = "nodejs";

type LoginRequest = {
  username?: string;
  password?: string;
  environment?: "production" | "sandbox";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequest;
    const username = body.username?.trim();
    const password = body.password;
    const loginUrl =
      body.environment === "sandbox"
        ? "https://test.salesforce.com"
        : "https://login.salesforce.com";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Salesforce username and password are required." },
        { status: 400 },
      );
    }

    const connection = createSalesforceConnection({ loginUrl });
    const userInfo = await connection.login(username, password);

    if (!connection.accessToken || !connection.instanceUrl) {
      return NextResponse.json(
        { error: "Salesforce did not return a valid session." },
        { status: 502 },
      );
    }

    const response = NextResponse.json({
      redirectTo: "/objects",
      success: true,
    });

    response.cookies.set(
      SALESFORCE_SESSION_COOKIE,
      encodeSalesforceSession({
        accessToken: connection.accessToken,
        instanceUrl: connection.instanceUrl,
        loginUrl,
        organizationId: userInfo.organizationId,
        userId: userInfo.id,
        username,
      }),
      {
        httpOnly: true,
        maxAge: 60 * 60,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: getSalesforceErrorMessage(error) },
      { status: 401 },
    );
  }
}
