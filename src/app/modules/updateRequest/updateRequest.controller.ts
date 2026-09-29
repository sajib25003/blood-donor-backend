import { RequestHandler } from 'express';
import { TUpdateRequestQuery } from './updateRequest.interface';
import { UpdateRequestInputError, UpdateRequestServices } from './updateRequest.service';

const handleError = (error: unknown, res: Parameters<RequestHandler>[1]) => {
  if (error instanceof UpdateRequestInputError) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }
  console.error('Update request failed:', error);
  res.status(500).json({ success: false, message: 'Internal server error.' });
};

const createUpdateRequest: RequestHandler = async (req, res) => {
  try {
    const data = await UpdateRequestServices.createUpdateRequest(req.body);
    res.status(201).json({ success: true, message: 'Update request submitted.', data });
  } catch (error) { handleError(error, res); }
};

const getAllUpdateRequests: RequestHandler = async (req, res) => {
  try {
    const result = await UpdateRequestServices.getAllUpdateRequests(req.query as TUpdateRequestQuery);
    res.json({ success: true, ...result });
  } catch (error) { handleError(error, res); }
};

const updateRequestStatus: RequestHandler = async (req, res) => {
  try {
    const data = await UpdateRequestServices.updateRequestStatus(req.params.id as string, req.body);
    if (!data) { res.status(404).json({ success: false, message: 'Request not found.' }); return; }
    res.json({ success: true, message: 'Request status updated.', data });
  } catch (error) { handleError(error, res); }
};

export const UpdateRequestControllers = { createUpdateRequest, getAllUpdateRequests, updateRequestStatus };
