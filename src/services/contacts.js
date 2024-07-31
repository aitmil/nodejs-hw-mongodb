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

export const patchContact = (contactId, payload) => {
  return ContactsCollection.findByIdAndUpdate(contactId, payload, {
    new: true,
  });
};

export const deleteContact = (contactId) => {
  return ContactsCollection.findByIdAndDelete(contactId);
};
