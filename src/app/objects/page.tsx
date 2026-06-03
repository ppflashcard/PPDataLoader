"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SalesforceObject = {
  custom: boolean;
  label: string;
  name: string;
};

type SalesforceField = {
  apiName: string;
  dataType: string;
  disabled?: boolean;
  label: string;
  picklistValues: Array<{
    label: string;
    value: string;
  }>;
  required: boolean;
};

type FieldRow = SalesforceField & {
  value: string;
};

type SalesforceRecordType = {
  default: boolean;
  label: string;
  value: string;
};

type SampleCategory =
  | "agriculture"
  | "airline"
  | "commerce-cloud"
  | "data-cloud"
  | "education"
  | "experience-cloud"
  | "financial-services"
  | "health-cloud"
  | "insurance"
  | "manufacturing"
  | "marketing-cloud"
  | "media"
  | "medical"
  | "nonprofit"
  | "retail"
  | "sales-cloud"
  | "service-cloud"
  | "tech";

type SampleProfile = {
  category: SampleCategory;
  city: string;
  company: string;
  country: string;
  description: string;
  email: string;
  industry: string;
  phone: string;
  revenue: string;
  state: string;
  street: string;
  website: string;
};

const sampleProfiles: SampleProfile[] = [
  {
    category: "tech",
    city: "San Francisco",
    company: "CloudNova Technologies",
    country: "United States",
    description:
      "CloudNova builds AI and cloud software for enterprise customers and has revenue of 42 cr.",
    email: "hello@cloudnova.tech",
    industry: "Technology",
    phone: "+1 415 555 0198",
    revenue: "420000000",
    state: "California",
    street: "100 Market Street",
    website: "https://cloudnova.tech",
  },
  {
    category: "media",
    city: "Mumbai",
    company: "BrightWave Media",
    country: "India",
    description:
      "BrightWave Media manages digital campaigns, content channels, and brand studios with revenue of 18 cr.",
    email: "contact@brightwave.media",
    industry: "Media",
    phone: "+91 98765 43210",
    revenue: "180000000",
    state: "Maharashtra",
    street: "22 Film City Road",
    website: "https://brightwave.media",
  },
  {
    category: "financial-services",
    city: "New York",
    company: "FinTrust Capital",
    country: "United States",
    description:
      "FinTrust Capital provides banking, wealth, and lending services with revenue of 75 cr.",
    email: "support@fintrustcapital.com",
    industry: "Financial Services",
    phone: "+1 212 555 0144",
    revenue: "750000000",
    state: "New York",
    street: "45 Wall Street",
    website: "https://fintrustcapital.com",
  },
  {
    category: "insurance",
    city: "Gurugram",
    company: "Niva Bupa",
    country: "India",
    description:
      "Niva is a leading insurance company and it has revenue of 10 cr.",
    email: "mailtniva@bupa.com",
    industry: "Insurance",
    phone: "+87 96866788",
    revenue: "100000000",
    state: "Haryana",
    street: "12 Insurance Tower",
    website: "https://niva.example.com",
  },
  {
    category: "agriculture",
    city: "Pune",
    company: "GreenHarvest Agro",
    country: "India",
    description:
      "GreenHarvest Agro supports farmers with crop analytics, supply chain tools, and revenue of 12 cr.",
    email: "care@greenharvest.agro",
    industry: "Agriculture",
    phone: "+91 97654 32109",
    revenue: "120000000",
    state: "Maharashtra",
    street: "8 Farm Link Road",
    website: "https://greenharvest.agro",
  },
  {
    category: "sales-cloud",
    city: "Austin",
    company: "PipelinePro Sales",
    country: "United States",
    description:
      "PipelinePro Sales helps teams manage leads, opportunities, and forecasts with revenue of 25 cr.",
    email: "sales@pipelinepro.example.com",
    industry: "Sales Cloud",
    phone: "+1 512 555 0182",
    revenue: "250000000",
    state: "Texas",
    street: "77 Revenue Avenue",
    website: "https://pipelinepro.example.com",
  },
  {
    category: "service-cloud",
    city: "Bengaluru",
    company: "CareDesk Services",
    country: "India",
    description:
      "CareDesk Services runs customer support, case routing, and field service operations with revenue of 30 cr.",
    email: "help@caredesk.example.com",
    industry: "Service Cloud",
    phone: "+91 99887 76655",
    revenue: "300000000",
    state: "Karnataka",
    street: "14 Support Park",
    website: "https://caredesk.example.com",
  },
  {
    category: "marketing-cloud",
    city: "Chicago",
    company: "JourneySpark Marketing",
    country: "United States",
    description:
      "JourneySpark Marketing creates automated journeys, campaigns, and audience analytics with revenue of 22 cr.",
    email: "team@journeyspark.example.com",
    industry: "Marketing Cloud",
    phone: "+1 312 555 0119",
    revenue: "220000000",
    state: "Illinois",
    street: "9 Campaign Plaza",
    website: "https://journeyspark.example.com",
  },
  {
    category: "commerce-cloud",
    city: "Seattle",
    company: "CartFlow Commerce",
    country: "United States",
    description:
      "CartFlow Commerce powers online stores, checkout journeys, and marketplace growth with revenue of 40 cr.",
    email: "orders@cartflow.example.com",
    industry: "Commerce Cloud",
    phone: "+1 206 555 0163",
    revenue: "400000000",
    state: "Washington",
    street: "310 Retail Lane",
    website: "https://cartflow.example.com",
  },
  {
    category: "experience-cloud",
    city: "London",
    company: "PortalWorks Experience",
    country: "United Kingdom",
    description:
      "PortalWorks Experience builds partner portals, customer communities, and self-service sites with revenue of 16 cr.",
    email: "connect@portalworks.example.com",
    industry: "Experience Cloud",
    phone: "+44 20 5555 0188",
    revenue: "160000000",
    state: "England",
    street: "18 Community Street",
    website: "https://portalworks.example.com",
  },
  {
    category: "data-cloud",
    city: "Singapore",
    company: "UnifiedData Cloud",
    country: "Singapore",
    description:
      "UnifiedData Cloud brings customer data, identity resolution, and real-time segmentation together with revenue of 34 cr.",
    email: "data@unifieddata.example.com",
    industry: "Data Cloud",
    phone: "+65 6555 0199",
    revenue: "340000000",
    state: "Singapore",
    street: "5 Data Hub",
    website: "https://unifieddata.example.com",
  },
  {
    category: "health-cloud",
    city: "Boston",
    company: "CareBridge Health",
    country: "United States",
    description:
      "CareBridge Health manages patient relationships, care plans, and provider networks with revenue of 28 cr.",
    email: "patients@carebridge.example.com",
    industry: "Health Cloud",
    phone: "+1 617 555 0135",
    revenue: "280000000",
    state: "Massachusetts",
    street: "50 Clinic Road",
    website: "https://carebridge.example.com",
  },
  {
    category: "medical",
    city: "Hyderabad",
    company: "MediCore Hospitals",
    country: "India",
    description:
      "MediCore Hospitals provides specialty healthcare, diagnostics, and patient services with revenue of 55 cr.",
    email: "info@medicore.example.com",
    industry: "Medical",
    phone: "+91 91234 56780",
    revenue: "550000000",
    state: "Telangana",
    street: "3 Health Avenue",
    website: "https://medicore.example.com",
  },
  {
    category: "airline",
    city: "Dubai",
    company: "SkyRoute Airlines",
    country: "United Arab Emirates",
    description:
      "SkyRoute Airlines operates passenger routes, loyalty programs, and cargo services with revenue of 90 cr.",
    email: "fly@skyroute.example.com",
    industry: "Airline",
    phone: "+971 4 555 0177",
    revenue: "900000000",
    state: "Dubai",
    street: "1 Aviation Boulevard",
    website: "https://skyroute.example.com",
  },
  {
    category: "education",
    city: "Delhi",
    company: "BrightPath Education",
    country: "India",
    description:
      "BrightPath Education runs digital learning, admissions, and student success programs with revenue of 14 cr.",
    email: "learn@brightpath.example.com",
    industry: "Education",
    phone: "+91 90123 45678",
    revenue: "140000000",
    state: "Delhi",
    street: "6 Knowledge Park",
    website: "https://brightpath.example.com",
  },
  {
    category: "manufacturing",
    city: "Detroit",
    company: "ForgeLine Manufacturing",
    country: "United States",
    description:
      "ForgeLine Manufacturing produces industrial components and manages dealer operations with revenue of 65 cr.",
    email: "factory@forgeline.example.com",
    industry: "Manufacturing",
    phone: "+1 313 555 0128",
    revenue: "650000000",
    state: "Michigan",
    street: "88 Assembly Road",
    website: "https://forgeline.example.com",
  },
  {
    category: "retail",
    city: "Paris",
    company: "UrbanCart Retail",
    country: "France",
    description:
      "UrbanCart Retail manages stores, online orders, and customer loyalty with revenue of 33 cr.",
    email: "hello@urbancart.example.com",
    industry: "Retail",
    phone: "+33 1 55 55 0190",
    revenue: "330000000",
    state: "Ile-de-France",
    street: "24 Market Rue",
    website: "https://urbancart.example.com",
  },
  {
    category: "nonprofit",
    city: "Toronto",
    company: "HopeWorks Foundation",
    country: "Canada",
    description:
      "HopeWorks Foundation coordinates donors, programs, and community outreach with annual funding of 8 cr.",
    email: "give@hopeworks.example.com",
    industry: "Nonprofit",
    phone: "+1 416 555 0171",
    revenue: "80000000",
    state: "Ontario",
    street: "11 Giving Way",
    website: "https://hopeworks.example.com",
  },
];

