import { Connection } from "jsforce";

export const SALESFORCE_SESSION_COOKIE = "salesforce_session";

export type SalesforceSession = {
  accessToken: string;
  instanceUrl: string;
  loginUrl: string;
  userId?: string;
  organizationId?: string;
  username: string;
};

export function createSalesforceConnection(session?: Partial<SalesforceSession>) {
  return new Connection({
    accessToken: session?.accessToken,
    instanceUrl: session?.instanceUrl,
    loginUrl: session?.loginUrl ?? "https://login.salesforce.com",
  });
}

export function encodeSalesforceSession(session: SalesforceSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeSalesforceSession(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as SalesforceSession;
  } catch {
    return null;
  }
}

export function getSalesforceErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong while connecting to Salesforce.";
}
