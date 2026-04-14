import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.utils';
import { ReviewValidations } from './review.validation';
import { validateRequest } from '../../middlewares/validateRequest';
import { ReviewController } from './review.controller';

const router = express.Router();
router.post(
  "/",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(ReviewValidations.createReviewValidationSchema),
  ReviewController.createReview
);

router.get(
  "/",
  ReviewController.getAllReviews
);

router.get(
  "/my-reviews",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ReviewController.getMyReviews
);

router.get(
  "/:id",
  ReviewController.getReviewById
);

router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(ReviewValidations.updateReviewValidationSchema),
  ReviewController.updateReviewById
);

router.delete(
  "/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  ReviewController.deleteReviewById
);

export const ReviewRoutes = router;