const sampleCategoryOptions = [
  { label: "Tech", value: "tech" },
  { label: "Media", value: "media" },
  { label: "Financial Services", value: "financial-services" },
  { label: "Insurance", value: "insurance" },
  { label: "Agriculture", value: "agriculture" },
  { label: "Sales Cloud", value: "sales-cloud" },
  { label: "Service Cloud", value: "service-cloud" },
  { label: "Marketing Cloud", value: "marketing-cloud" },
  { label: "Commerce Cloud", value: "commerce-cloud" },
  { label: "Experience Cloud", value: "experience-cloud" },
  { label: "Data Cloud", value: "data-cloud" },
  { label: "Health Cloud", value: "health-cloud" },
  { label: "Medical", value: "medical" },
  { label: "Airline", value: "airline" },
  { label: "Education", value: "education" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Retail", value: "retail" },
  { label: "Nonprofit", value: "nonprofit" },
] satisfies Array<{ label: string; value: SampleCategory }>;

function getSampleProfile(category: SampleCategory) {
  return (
    sampleProfiles.find((profile) => profile.category === category) ??
    sampleProfiles[0]
  );
}

function getRandomNumber(max = 9999) {
  return Math.floor(Math.random() * max) + 1;
}

function getSampleValue(field: SalesforceField, category: SampleCategory) {
  const profile = getSampleProfile(category);
  const fieldKey = `${field.apiName} ${field.label}`.toLowerCase();
  const suffix = getRandomNumber();

  if (field.dataType === "picklist") {
    return "";
  }

  if (field.dataType === "recordtype") {
    return field.picklistValues[0]?.value ?? "";
  }

  switch (field.dataType) {
    case "boolean":
      return Math.random() > 0.5 ? "true" : "false";
    case "currency":
    case "double":
    case "percent":
      if (fieldKey.includes("revenue") || fieldKey.includes("amount")) {
        return profile.revenue;
      }

      return (Math.random() * 1000).toFixed(2);
    case "date":
      return new Date(Date.now() + getRandomNumber(30) * 86400000)
        .toISOString()
        .slice(0, 10);
    case "datetime":
      return new Date(Date.now() + getRandomNumber(30) * 86400000).toISOString();
    case "email":
      return profile.email;
    case "int":
      return String(getRandomNumber());
    case "multipicklist":
      return field.picklistValues
        .slice(0, 2)
        .map((value) => value.value)
        .join(";");
    case "phone":
      return profile.phone;
    case "url":
      return profile.website;
    case "string":
    case "textarea":
      if (fieldKey.includes("email")) {
        return profile.email;
      }

      if (fieldKey.includes("phone") || fieldKey.includes("mobile")) {
        return profile.phone;
      }

      if (fieldKey.includes("description") || fieldKey.includes("note")) {
        return profile.description;
      }

      if (fieldKey.includes("website") || fieldKey.includes("url")) {
        return profile.website;
      }

      if (fieldKey.includes("industry") || fieldKey.includes("sector")) {
        return profile.industry;
      }

      if (fieldKey.includes("zip") || fieldKey.includes("postal")) {
        return "87656";
      }

      if (fieldKey.includes("city")) {
        return profile.city;
      }

      if (fieldKey.includes("state") || fieldKey.includes("province")) {
        return profile.state;
      }

      if (fieldKey.includes("country")) {
        return profile.country;
      }

      if (fieldKey.includes("street") || fieldKey.includes("address")) {
        return profile.street;
      }

      if (
        field.apiName === "Name" ||
        fieldKey.includes("company") ||
        fieldKey.includes("account name")
      ) {
        return profile.company;
      }

      return `${field.label} ${suffix}`;
    default:
      return `${field.label} ${suffix}`;
  }
}

function convertValueForSalesforce(field: FieldRow) {
  if (field.disabled) {
    return null;
  }

  const trimmedValue = field.value.trim();

  if (!trimmedValue) {
    return null;
  }

  switch (field.dataType) {
    case "boolean":
      return trimmedValue === "true";
    case "currency":
    case "double":
    case "percent": {
      const numberValue = Number.parseFloat(trimmedValue);

      if (Number.isNaN(numberValue)) {
        throw new Error(`${field.label} must be a number.`);
      }

      return numberValue;
    }
    case "int": {
      const numberValue = Number.parseInt(trimmedValue, 10);

      if (Number.isNaN(numberValue)) {
        throw new Error(`${field.label} must be a whole number.`);
      }

      return numberValue;
    }
    default:
      return trimmedValue;
  }
}

export default function ObjectsPage() {
  const router = useRouter();
  const [objects, setObjects] = useState<SalesforceObject[]>([]);
  const [selectedObject, setSelectedObject] = useState("");
  const [fieldRows, setFieldRows] = useState<FieldRow[]>([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingObjects, setIsLoadingObjects] = useState(true);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [clearGeneratedValues, setClearGeneratedValues] = useState(false);
  const [recordCount, setRecordCount] = useState(1);
  const [sampleCategory, setSampleCategory] = useState<SampleCategory>("tech");
  const sampleCategoryRef = useRef<SampleCategory>("tech");

  const selectedObjectLabel = useMemo(() => {
    return (
      objects.find((object) => object.name === selectedObject)?.label ??
      "selected object"
    );
  }, [objects, selectedObject]);

  useEffect(() => {
    async function loadObjects() {
      try {
        const response = await fetch("/api/salesforce/objects");
        const data = (await response.json()) as {
          error?: string;
          objects?: SalesforceObject[];
          username?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load Salesforce objects.");
        }

        const nextObjects = data.objects ?? [];
        setObjects(nextObjects);
        setSelectedObject(nextObjects[0]?.name ?? "");
        setUsername(data.username ?? "");
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load Salesforce objects.",
        );
      } finally {
        setIsLoadingObjects(false);
      }
    }

    loadObjects();
  }, []);

  useEffect(() => {
    if (!selectedObject) {
      return;
    }

    async function loadFields() {
      setError("");
      setSuccessMessage("");
      setIsLoadingFields(true);

      try {
        const response = await fetch(
          `/api/salesforce/fields?objectApiName=${encodeURIComponent(
            selectedObject,
          )}`,
        );
        const data = (await response.json()) as {
          defaultRecordTypeId?: string;
          error?: string;
          fields?: SalesforceField[];
          recordTypes?: SalesforceRecordType[];
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load Salesforce fields.");
        }

        const recordTypes = data.recordTypes ?? [];
        const recordTypeRow: FieldRow = {
          apiName: "RecordTypeId",
          dataType: "recordtype",
          disabled: !recordTypes.length,
          label: "Record Type",
          picklistValues: recordTypes,
          required: false,
          value: data.defaultRecordTypeId ?? "",
        };
        const rows = (data.fields ?? []).map((field) => ({
            ...field,
            value: getSampleValue(field, sampleCategoryRef.current),
          }));

        setFieldRows([recordTypeRow, ...rows]);
      } catch (caughtError) {
        setFieldRows([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load Salesforce fields.",
        );
      } finally {
        setIsLoadingFields(false);
      }
    }

    loadFields();
  }, [selectedObject]);

  function updateFieldValue(apiName: string, value: string) {
    setFieldRows((currentRows) =>
      currentRows.map((field) =>
        field.apiName === apiName ? { ...field, value } : field,
      ),
    );
  }

  function refreshSampleValues() {
    setClearGeneratedValues(false);
    setFieldRows((currentRows) =>
      currentRows.map((field) =>
        field.apiName === "RecordTypeId"
          ? field
          : { ...field, value: getSampleValue(field, sampleCategory) },
      ),
    );
  }

  function handleSampleCategoryChange(category: SampleCategory) {
    sampleCategoryRef.current = category;
    setSampleCategory(category);
    setClearGeneratedValues(false);
    setFieldRows((currentRows) =>
      currentRows.map((field) =>
        field.apiName === "RecordTypeId"
          ? field
          : { ...field, value: getSampleValue(field, category) },
      ),
    );
  }

  function handleClearGeneratedValues(checked: boolean) {
    setClearGeneratedValues(checked);
    setFieldRows((currentRows) =>
      currentRows.map((field) => {
        if (field.apiName === "RecordTypeId") {
          return field;
        }

        return {
          ...field,
          value: checked ? "" : getSampleValue(field, sampleCategory),
        };
      }),
    );
  }

  async function handleCreateRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsCreating(true);

    try {
      const fields = fieldRows.reduce<Record<string, unknown>>((record, field) => {
        const value = convertValueForSalesforce(field);

        if (value !== null) {
          record[field.apiName] = value;
        }

        return record;
      }, {});
      const records = Array.from({ length: recordCount }, () => fields);

      const response = await fetch("/api/salesforce/records", {
        body: JSON.stringify({
          fields: records,
          objectApiName: selectedObject,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as {
        count?: number;
        error?: string;
        ids?: string[];
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create the Salesforce record.");
      }

      setSuccessMessage(
        `Created ${data.count ?? recordCount} ${selectedObjectLabel} ${
          (data.count ?? recordCount) === 1 ? "record" : "records"
        }.`,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create the Salesforce record.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-2xl shadow-slate-950/30">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
              Salesforce
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Create a Salesforce record
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Select a creatable Salesforce object, review its fields, and edit
              the generated sample values before creating a record.
            </p>
            {username ? (
              <p className="mt-2 text-xs text-slate-500">
                Connected as {username}
              </p>
            ) : null}
          </div>

          <button
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            onClick={() => router.push("/")}
            type="button"
          >
            Back to login
          </button>
        </div>

        {isLoadingObjects ? (
          <div className="rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-600">
            Loading Salesforce objects...
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleCreateRecord}>
            <div className="grid gap-4 sm:grid-cols-[1fr_240px_180px]">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="salesforce-object"
                >
                  Salesforce object
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  disabled={!objects.length}
                  id="salesforce-object"
                  onChange={(event) => {
                    setClearGeneratedValues(false);
                    setSelectedObject(event.target.value);
                  }}
                  value={selectedObject}
                >
                  {objects.map((object) => (
                    <option key={object.name} value={object.name}>
                      {object.label} ({object.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="sample-category"
                >
                  Sample data category
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  id="sample-category"
                  onChange={(event) =>
                    handleSampleCategoryChange(
                      event.target.value as SampleCategory,
                    )
                  }
                  value={sampleCategory}
                >
                  {sampleCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="record-count"
                >
                  Number of records
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  id="record-count"
                  max={200}
                  min={1}
                  onChange={(event) =>
                    setRecordCount(
                      Math.min(
                        200,
                        Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                      ),
                    )
                  }
                  type="number"
                  value={recordCount}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Fields for {selectedObjectLabel}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  The Value column is generated from each Salesforce data type.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    checked={clearGeneratedValues}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    disabled={isLoadingFields || !fieldRows.length}
                    onChange={(event) =>
                      handleClearGeneratedValues(event.target.checked)
                    }
                    type="checkbox"
                  />
                  Clear generated values
                </label>

                <button
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoadingFields || !fieldRows.length}
                  onClick={refreshSampleValues}
                  type="button"
                >
                  Generate values
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {isLoadingFields ? (
                <div className="bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                  Loading Salesforce fields...
                </div>
              ) : fieldRows.length ? (
                <div className="max-h-[65vh] overflow-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Field Name</th>
                        <th className="px-4 py-3 font-semibold">API</th>
                        <th className="px-4 py-3 font-semibold">Data Type</th>
                        <th className="px-4 py-3 font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {fieldRows.map((field) => (
                        <tr key={field.apiName} className="align-top">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            <div
                              className={
                                field.required
                                  ? "rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-700"
                                  : ""
                              }
                            >
                              {field.label}
                              {field.required ? (
                                <span className="ml-1 font-bold">*</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">
                            {field.apiName}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {field.dataType}
                          </td>
                          <td className="min-w-64 px-4 py-3">
                            {field.dataType === "recordtype" ? (
                              <select
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                                disabled={field.disabled}
                                onChange={(event) =>
                                  updateFieldValue(field.apiName, event.target.value)
                                }
                                value={field.value}
                              >
                                {field.picklistValues.length ? (
                                  field.picklistValues.map((recordType) => (
                                    <option
                                      key={recordType.value}
                                      value={recordType.value}
                                    >
                                      {recordType.label}
                                    </option>
                                  ))
                                ) : (
                                  <option value="">No record types available</option>
                                )}
                              </select>
                            ) : field.dataType === "boolean" ? (
                              <select
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                onChange={(event) =>
                                  updateFieldValue(field.apiName, event.target.value)
                                }
                                value={field.value}
                              >
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            ) : field.dataType === "picklist" ? (
                              <select
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                onChange={(event) =>
                                  updateFieldValue(field.apiName, event.target.value)
                                }
                                value={field.value}
                              >
                                <option value="">Select a value</option>
                                {field.picklistValues.map((picklistValue) => (
                                  <option
                                    key={picklistValue.value}
                                    value={picklistValue.value}
                                  >
                                    {picklistValue.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                                onChange={(event) =>
                                  updateFieldValue(field.apiName, event.target.value)
                                }
                                value={field.value}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                  No supported creatable fields were found for this object.
                </div>
              )}
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                {successMessage}
              </div>
            ) : null}

            <button
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
              disabled={isCreating || isLoadingFields || !selectedObject}
              type="submit"
            >
              {isCreating
                ? "Creating records..."
                : `Create ${recordCount} ${
                    recordCount === 1 ? "record" : "records"
                  }`}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
