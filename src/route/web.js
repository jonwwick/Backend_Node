import express from "express";
import res from "express/lib/response";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController";
import patientController from "../controllers/patientController";
import specialtyController from "../controllers/specialtyController";
import clinicController from "../controllers/clinicController";

let router = express.Router();

let initWebRouters = (app) => {
  router.get("/", homeController.getHomePage); //video 25
  router.get("/about", homeController.getAboutPage); //video 26
  router.get("/crud", homeController.getCRUD); // //video 27
  router.post("/post-crud", homeController.postCRUD); //video 27
  router.get("/get-crud", homeController.displayGetCRUD); //video 28
  router.get("/edit-crud", homeController.getEditCRUD); //vid 29
  router.post("/put-crud", homeController.putCRUD); //vid 29
  router.get("/delete-crud", homeController.deleteCRUD); //vid 29

  router.post("/api/login", userController.handleLogin); //vid 36
  router.get("/api/get-all-users", userController.handleGetAllUsers); //vid 37 - 38
  router.post("/api/create-new-user", userController.handleCreateNewUser); //vid 39
  router.put("/api/edit-user", userController.handleEditUser); //vid 39
  router.delete("/api/delete-user", userController.handleDeleteUser); //vid 39
  router.get("/api/allcode", userController.getAllCode); //vid 40

  router.get("/api/top-doctor-home", doctorController.getTopDoctorHome); //vid 46
  router.get("/api/get-all-doctors", doctorController.getAllDoctors); //vid37 -38
  router.post("/api/save-infor-doctors", doctorController.postInforDoctor); //vid 65
  router.get(
    "/api/get-detail-doctor-by-id",
    doctorController.getDetailDoctorById
  ); //vid 66
  router.post("/api/bulk-create-schedule", doctorController.bulkCreateSchedule); // vid 68
  router.get(
    "/api/get-schedule-doctor-by-date",
    doctorController.getScheduleByDate
  ); //vid 68-69
  router.get(
    "/api/get-extra-infor-doctor-by-id",
    doctorController.getExtraInforDoctorById
  ); //vid 69
  router.get(
    "/api/get-profile-doctor-by-id",
    doctorController.getProfileDoctorById
  ); // vid 67-68
  router.get(
    "/api/get-doctor-name-by-specialty-id",
    doctorController.getDoctorNameBySpecialtyId
  ); // vid 79

  router.get(
    "/api/get-list-patient-for-doctor",
    doctorController.getListPatientForDoctor
  ); // vid 80
  router.post("/api/send-remedy", doctorController.sendRemedy); // vid 87
  router.get(
    "/api/get-list-booking-for-doctor-suceed",
    doctorController.getListPatientForDoctorSuceed
  ); // vid 88

  router.post(
    "/api/patient-book-appointment",
    patientController.postBookAppointment
  ); //vid 84
  router.post(
    "/api/verify-book-appointment",
    patientController.postVerifyAppointment
  ); //vid 84-85
  router.post(
    "/api/cancel-book-appointment",
    patientController.postCancelAppointment
  ); //vid 84-85

  router.post("/api/create-new-specialty", specialtyController.createSpecialty); //vid 86
  router.get("/api/get-specialty", specialtyController.getAllSpecialty); //vid 86
  router.get(
    "/api/get-detail-specialty-by-id",
    specialtyController.getDetailSpecialtyById
  ); //vid 86-87
  router.put("/api/edit-specialty", specialtyController.handleEditSpecialty); //vid 86-87
  router.delete(
    "/api/delete-specialty",
    specialtyController.handleDeleteSpecialty
  ); //vid 87

  router.post("/api/create-new-clinic", clinicController.createClinic); //vid 89
  router.get("/api/get-clinic", clinicController.getAllClinic); //vid 90
  router.get(
    "/api/get-detail-clinic-by-id",
    clinicController.getDetailClinicById
  ); //vid 91
  router.put("/api/edit-clinic", clinicController.handleEditClinic); //vid 92
  router.delete("/api/delete-clinic", clinicController.handleDeleteClinic); //vid 92

  return app.use("/", router);
};

module.exports = initWebRouters;
