import createHttpError from 'http-errors';
import * as ContactService from '../services/contacts.js';

export const getAllContacts = async (req, res) => {
  const contacts = await ContactService.getAllContacts();
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await ContactService.getContactById(contactId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found!');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContact = async (req, res) => {
  console.log('Received request to create contact with body:', req.body);
  const contact = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    isFavourite: req.body.isFavourite,
    contactType: req.body.contactType,
  };
  const createdContact = await ContactService.createContact(contact);
  console.log('Successfully created contact:', createdContact);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: createdContact,
  });
};
