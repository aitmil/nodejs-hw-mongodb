import { ContactsCollection } from '../models/contact.js';

export const getAllContacts = () => {
  return ContactsCollection.find();
};

export const getContactById = (contactId) => {
  return ContactsCollection.findById(contactId);
};

export const createContact = (contact) => {
  return ContactsCollection.create(contact);
};
