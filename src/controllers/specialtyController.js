//vid 67
import res from "express/lib/response";
import specialtyService from "../services/specialtyService";
let createSpecialty = async (req, res) => {
  try {
    let infor = await specialtyService.createSpecialty(req.body);
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};
let getAllSpecialty = async (req, res) => {
  try {
    let infor = await specialtyService.getAllSpecialty();
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};

let handleEditSpecialty = async (req, res) => {
  let data = req.body;
  let message = await specialtyService.updateSpecialtyData(data);
  return res.status(200).json(message);
};

let handleDeleteSpecialty = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters!",
    });
  }
  let message = await specialtyService.handleDeleteSpecialty(req.body.id);
  return res.status(200).json(message);
};

let getDetailSpecialtyById = async (req, res) => {
  try {
    let infor = await specialtyService.getDetailSpecialtyById(
      req.query.id,
      req.query.location
    );
    return res.status(200).json(infor);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error from the server",
    });
  }
};
module.exports = {
  createSpecialty: createSpecialty,
  getAllSpecialty: getAllSpecialty,
  handleDeleteSpecialty: handleDeleteSpecialty,
  getDetailSpecialtyById: getDetailSpecialtyById,
  handleEditSpecialty: handleEditSpecialty,
};
