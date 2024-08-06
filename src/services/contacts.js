import { ContactsCollection } from '../models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({ page, perPage }) => {
  const limit = perPage;
  const skip = page > 0 ? (page - 1) * perPage : 0;

  const contactsQuery = ContactsCollection.find();

  const [contacts, count] = await Promise.all([
    contactsQuery.skip(skip).limit(limit).exec(),
    ContactsCollection.countDocuments(),
  ]);

  const paginationData = calculatePaginationData(count, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
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
