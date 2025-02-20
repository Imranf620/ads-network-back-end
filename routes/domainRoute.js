import express from 'express';
import { isAdmin, isLoggedIn } from '../middlewares/auth.js';
import { createDomain, getAllDomains, getSingleDomain,assignDomainToUser, refereDomain, getAllRedirectDomains, getAllTemplateDomains, getButtonDomain, deleteDomain, toggleBtnRedirect, addVisit } from '../controllers/domainController.js';
const router = express.Router();

// router.post('/create', isLoggedIn, isAdmin, createDomain)
router.post('/create', createDomain)

// router.get('/all', isLoggedIn, isAdmin, getAllDomains)
router.get('/all', getAllDomains)

router.get('/get/:id', isLoggedIn, isAdmin, getSingleDomain)
router.put('/assign/:id', isLoggedIn, isAdmin, assignDomainToUser)
router.put('/reference/:id', isLoggedIn, isAdmin, refereDomain)
router.get('/get/all/redirect', getAllRedirectDomains)

 router.get('/get/all/template', getAllTemplateDomains) 
 router.post('/get/btn/data', getButtonDomain)
 router.delete('/delete/:id',isLoggedIn, isAdmin,  deleteDomain)
  router.put('/update/:id', isLoggedIn, isAdmin, toggleBtnRedirect)
  router.post('/visit', addVisit)


export default router;