import { Router } from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { UserRoutes } from "../modules/User/user.route";
import { EventRoutes } from "../modules/Event/event.route";
import { ParticipationRoutes } from "../modules/Participation/participation.route";
import { ReviewRoutes } from "../modules/Review/review.route";
import { PaymentRoutes } from "../modules/Payment/payment.route";

type TModuleRoutes = {
  path: string;
  route: Router;
};

const router = Router();

const moduleRoutes: TModuleRoutes[] = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/events",
    route: EventRoutes,
  },
  {
    path: "/participations",
    route: ParticipationRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },

  {
    path: "/payments",
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

// https://libraries.io/npm/@bayajidalam%2Fapollo-cli
