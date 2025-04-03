//vid 35
import db from "../models";

let createClinic = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.address ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        await db.Clinic.findOrCreate({
          where: { name: data.name },
          defaults: {
            name: data.name,
            address: data.address,
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

let getAllClinic = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Clinic.findAll({});
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

let getDetailClinicById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        let data = await db.Clinic.findOne({
          where: {
            id: inputId,
          },
          attributes: [
            "name",
            "address",
            "descriptionHTML",
            "descriptionMarkdown",
          ],
        });
        if (data) {
          let doctorClinic = [];
          doctorClinic = await db.Doctor_Infor.findAll({
            where: { clinicId: inputId },
            attributes: ["doctorId", "provinceId"],
          });
          data.doctorClinic = doctorClinic;
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
let updateClinicData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.id ||
        !data.name ||
        !data.address ||
        !data.descriptionMarkdown ||
        !data.descriptionHTML
      ) {
        resolve({
          errCode: 2,
          errMessage: "Missing required parameters!",
        });
      }
      let clinic = await db.Clinic.findOne({
        where: { id: data.id },
        raw: false,
      });
      if (clinic) {
        clinic.name = data.name;
        clinic.address = data.address;
        clinic.descriptionHTML = data.descriptionHTML;
        clinic.descriptionMarkdown = data.descriptionMarkdown;

        if (data.imageBase64) {
          clinic.imageBase64 = data.imageBase64;
        }
        await clinic.save();

        resolve({
          errCode: 0,
          message: "Update the clinic succeeds",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: `Clinic not found!`,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let handleDeleteClinic = (clinicId) => {
  return new Promise(async (resolve, reject) => {
    let foundClinic = await db.Clinic.findOne({
      where: { id: clinicId },
    });
    if (!foundClinic) {
      resolve({
        errCode: 2,
        errMessage: `The clinic isn't exist!`,
      });
    }
    await db.Clinic.destroy({
      where: { id: clinicId },
    });
    resolve({
      errCode: 0,
      message: `The clinic is deleted!`,
    });
  });
};

module.exports = {
  createClinic: createClinic,
  getAllClinic: getAllClinic,
  getDetailClinicById: getDetailClinicById,
  updateClinicData: updateClinicData,
  handleDeleteClinic: handleDeleteClinic,
};
