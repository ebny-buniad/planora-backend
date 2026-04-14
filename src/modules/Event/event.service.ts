import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { EventSearchableFields } from "./event.constant";
import { Prisma } from "../../../generated/prisma/client";
export type TEventPayload = {
  title: string;
  description: string;
  date: string;
  venue: string;
  eventType: "PUBLIC" | "PRIVATE";
  feeType: "FREE" | "PAID";
  fee?: number;
};

const eventSelect = {
  id: true,
  title: true,
  description: true,
  date: true,
  venue: true,
  eventType: true,
  feeType: true,
  fee: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
};

const createEvent = async (userId: string, payload: TEventPayload) => {
  if (payload.feeType === "FREE" && payload.fee && payload.fee > 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Free event cannot have fee");
  }

  if (payload.feeType === "PAID" && (!payload.fee || payload.fee <= 0)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Paid event must have a valid fee");
  }

  const result = await prisma.event.create({
    data: {
      title: payload.title,
      description: payload.description,
      date: new Date(payload.date),
      venue: payload.venue,
      eventType: payload.eventType,
      feeType: payload.feeType,
      fee: payload.feeType === "FREE" ? 0 : payload.fee,
      creatorId: userId,
    },
    select: eventSelect,
  });

  return result;
};

const getAllEvents = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const searchTerm = query.searchTerm as string | undefined;
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as "asc" | "desc") || "desc";

  const whereConditions: Prisma.EventWhereInput[] = [];

  if (searchTerm) {
    whereConditions.push({
      OR: EventSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive" as Prisma.QueryMode,
        },
      })),
    });
  }

  const filterableFields = ["eventType", "feeType", "creatorId"];
  const filterData = Object.fromEntries(
    Object.entries(query).filter(([key]) => filterableFields.includes(key))
  );

  if (Object.keys(filterData).length > 0) {
    whereConditions.push(filterData as Prisma.EventWhereInput);
  }

  const whereClause: Prisma.EventWhereInput =
    whereConditions.length > 0 ? { AND: whereConditions } : {};

  const [result, total] = await Promise.all([
    prisma.event.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: eventSelect,
    }),
    prisma.event.count({ where: whereClause }),
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

const getEventById = async (eventId: string) => {
  const result = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      ...eventSelect,
      participations: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  return result;
};

const updateEventById = async (
  eventId: string,
  userId: string,
  userRole: string,
  payload: Partial<TEventPayload>
) => {
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  if (userRole !== "ADMIN" && existingEvent.creatorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this event");
  }

  const updatedPayload: any = { ...payload };

  if (payload.date) {
    updatedPayload.date = new Date(payload.date);
  }

  const finalFeeType = payload.feeType || existingEvent.feeType;
  const finalFee = payload.fee !== undefined ? payload.fee : existingEvent.fee;

  if (finalFeeType === "FREE" && finalFee && finalFee > 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Free event cannot have fee");
  }

  if (finalFeeType === "PAID" && (!finalFee || finalFee <= 0)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Paid event must have a valid fee");
  }

  if (finalFeeType === "FREE") {
    updatedPayload.fee = 0;
  }

  const result = await prisma.event.update({
    where: { id: eventId },
    data: updatedPayload,
    select: eventSelect,
  });

  return result;
};

const deleteEventById = async (
  eventId: string,
  userId: string,
  userRole: string
) => {
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  if (userRole !== "ADMIN" && existingEvent.creatorId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this event");
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  return null;
};

export const EventService = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
};