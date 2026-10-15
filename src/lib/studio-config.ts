import anujPortrait from "@/assets/founders/anuj.jpg";
import krishnaPortrait from "@/assets/founders/krishna.jpg";
import amitPortrait from "@/assets/founders/amit.jpg";

// Add only verified studio details. Empty values deliberately disable delivery.
export const studioConfig = {
  email: "kiltstudio10@gmail.com",
  whatsapp: "", // International digits only, e.g. country code + number.
  portraits: {
    krishna: krishnaPortrait,
    anuj: anujPortrait,
    amit: amitPortrait,
  },
  socials: { instagram: "", linkedin: "" },
};

export type Enquiry = {
  name: string;
  business: string;
  service: string;
  budget: string;
  details: string;
  contact: string;
};
export function validateEnquiry(values: Enquiry) {
  const errors: Partial<Record<keyof Enquiry, string>> = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.business.trim()) errors.business = "Please enter your business name.";
  if (!values.service) errors.service = "Choose a service.";
  if (values.details.trim().length < 20)
    errors.details = "Tell us a little more (at least 20 characters).";
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phone = /^\+?[\d\s()-]{8,20}$/;
  if (!email.test(values.contact.trim()) && !phone.test(values.contact.trim()))
    errors.contact = "Enter a valid email or WhatsApp number.";
  return errors;
}
export function enquiryText(values: Enquiry) {
  return `New KILT STUDIO project enquiry\n\nName: ${values.name}\nBusiness: ${values.business}\nService: ${values.service}\nBudget: ${values.budget || "Not specified"}\nContact: ${values.contact}\n\n${values.details}`;
}
