//vid 67
import { reject } from "lodash";
import db from "../models";

let createSpecialty = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("check data ", data.name);
      if (
        !data.name ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        await db.Specialty.findOrCreate({
          where: { name: data.name },
          defaults: {
            name: data.name,
            image: data.imageBase64,
            descriptionHTML: data.descriptionHTML,
            descriptionMarkdown: data.descriptionMarkdown,
          },
        });
        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllSpecialty = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Specialty.findAll({});
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = new Buffer(item.image, "base64").toString("binary");
          return item;
        });
      }
      resolve({
        errCode: 0,
        errMessage: "OK",
        data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let updateSpecialtyData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.id ||
        !data.name ||
        !data.descriptionMarkdown ||
        !data.descriptionHTML
      ) {
        resolve({
          errCode: 2,
          errMessage: "Missing required parameters!",
        });
      }
      let specialty = await db.Specialty.findOne({
        where: { id: data.id },
        raw: false,
      });
      if (specialty) {
        specialty.name = data.name;
        specialty.descriptionHTML = data.descriptionHTML;
        specialty.descriptionMarkdown = data.descriptionMarkdown;

        if (data.imageBase64) {
          specialty.imageBase64 = data.imageBase64;
        }
        await specialty.save();

        resolve({
          errCode: 0,
          message: "Update the specialty succeeds",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: `Specialty not found!`,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let handleDeleteSpecialty = (specialtyId) => {
  return new Promise(async (resolve, reject) => {
    let foundSpecialty = await db.Specialty.findOne({
      where: { id: specialtyId },
    });
    if (!foundSpecialty) {
      resolve({
        errCode: 2,
        errMessage: `The specialty isn't exist!`,
      });
    }
    await db.Specialty.destroy({
      where: { id: specialtyId },
    });
    resolve({
      errCode: 0,
      message: `The specialty is deleted!`,
    });
  });
};

let getDetailSpecialtyById = (inputId, location) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId || !location) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        let data = await db.Specialty.findOne({
          where: {
            id: inputId,
          },
          attributes: ["descriptionHTML", "descriptionMarkdown"],
        });
        if (data) {
          let doctorSpecialty = [];
          if (location === "ALL") {
            doctorSpecialty = await db.Doctor_Infor.findAll({
              where: { specialtyId: inputId },
              attributes: ["doctorId", "provinceId"],
            });
          } else {
            //find by location
            doctorSpecialty = await db.Doctor_Infor.findAll({
              where: {
                specialtyId: inputId,
                provinceId: location,
              },
              attributes: ["doctorId", "provinceId"],
            });
          }
          data.doctorSpecialty = doctorSpecialty;
        } else data = {};

        resolve({
          errCode: 0,
          errMessage: "OK",
          data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  createSpecialty: createSpecialty,
  getAllSpecialty: getAllSpecialty,
  handleDeleteSpecialty: handleDeleteSpecialty,
  getDetailSpecialtyById: getDetailSpecialtyById,
  updateSpecialtyData: updateSpecialtyData,
};
