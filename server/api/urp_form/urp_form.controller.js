import _ from 'lodash'
import { handleError } from '../lib/helpers'
import UrpForm from './urp_form.model'

// we desperately need specifications for each of these
exports.index = (req, res) => {

  return res.json({ testing: "this be the index" }).end();
}

exports.showBySemester = (req, res) => {
  return res.json({ testing: "this be show by semester" }).end();
  /*
  return UrpForm.findById(req.params.semester_id)
  .then((model) => {
    return res.json(200, model).end()
  })
  .catch((err) => {
    return handleError(err)
  }) */
}

exports.showByUserId = (req, res) => {
  return res.json({ testing: "this be show by user id" }).end();
  /*
  return UrpForm.findById(req.params.semester_id)
  .then((model) => {
    return res.json(200, model).end()
  })
  .catch((err) => {
    return handleError(err)
  })*/
}

exports.update = (req, res) => {
  return res.json({ testing: "this be update" }).end();
  // TODO - isolate valid attributes depending on user role
  // Admin - update STATUS, REVIEWER_NOTE, REVIEWED_BY (automatic)
  //return UrpForm.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
  //.then((response) => {
  //    return res.status(200).send(response).end()
  //}).catch(next)
}


exports.destroy = (req, res, next) => {
  return res.json({ testing: "this be destroy" }).end();
  // TODO - ensure this is only deletable by the user who created the record, or an admin
  //return UrpForm.remove({ _id: req.params.id })
  //.then((response) => {
  //    return res.status(200).send(response).end()
  //}).catch(next)
 }
  
