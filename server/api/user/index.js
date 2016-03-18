'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';
var router = new Router();

router.get('/',  controller.list);
router.get('/past', controller.past);
router.get('/search', controller.search);
router.get('/stats', auth.hasRole('admin'), controller.stats);
router.get('/allstats', auth.hasRole('admin'), controller.allStats);
router.get('/:id/commits', controller.commits);
router.get('/:id/avatar', controller.avatar);

router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.post('/:id/role', auth.hasRole('admin'), controller.role);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/deactivate', auth.canEdit(), controller.deactivate);
router.put('/:id/activate', auth.isAuthenticated(), controller.activate);
router.get('/:id', controller.show);
router.get('/:id/private', auth.canEdit(), controller.privateProfile);
router.post('/', controller.create);
router.put('/:id/bio', auth.canEdit(), controller.changeBio);
router.put('/:id/github', auth.canEdit(), controller.changeGithub);
router.put('/:id/project', auth.isAuthenticated(), controller.addProject);
router.delete('/:id/project', auth.isAuthenticated(), controller.removeProject);
router.put('/:id/addTech', auth.canEdit(), controller.addTech);
router.put('/:id/removeTech', auth.canEdit(), controller.removeTech);
router.post('/resetPassword', controller.resetPassword);
router.put('/:id/removeUser',controller.deleteUser); 


export default router;
