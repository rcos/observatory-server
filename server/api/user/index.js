'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';
var router = new Router();

router.get('/',  controller.list);
router.post('/', controller.create);

router.get('/stats',  controller.publicStats);
router.get('/past', controller.past);
router.get('/search', controller.search);
router.get('/adminstats', auth.hasRole('admin'), controller.allStats);
router.get('/smallgroup', auth.isAuthenticated(), controller.smallgroup);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/:id', controller.show);

router.post('/resetPassword', controller.resetPassword);

router.put('/:id', auth.canEdit(), controller.update);

router.delete('/me', auth.isAuthenticated(), controller.deleteUser);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

router.get('/:id/commits', controller.commits);
router.get('/:id/avatar', controller.avatar);
router.get('/:id/smallgroup', auth.isAuthenticated(), controller.userSmallgroup);
router.get('/:id/private', auth.canEdit(), controller.privateProfile);

router.post('/:id/role', auth.hasRole('admin'), controller.role);

router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/deactivate', auth.canEdit(), controller.deactivate);
router.put('/:id/activate', auth.isAuthenticated(), controller.activate);
router.put('/:id/project', auth.isAuthenticated(), controller.addProject);
router.put('/:id/addTech', auth.canEdit(), controller.addTech);
router.put('/:id/removeTech', auth.canEdit(), controller.removeTech);

router.delete('/:id/project', auth.isAuthenticated(), controller.removeProject);

export default router;
