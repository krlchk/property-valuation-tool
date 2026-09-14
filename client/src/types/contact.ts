export type ContactInfo = {
  name: string;
  phone: string;
  email: string;
  agreed: boolean;
};

export const EMPTY_CONTACT: ContactInfo = {
  name: "",
  phone: "",
  email: "",
  agreed: false,
};
