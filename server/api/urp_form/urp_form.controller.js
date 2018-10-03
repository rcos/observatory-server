// TODO - integrate URPForm Model into these request handlers
// import UrpForm from './urp_form.model'

exports.index = (req, res) => {
  return res.json({ task: 'Return list of URP forms here' });
}

exports.create = (req, res) => {
  return res.json({ todo: 'Return newly created URP form here' });
}
