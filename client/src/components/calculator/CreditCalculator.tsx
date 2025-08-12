import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { tierFor } from "../../../../shared/config/pricing";
import { useLawRegime } from "../../hooks/useLawRegime";

const CalcSchema = z.object({
  email: z.string().email("Enter a valid email"),
  wages: z.number().min(0),
  contractors: z.number().min(0),
  supplies: z.number().min(0),
  cloud: z.number().min(0),
  software: z.number().min(0),
  priorQre0: z.number().min(0).optional(),
  priorQre1: z.number().min(0).optional(),
  priorQre2: z.number().min(0).optional(),
  hasHistory: z.boolean().default(false),
});
type CalcForm = z.infer<typeof CalcSchema>;

function computeQRE(f: CalcForm) {
  return (f.wages || 0) + (f.contractors || 0) * 0.65 + (f.supplies || 0) + (f.cloud || 0) + (f.software || 0);
}

function computeASC(qre: number, f: CalcForm) {
  if (!f.hasHistory) return { method: "ASC_6_FIRST_TIME", credit: Math.round(qre * 0.06) };
  const arr = [f.priorQre0 || 0, f.priorQre1 || 0, f.priorQre2 || 0];
  const avg = (arr[0] + arr[1] + arr[2]) / 3;
  const excess = Math.max(0, qre - 0.5 * avg);
  return { method: "ASC_14_EXCESS", credit: Math.round(excess * 0.14) };
}

export default function CreditCalculator() {
  const { isCapitalization } = useLawRegime();
  const form = useForm<CalcForm>({ 
    resolver: zodResolver(CalcSchema), 
    mode: "onChange", 
    defaultValues: {
      email: "", wages: 0, contractors: 0, supplies: 0, cloud: 0, software: 0, hasHistory: false
    }
  });
  const [step, setStep] = useState(1);
  const values = form.watch();
  const qre = useMemo(() => computeQRE(values), [values]);
  const asc = useMemo(() => computeASC(qre, values), [qre, values]);
  const tier = tierFor(asc.credit);

  // localStorage autosave
  useEffect(() => {
    const s = JSON.stringify(values);
    localStorage.setItem("calc_draft", s);
  }, [values]);
  useEffect(() => {
    const raw = localStorage.getItem("calc_draft");
    if (raw) try { form.reset(JSON.parse(raw)); } catch {}
  }, []);

  const canNext = form.formState.isValid;

  return (
    <div className="max-w-screen-lg mx-auto p-4 md:p-6 text-gray-900">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">R&D Credit Estimator</h1>

      {!isCapitalization && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
          Note: Current rules reflect immediate expensing of §174 research costs (OBBBA). Confirm your filing-year treatment with a tax professional.
        </div>
      )}

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {step === 1 && (
          <section>
            <h2 className="text-xl font-medium mb-4">1) Tell us about you</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block">
                <span className="block text-sm mb-1">Contact email</span>
                <input 
                  type="email" 
                  {...form.register("email")} 
                  className="w-full border rounded-md p-2" 
                  placeholder="you@company.com" 
                />
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.email?.message}</p>
              </label>
              <label className="block">
                <span className="block text-sm mb-1">W-2 wages (R&D)</span>
                <input 
                  type="number" 
                  {...form.register("wages", { valueAsNumber: true })} 
                  className="w-full border rounded-md p-2" 
                />
              </label>
              <label className="block">
                <span className="block text-sm mb-1">Contractors (R&D)</span>
                <input 
                  type="number" 
                  {...form.register("contractors", { valueAsNumber: true })} 
                  className="w-full border rounded-md p-2" 
                />
                <span className="text-xs text-gray-600">We'll apply the 65% limiter automatically.</span>
              </label>
              <label className="block">
                <span className="block text-sm mb-1">Supplies</span>
                <input 
                  type="number" 
                  {...form.register("supplies", { valueAsNumber: true })} 
                  className="w-full border rounded-md p-2" 
                />
              </label>
              <label className="block">
                <span className="block text-sm mb-1">Cloud</span>
                <input 
                  type="number" 
                  {...form.register("cloud", { valueAsNumber: true })} 
                  className="w-full border rounded-md p-2" 
                />
              </label>
              <label className="block">
                <span className="block text-sm mb-1">Software</span>
                <input 
                  type="number" 
                  {...form.register("software", { valueAsNumber: true })} 
                  className="w-full border rounded-md p-2" 
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button 
                type="button" 
                disabled={!canNext} 
                onClick={() => setStep(2)} 
                className="btn btn-primary disabled:opacity-50 px-4 py-2 rounded-md bg-blue-600 text-white"
              >
                Next
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="text-xl font-medium mb-4">2) Prior-year QREs (optional)</h2>
            <label className="inline-flex items-center gap-2 mb-4">
              <input type="checkbox" {...form.register("hasHistory")} />
              <span className="text-sm">I have QREs for the prior 3 years</span>
            </label>
            {values.hasHistory && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input 
                  type="number" 
                  placeholder="Year -1" 
                  {...form.register("priorQre0", { valueAsNumber: true })} 
                  className="border rounded-md p-2" 
                />
                <input 
                  type="number" 
                  placeholder="Year -2" 
                  {...form.register("priorQre1", { valueAsNumber: true })} 
                  className="border rounded-md p-2" 
                />
                <input 
                  type="number" 
                  placeholder="Year -3" 
                  {...form.register("priorQre2", { valueAsNumber: true })} 
                  className="border rounded-md p-2" 
                />
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="px-4 py-2 rounded-md border"
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={() => setStep(3)} 
                className="btn btn-primary px-4 py-2 rounded-md bg-blue-600 text-white"
              >
                See results
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="text-xl font-medium mb-2">3) Estimated credit</h2>
            <p className="text-sm text-gray-700 mb-4">Numbers refresh instantly; we'll also verify with the server.</p>
            <div className="rounded-lg border p-4">
              <div className="flex justify-between">
                <span>QRE (with 65% contractor cap):</span>
                <strong>${qre.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Method:</span>
                <strong>{asc.method}</strong>
              </div>
              <div className="flex justify-between">
                <span>Estimated federal credit:</span>
                <strong className="text-blue-700">${asc.credit.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Pricing tier:</span>
                <strong>Tier {tier.tier} — ${tier.price}</strong>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="px-4 py-2 rounded-md border"
              >
                Back
              </button>
              <CheckoutCTA form={form} credit={asc.credit} />
            </div>
          </section>
        )}
      </form>
    </div>
  );
}

// Inline CTA component with robust gating + redirect flow
function CheckoutCTA({ form, credit }: { form: ReturnType<typeof useForm<CalcForm>>, credit: number }) {
  const [loading, setLoading] = useState(false);
  const email = form.getValues("email");
  const tier = tierFor(credit);
  const emailValid = !!email && email.includes("@");
  const ctaDisabled = !form.formState.isValid || !emailValid || loading;

  async function onCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: tier.priceId, metadata: { credit, tier: tier.tier, email } })
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url; // server returns session.url
      } else {
        console.error("No checkout URL returned", data);
        alert("Unable to start checkout. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Checkout error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (import.meta.env.DEV) {
    console.debug("CTA state", {
      valid: form.formState.isValid, emailValid, loading, credit, tier
    });
  }

  return (
    <button 
      disabled={ctaDisabled} 
      onClick={onCheckout}
      className="btn btn-primary px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
    >
      {loading ? "Processing…" : "Continue to Checkout"}
    </button>
  );
}