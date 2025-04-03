//vid 78
import { reject } from "lodash";
import db from "../models/index";
require("dotenv").config();
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";

let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};

let CancelUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/cancel-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};

let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        let databookcheck = await db.Booking.findOne({
          where: {
            statusId: "S2",
            doctorId: data.doctorId,
            date: data.date,
            timeType: data.timeType,
          },
        });
        if (databookcheck) {
          resolve({
            errCode: 1,
            errMessage: "Ca này bác sĩ đã có lịch khám",
          });
        } else {
          let token = uuidv4();
          let user = await db.User.findOne({
            where: { email: data.email },
            raw: false,
          });
          if (user) {
            user.gender = data.selectedGender;
            user.address = data.address;
            user.firstName = data.fullName;
            user.phonenumber = data.phoneNumber;
            await user.save();
          }
          //  else {
          //     await db.User.create({
          //         email: data.email,
          //         roleId: 'R3',
          //         gender: data.selectedGender,
          //         address: data.address,
          //         firstName: data.fullName,
          //         phonenumber: data.phoneNumber
          //     })
          // }
          let user1 = await db.User.findOrCreate({
            where: { email: data.email },
            defaults: {
              email: data.email,
              roleId: "R3",
              gender: data.selectedGender,
              address: data.address,
              firstName: data.fullName,
              phonenumber: data.phoneNumber,
            },
          });
          if (user1 && user1[0]) {
            await db.Booking.create({
              statusId: "S1",
              doctorId: data.doctorId,
              patientId: user1[0].id,
              date: data.date,
              timeType: data.timeType,
              token: token,
            });
          }
          await emailService.sendSimpleEmail({
            reciversEmail: data.email,
            patientName: data.fullName,
            time: data.timeString,
            doctorName: data.doctorName,
            language: data.language,
            redirectLink: buildUrlEmail(data.doctorId, token),
            cancelLink: CancelUrlEmail(data.doctorId, token),
          });

          resolve({
            errCode: 0,
            errMessage: "Save infor patient succeed!",
          });
        }

        // ================ back up =================
        // let token = uuidv4();

        // await emailService.sendSimpleEmail({
        //     reciversEmail: data.email,
        //     patientName: data.fullName,
        //     time: data.timeString,
        //     doctorName: data.doctorName,
        //     language: data.language,
        //     redirectLink: buildUrlEmail(data.doctorId, token)

        // });

        // //upsert patient
        // let user = await db.User.findOrCreate({
        //     where: { email: data.email },
        //     defaults: {
        //         email: data.email,
        //         roleId: 'R3',
        //         gender: data.selectedGender,
        //         address: data.address,
        //         firstName: data.fullName,
        //     }
        // });

        // // create a booking record
        // if (user && user[0]) {
        //     await db.Booking.findOrCreate({
        //         where: { patientId: user[0].id },
        //         defaults: {
        //             statusId: 'S1',
        //             doctorId: data.doctorId,
        //             patientId: user[0].id,
        //             date: data.date,
        //             timeType: data.timeType,
        //             token: token
        //         }
        //     })
        // }

        // resolve({
        //     errCode: 0,
        //     errMessage: 'Save infor patient succeed!'
        // });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let postVerifyAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: "S1",
          },
          raw: false,
        });

        if (appointment) {
          appointment.statusId = "S2";
          await appointment.save();

          resolve({
            errCode: 0,
            errMessage: "Update the appointment succeed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Appointment has been activated or does not exist!",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

let postCancelAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: "S2",
          },
          raw: false,
        });

        if (appointment) {
          appointment.statusId = "S1";
          await appointment.save();

          resolve({
            errCode: 0,
            errMessage: "Update the appointment succeed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Appointment has been activated or does not exist!",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyAppointment: postVerifyAppointment,
  postCancelAppointment: postCancelAppointment,
};
