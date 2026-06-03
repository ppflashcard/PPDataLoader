import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSalesforceConnection,
  decodeSalesforceSession,
  getSalesforceErrorMessage,
  SALESFORCE_SESSION_COOKIE,
} from "@/lib/salesforce";

export const runtime = "nodejs";

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
        { error: "Select a Salesforce object to load related objects." },
        { status: 400 },
      );
    }

    const connection = createSalesforceConnection(session);
    const [sourceDescribe, globalDescribe] = await Promise.all([
      connection.sobject(objectApiName).describe(),
      connection.describeGlobal(),
    ]);
    const createableObjects = new Map(
      globalDescribe.sobjects.map((object) => [object.name, object]),
    );
    const seenRelationships = new Set<string>();
    const relatedObjectCandidates =
      sourceDescribe.childRelationships
        ?.filter((relationship) => {
          const childObject = createableObjects.get(relationship.childSObject);
          const relationshipKey = `${relationship.childSObject}.${relationship.field}`;

          if (seenRelationships.has(relationshipKey)) {
            return false;
          }

          seenRelationships.add(relationshipKey);

          return (
            childObject?.createable &&
            relationship.field &&
            !relationship.deprecatedAndHidden
          );
        })
        .map((relationship) => ({
          childSObject: relationship.childSObject,
          field: relationship.field,
          relationshipName: relationship.relationshipName ?? "",
        })) ?? [];
    const relatedObjects = (
      await Promise.all(
        relatedObjectCandidates.map(async (relationship) => {
          const childObject = createableObjects.get(relationship.childSObject);
          const childDescribe = await connection
            .sobject(relationship.childSObject)
            .describe();
          const lookupField = childDescribe.fields.find(
            (field) => field.name === relationship.field,
          );

          if (!lookupField?.referenceTo?.includes(objectApiName)) {
            return null;
          }

          return {
            fieldApiName: relationship.field,
            fieldLabel: lookupField.label,
            label: childObject?.label ?? relationship.childSObject,
            name: relationship.childSObject,
            relationshipName: relationship.relationshipName,
          };
        }),
      )
    )
      .filter((object): object is NonNullable<typeof object> => Boolean(object))
      .sort((first, second) => first.label.localeCompare(second.label));

    return NextResponse.json({ relatedObjects });
  } catch (error) {
    return NextResponse.json(
      { error: getSalesforceErrorMessage(error) },
      { status: 500 },
    );
  }
}
