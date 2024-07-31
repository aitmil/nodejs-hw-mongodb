import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();
const jsonParser = express.json();

router.get('/contacts', ctrlWrapper(getAllContacts));

router.get('/contacts/:contactId', ctrlWrapper(getContactById));

router.post('/contacts', jsonParser, ctrlWrapper(createContact));

export default router;
