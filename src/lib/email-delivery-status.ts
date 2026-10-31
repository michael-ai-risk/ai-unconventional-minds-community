import { AsyncLocalStorage } from "node:async_hooks";

const delivery = new AsyncLocalStorage<{ error?: string }>();

export function recordEmailDeliveryFailure(message: string): void {
  const state = delivery.getStore();
  if (state) state.error = message;
}

// Better Auth catches errors from sendVerificationOTP, even when awaiting it.
// Keep request-local delivery status so the endpoint never reports false success.
export async function withEmailDeliveryResult(handler: () => Promise<Response>): Promise<Response> {
  return delivery.run({}, async () => {
    const response = await handler();
    const error = delivery.getStore()?.error;
    return error
      ? Response.json({ message: error }, { status: 502, headers: { "Cache-Control": "no-store" } })
      : response;
  });
}
