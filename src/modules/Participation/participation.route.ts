import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.utils';
import { ParticipationController } from './participation.controller';

const router = express.Router();
router.post(
  "/join/:eventId",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ParticipationController.joinEvent
);

router.get(
  "/my-participations",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ParticipationController.getMyParticipations
);

router.get(
  "/event/:eventId",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ParticipationController.getParticipantsByEvent
); 

router.patch(
  "/:id/approve",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ParticipationController.approveParticipation
);

router.patch(
  "/:id/reject",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ParticipationController.rejectParticipation
);

router.patch(
  "/:id/ban",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ParticipationController.banParticipant
);

export const ParticipationRoutes = router;
