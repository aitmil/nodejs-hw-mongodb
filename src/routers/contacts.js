import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  patchContact,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = express.Router();
const jsonParser = express.json();

router.get('/contacts', ctrlWrapper(getAllContacts));

router.get('/contacts/:contactId', ctrlWrapper(getContactById));

router.post('/contacts', jsonParser, ctrlWrapper(createContact));

router.patch('/contacts/:contactId', jsonParser, ctrlWrapper(patchContact));

export default router;
