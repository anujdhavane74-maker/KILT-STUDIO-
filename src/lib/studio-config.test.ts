import { describe, expect, it } from "vitest";
import { validateEnquiry, enquiryText, type Enquiry } from "./studio-config";
const valid: Enquiry = { name: "Anuj", business: "A local café", service: "Web Development", budget: "", details: "We need a new business website for our local café.", contact: "hello@example.com" };
describe("Project enquiry rules", () => {
  it("requires a name", () => { expect(validateEnquiry({ ...valid, name: " " }).name).toBeDefined(); });
  it("requires a business name", () => { expect(validateEnquiry({ ...valid, business: "" }).business).toBeDefined(); });
  it("requires a service interest", () => { expect(validateEnquiry({ ...valid, service: "" }).service).toBeDefined(); });
  it("requires enough project detail", () => { expect(validateEnquiry({ ...valid, details: "Hi" }).details).toBeDefined(); });
  it("rejects invalid contact details", () => { expect(validateEnquiry({ ...valid, contact: "not-an-email" }).contact).toBeDefined(); });
  it("accepts an email", () => { expect(validateEnquiry(valid)).toEqual({}); });
  it("accepts a WhatsApp number", () => { expect(validateEnquiry({ ...valid, contact: "+91 98765 43210" })).toEqual({}); });
  it("keeps budget optional", () => { expect(validateEnquiry(valid).budget).toBeUndefined(); expect(enquiryText(valid)).toContain("Budget: Not specified"); });
});