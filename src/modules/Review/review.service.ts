import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";

type TCreateReviewPayload = {
  eventId: string;
  rating: number;
  comment: string;
};

type TUpdateReviewPayload = {
  rating?: number;
  comment?: string;
};

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  userId: true,
  eventId: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  event: {
    select: {
      id: true,
      title: true,
      date: true,
      venue: true,
      eventType: true,
      feeType: true,
    },
  },
};

const createReview = async (userId: string, payload: TCreateReviewPayload) => {
  const event = await prisma.event.findUnique({
    where: { id: payload.eventId },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId: payload.eventId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already reviewed this event"
    );
  }

  const participation = await prisma.participation.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId: payload.eventId,
      },
    },
  });

  if (!participation || participation.status !== "APPROVED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only approved participants can review this event"
    );
  }

  // Optional realistic rule: review only after event date passed
  if (new Date(event.date) > new Date()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can review only after the event date has passed"
    );
  }

  const result = await prisma.review.create({
    data: {
      userId,
      eventId: payload.eventId,
      rating: payload.rating,
      comment: payload.comment,
    },
    select: reviewSelect,
  });

  return result;
};

const getAllReviews = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as "asc" | "desc") || "desc";
  const eventId = query.eventId as string | undefined;
  const userId = query.userId as string | undefined;

  const whereClause: Record<string, unknown> = {};

  if (eventId) {
    whereClause.eventId = eventId;
  }

  if (userId) {
    whereClause.userId = userId;
  }

  const [result, total] = await Promise.all([
    prisma.review.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: reviewSelect,
    }),
    prisma.review.count({
      where: whereClause,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getReviewById = async (reviewId: string) => {
  const result = await prisma.review.findUnique({
    where: { id: reviewId },
    select: reviewSelect,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  return result;
};

const updateReviewById = async (
  reviewId: string,
  userId: string,
  userRole: string,
  payload: TUpdateReviewPayload
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      event: true,
    },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (userRole !== "ADMIN" && review.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this review"
    );
  }

  if (new Date(review.event.date) < new Date()) {
    // Event already passed, update allowed if you want
    // Keep this open, no restriction here
  }

  const result = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
    select: reviewSelect,
  });

  return result;
};

const deleteReviewById = async (
  reviewId: string,
  userId: string,
  userRole: string
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (userRole !== "ADMIN" && review.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this review"
    );
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return null;
};

const getMyReviews = async (userId: string) => {
  const result = await prisma.review.findMany({
    where: {
      userId,
    },
    select: reviewSelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReviewById,
  deleteReviewById,
  getMyReviews,
};