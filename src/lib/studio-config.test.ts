import { describe, expect, it } from "vitest";
import {
  validateEnquiry,
  enquiryText,
  studioConfig,
  getWhatsAppUrl,
  type Enquiry,
} from "./studio-config";
const valid: Enquiry = {
  name: "Anuj",
  business: "A local café",
  service: "Web Development",
  budget: "",
  details: "We need a new business website for our local café.",
  contact: "hello@example.com",
};
describe("Project enquiry rules", () => {
  it("requires a name", () => {
    expect(validateEnquiry({ ...valid, name: " " }).name).toBeDefined();
  });
  it("requires a business name", () => {
    expect(validateEnquiry({ ...valid, business: "" }).business).toBeDefined();
  });
  it("requires a service interest", () => {
    expect(validateEnquiry({ ...valid, service: "" }).service).toBeDefined();
  });
  it("requires enough project detail", () => {
    expect(validateEnquiry({ ...valid, details: "Hi" }).details).toBeDefined();
  });
  it("rejects invalid contact details", () => {
    expect(validateEnquiry({ ...valid, contact: "not-an-email" }).contact).toBeDefined();
  });
  it("accepts an email", () => {
    expect(validateEnquiry(valid)).toEqual({});
  });
  it("accepts a WhatsApp number", () => {
    expect(validateEnquiry({ ...valid, contact: "+91 98765 43210" })).toEqual({});
  });
  it("accepts AI Solutions & Automation service", () => {
    expect(validateEnquiry({ ...valid, service: "AI Solutions & Automation" })).toEqual({});
  });
  it("keeps budget optional", () => {
    expect(validateEnquiry(valid).budget).toBeUndefined();
    expect(enquiryText(valid)).toContain("Budget: Not specified");
  });
});

describe("WhatsApp configuration & link builder", () => {
  it("has the verified business WhatsApp number and display format", () => {
    expect(studioConfig.whatsapp).toBe("917387752527");
    expect(studioConfig.whatsappDisplay).toBe("+91 7387752527");
  });

  it("generates the official click-to-chat URL with prefilled message", () => {
    const url = getWhatsAppUrl();
    expect(url).toContain("https://wa.me/917387752527?text=");
    expect(url).toBe(
      `https://wa.me/917387752527?text=${encodeURIComponent(studioConfig.whatsappDefaultMessage)}`,
    );
    expect(decodeURIComponent(url)).toContain(
      "Hi KILT STUDIO! I'm interested in your digital services and would like to discuss a project. Could you please share more details?",
    );
  });

  it("supports custom prefilled messages", () => {
    const custom = "Hello, I have an urgent enquiry";
    expect(getWhatsAppUrl(custom)).toBe(
      `https://wa.me/917387752527?text=${encodeURIComponent(custom)}`,
    );
  });

  it("handles empty custom message without query parameter", () => {
    expect(getWhatsAppUrl("")).toBe("https://wa.me/917387752527");
  });
});
