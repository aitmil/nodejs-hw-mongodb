import createHttpError from 'http-errors';
import * as ContactService from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export const getAllContacts = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortOrder, sortBy } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const contacts = await ContactService.getAllContacts({
    page,
    perPage,
    sortOrder,
    sortBy,
    filter,
    userId: req.user._id,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactById = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  console.log('contactId:', contactId);
  console.log('userId:', userId);

  const contact = await ContactService.getContactById(contactId, userId);

  if (!contact) {
    return next(createHttpError(404, 'Contact not found'));
  }

  if (contact.userId.toString() !== req.user._id.toString()) {
    return next(createHttpError(403, 'Not authorized to access this contact'));
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContact = async (req, res) => {
  const contact = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    isFavourite: req.body.isFavourite,
    contactType: req.body.contactType,
    userId: req.user._id,
  };

  const createdContact = await ContactService.createContact(contact);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: createdContact,
  });
};

// export const patchContact = async (req, res, next) => {
//   const { contactId } = req.params;
//   const userId = req.user._id;

//   const result = await ContactService.patchContact(contactId, userId, req.body);

//   if (!result) {
//     return next(createHttpError(404, 'Contact not found'));
//   }

//   if (result.userId.toString() !== req.user._id.toString()) {
//     return next(createHttpError(403, 'Contact not allowed'));
//   }

//   res.status(200).json({
//     status: 200,
//     message: 'Successfully patched a contact!',
//     data: result,
//   });
// };

export const patchContact = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const contact = await ContactService.getContactById(contactId, userId);

  if (!contact) {
    return next(createHttpError(404, 'Contact not found'));
  }

  if (contact.userId.toString() !== userId.toString()) {
    return next(createHttpError(403, 'Not authorized to update this contact'));
  }

  const updatedContact = await ContactService.patchContact(
    contactId,
    userId,
    req.body,
  );

  res.status(200).json({
    status: 200,
    message: 'Successfully patched the contact!',
    data: updatedContact,
  });
};

// export const deleteContact = async (req, res, next) => {
//   const { contactId } = req.params;
// const userId = req.user._id;

//   const result = await ContactService.deleteContact(contactId, userId);

//   if (!result) {
//     return next(createHttpError(404, 'Contact not found'));
//   }

//   if (result.userId.toString() !== req.user._id.toString()) {
//     return next(createHttpError(403, 'Contact not allowed'));
//   }

//   res.status(204).end();
// };

export const deleteContact = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;

  const contact = await ContactService.getContactById(contactId, userId);

  if (!contact) {
    return next(createHttpError(404, 'Contact not found'));
  }

  if (contact.userId.toString() !== userId.toString()) {
    return next(createHttpError(403, 'Not authorized to delete this contact'));
  }

  await ContactService.deleteContact(contactId, userId);

  res.status(204).end();
};
