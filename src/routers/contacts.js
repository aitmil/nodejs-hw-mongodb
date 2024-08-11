import express from 'express';
import {
  getAllContacts,
  getContactById,
  createContact,
  patchContact,
  deleteContact,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createContactSchema,
  patchContactSchema,
} from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();
const jsonParser = express.json();

router.use(authenticate);

router.get('/', ctrlWrapper(getAllContacts));

router.get('/:contactId', isValidId, ctrlWrapper(getContactById));

router.post(
  '/',
  jsonParser,
  validateBody(createContactSchema),
  ctrlWrapper(createContact),
);

router.patch(
  '/:contactId',
  jsonParser,
  isValidId,
  validateBody(patchContactSchema),
  ctrlWrapper(patchContact),
);

router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
