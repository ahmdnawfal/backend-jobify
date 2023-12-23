import { StatusCodes } from 'http-status-codes';
import Job from '../models/jobModel.js';
import 'express-async-errors';
import { NotFoundError } from '../errors/customError.js';

export const getAllJobs = async (req, res) => {
  const { search, jobStatus, jobType, sort } = req.query;

  const queryObject = {
    createdBy: req.user.userId,
  };

  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  if (jobStatus && jobStatus !== 'all') {
    queryObject.jobStatus = jobStatus;
  }

  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'a-z': 'position',
    'z-a': '-position',
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await Job.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  return res.status(StatusCodes.OK).json({
    msg: 'SUCCESS',
    page: page,
    limit: numOfPages,
    count: totalJobs,
    rows: jobs,
  });
};

export const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;

  const job = await Job.create(req.body);
  return res.status(StatusCodes.CREATED).json({ msg: 'SUCCESS', rows: job });
};

export const getJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);

  if (!job) {
    throw new NotFoundError(`no job with id : ${id}`);
  }

  return res.status(StatusCodes.OK).json({ msg: 'SUCCESS', rows: job });
};

export const updateJob = async (req, res) => {
  const { id } = req.params;

  const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updatedJob) {
    throw new NotFoundError(`no job with id : ${id}`);
  }

  return res.status(StatusCodes.OK).json({ msg: 'SUCCESS', rows: updatedJob });
};

export const deleteJob = async (req, res) => {
  const { id } = req.params;

  const removedJob = await Job.findByIdAndDelete(id);

  if (!removedJob) {
    throw new NotFoundError(`no job with id : ${id}`);
  }

  return res.status(StatusCodes.OK).json({ msg: 'SUCCESS' });
};
