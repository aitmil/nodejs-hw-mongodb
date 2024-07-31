import * as ContactService from "../services/contacts.js";

export const getAllContacts = async (req, res) => {
  const contacts = await ContactService.getAllContacts();
  res.status(200).json({
    status: 200,
    message: "Successfully found contacts!",
    data: contacts,
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await ContactService.getContactById(contactId);

  if (!contact) {
    res.status(404).json({ message: "Contact not found!" });
    return;
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};
