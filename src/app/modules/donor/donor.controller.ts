import { RequestHandler } from 'express';
import { DonorInputError, DonorServices } from './donor.service';
import { TDonorQuery } from './donor.interface';

const handleError = (error: unknown, res: Parameters<RequestHandler>[1]) => {
  if (error instanceof DonorInputError) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    res.status(409).json({ success: false, message: 'This mobile number is already registered.' });
    return;
  }
  console.error('Donor request failed:', error);
  res.status(500).json({ success: false, message: 'Internal server error.' });
};

const createDonor: RequestHandler = async (req, res) => {
  try {
    const donor = await DonorServices.createDonor(req.body);
    res.status(201).json({ success: true, message: 'Donor registered successfully.', data: donor });
  } catch (error) { handleError(error, res); }
};

const getAllDonors: RequestHandler = async (req, res) => {
  try {
    const result = await DonorServices.getAllDonors(req.query as TDonorQuery);
    res.json({ success: true, ...result });
  } catch (error) { handleError(error, res); }
};

const getDonorById: RequestHandler = async (req, res) => {
  try {
    const donor = await DonorServices.getDonorById(req.params.id as string);
    if (!donor) { res.status(404).json({ success: false, message: 'Donor not found.' }); return; }
    res.json({ success: true, data: donor });
  } catch (error) { handleError(error, res); }
};

const updateDonor: RequestHandler = async (req, res) => {
  try {
    const donor = await DonorServices.updateDonor(req.params.id as string, req.body);
    if (!donor) { res.status(404).json({ success: false, message: 'Donor not found.' }); return; }
    res.json({ success: true, message: 'Donor updated successfully.', data: donor });
  } catch (error) { handleError(error, res); }
};

const deleteDonor: RequestHandler = async (req, res) => {
  try {
    const donor = await DonorServices.deleteDonor(req.params.id as string);
    if (!donor) { res.status(404).json({ success: false, message: 'Donor not found.' }); return; }
    res.json({ success: true, message: 'Donor deleted successfully.' });
  } catch (error) { handleError(error, res); }
};

export const DonorControllers = {
  createDonor,
  getAllDonors,
  getDonorById,
  updateDonor,
  deleteDonor,
};
