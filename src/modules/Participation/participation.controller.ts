import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ParticipationService } from "./participation.service";
import httpStatus from "http-status";


const joinEvent = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;

  const result = await ParticipationService.joinEvent(userId, eventId as string);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Participation request created successfully",
    data: result,
  });
});

const getMyParticipations = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await ParticipationService.getMyParticipations(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My participations retrieved successfully",
    data: result,
  });
});

const getParticipantsByEvent = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const result = await ParticipationService.getParticipantsByEvent(
    eventId as string,
    userId,
    userRole
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Participants retrieved successfully",
    data: result,
  });
});

const approveParticipation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const result = await ParticipationService.approveParticipation(
    id as string,
    userId,
    userRole
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Participation approved successfully",
    data: result,
  });
});

const rejectParticipation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const result = await ParticipationService.rejectParticipation(
    id as string,
    userId,
    userRole
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Participation rejected successfully",
    data: result,
  });
});

const banParticipant = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const result = await ParticipationService.banParticipant(
    id as string,
    userId,
    userRole
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Participant banned successfully",
    data: result,
  });
});

export const ParticipationController = {
  joinEvent,
  getMyParticipations,
  getParticipantsByEvent,
  approveParticipation,
  rejectParticipation,
  banParticipant,
};