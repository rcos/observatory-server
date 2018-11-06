// TODO - integrate Team Model into these request handlers
// import Team from './team.model'

exports.index = (req, res) => {
  return res.json({ task: 'Return list of teams here' });
}

exports.create = (req, res) => {
  return res.json({ todo: 'Return newly created team here' });
}
