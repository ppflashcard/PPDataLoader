"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/salesforce/login", {
        body: JSON.stringify({
          environment: formData.get("environment"),
          password: formData.get("password"),
          username: formData.get("username"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to login to Salesforce.");
      }

      router.push(data.redirectTo ?? "/objects");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to login to Salesforce.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl shadow-slate-950/30">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Salesforce
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Login to continue
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter your Salesforce username and password. After login, this app
            will be able to create records in your Salesforce object.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="salesforce-environment"
            >
              Salesforce environment
            </label>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              defaultValue="production"
              id="salesforce-environment"
              name="environment"
            >
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="salesforce-username"
            >
              Salesforce username
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              id="salesforce-username"
              name="username"
              placeholder="you@example.com"
              type="email"
              required
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="salesforce-password"
            >
              Salesforce password
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              id="salesforce-password"
              name="password"
              placeholder="Enter your password"
              type="password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}

          <button
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Connecting..." : "Login with Salesforce"}
          </button>
        </form>

        <p className="mt-6 rounded-2xl bg-slate-100 px-4 py-3 text-xs leading-5 text-slate-600">
          If your Salesforce org requires a security token, append it to the
          password field. Example: password + security token.
        </p>
      </section>
    </main>
  );
}
