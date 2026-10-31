import { expect, it } from "vitest";
import { recordEmailDeliveryFailure, withEmailDeliveryResult } from "@/lib/email-delivery-status";

it("overrides swallowed provider failures instead of returning success", async () => {
  const response = await withEmailDeliveryResult(async () => {
    recordEmailDeliveryFailure("Delivery failed");
    return Response.json({ success: true });
  });
  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({ message: "Delivery failed" });
});

it("isolates delivery errors between simultaneous requests", async () => {
  const [failed, successful] = await Promise.all([
    withEmailDeliveryResult(async () => {
      recordEmailDeliveryFailure("Delivery failed");
      await Promise.resolve();
      return Response.json({ success: true });
    }),
    withEmailDeliveryResult(async () => {
      await Promise.resolve();
      return Response.json({ success: true });
    }),
  ]);
  expect(failed.status).toBe(502);
  expect(successful.status).toBe(200);
});
