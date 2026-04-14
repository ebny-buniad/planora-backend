import AppError from "../../errors/AppError";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
const joinEvent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  if (event.creatorId === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot join your own event",
    );
  }

  const existingParticipation = await prisma.participation.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (existingParticipation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already joined/requested this event",
    );
  }

  let status: "APPROVED" | "PENDING" = "PENDING";

  // Public + Free => direct approved
  if (event.eventType === "PUBLIC" && event.feeType === "FREE") {
    status = "APPROVED";
  }

  // Public + Paid => PENDING
  // Private + Free => PENDING
  // Private + Paid => PENDING

  const result = await prisma.participation.create({
    data: {
      userId,
      eventId,
      status,
    },
    include: {
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
          eventType: true,
          feeType: true,
          fee: true,
          creatorId: true,
        },
      },
    },
  });

  return result;
};

const getMyParticipations = async (userId: string) => {
  const result = await prisma.participation.findMany({
    where: {
      userId,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          venue: true,
          eventType: true,
          feeType: true,
          fee: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getParticipantsByEvent = async (
  eventId: string,
  userId: string,
  userRole: string,
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  if (userRole !== "ADMIN" && event.creatorId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view participants of this event",
    );
  }

  const result = await prisma.participation.findMany({
    where: {
      eventId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateParticipationStatus = async (
  participationId: string,
  userId: string,
  userRole: string,
  status: "APPROVED" | "REJECTED" | "BANNED",
) => {
  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
    include: {
      event: true,
      payment: true,
    },
  });

  if (!participation) {
    throw new AppError(httpStatus.NOT_FOUND, "Participation not found");
  }

  if (userRole !== "ADMIN" && participation.event.creatorId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update participation status",
    );
  }

  if (status === "APPROVED" && participation.event.feeType === "PAID") {
    if (!participation.payment || participation.payment.status !== "success") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Payment required before approval",
      );
    }
  }

  const result = await prisma.participation.update({
    where: { id: participationId },
    data: { status },
    include: {
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
          creatorId: true,
        },
      },
      payment: true,
    },
  });

  return result;
};

const approveParticipation = async (
  participationId: string,
  userId: string,
  userRole: string,
) => {
  return updateParticipationStatus(
    participationId,
    userId,
    userRole,
    "APPROVED",
  );
};

const rejectParticipation = async (
  participationId: string,
  userId: string,
  userRole: string,
) => {
  return updateParticipationStatus(
    participationId,
    userId,
    userRole,
    "REJECTED",
  );
};

const banParticipant = async (
  participationId: string,
  userId: string,
  userRole: string,
) => {
  return updateParticipationStatus(participationId, userId, userRole, "BANNED");
};

export const ParticipationService = {
  joinEvent,
  getMyParticipations,
  getParticipantsByEvent,
  approveParticipation,
  rejectParticipation,
  banParticipant,
};
