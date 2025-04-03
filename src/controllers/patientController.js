import patientService from '../services/patientService';

let postBookAppointment = async (req, res) => {

    try {
        let infor = await patientService.postBookAppointment(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}
let postVerifyAppointment = async (req, res) => {

    try {
        let infor = await patientService.postVerifyAppointment(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}

let postCancelAppointment = async (req, res) => {

    try {
        let infor = await patientService.postCancelAppointment(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}


module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyAppointment: postVerifyAppointment,
    postCancelAppointment: postCancelAppointment
}