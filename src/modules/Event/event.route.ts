import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../User/user.utils";
import { EventController } from "./event.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { EventValidations } from "./event.validation";

const router = express.Router();
router.post(
  "/",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(EventValidations.createEventValidationSchema),
  EventController.createEvent,
);

router.get("/", EventController.getAllEvents);

router.get("/:id", EventController.getEventById);

router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(EventValidations.updateEventValidationSchema),
  EventController.updateEventById,
);

router.delete(
  "/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  EventController.deleteEventById,
);

export const EventRoutes = router;
