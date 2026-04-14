import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EventService } from "./event.service";
import httpStatus from "http-status";

const createEvent = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await EventService.createEvent(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event created successfully",
    data: result,
  });
});

const getAllEvents = catchAsync(async (req, res) => {
  const result = await EventService.getAllEvents(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Events retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getEventById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EventService.getEventById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event retrieved successfully",
    data: result,
  });
});

const updateEventById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const result = await EventService.updateEventById(id as string, userId, userRole, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

const deleteEventById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  await EventService.deleteEventById(id as string, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event deleted successfully",
    data: null,
  });
});

export const EventController = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
};