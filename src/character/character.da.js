const {types} = require('cassandra-driver');
const {mapToCharacterDB} = require('./character.db.model');
const {CassandraClient} = require('../database/cassandra-client.database');

const mapRowToCharacter = (row) => mapToCharacterDB(
  row['id'],
  row['name'],
  row['house'],
  row['allegiance']
);

module.exports = {
  getAllCharactersDB() {
    const query = 'SELECT * FROM workshop.characters';
    return CassandraClient.execute(query)
      //.then(result => result.rows);
      .then(result => result.rows.map(row => mapRowToCharacter(row)));
  },

  getCharacterById(id) {
    const params = [types.Uuid.fromString(id)]; //sanitization

    const query = 'SELECT * FROM workshop.characters WHERE id=?';
    return CassandraClient.execute(query, params)
      .then(result => {
        const row = result.first();
        return mapRowToCharacter(row);
      });
  },

  insertCharacter(characterToAdd) {
    const newId = types.TimeUuid.now();

    const params = [
      newId,
      characterToAdd.name,
      characterToAdd.house,
      characterToAdd.allegiance
    ];
    const query = 'INSERT INTO workshop.characters(id,name,house,allegiance) VALUES (?,?,?,?)';
    return CassandraClient.execute(query, params)
      .then(() => newId.toString());
  },

  updateCharacter(id, characterToUpdate) {
    const query = 'UPDATE workshop.characters SET name=?, house=?, allegiance=? WHERE id=?';
    const params = [
      characterToUpdate.name,
      characterToUpdate.house,
      characterToUpdate.allegiance,
      types.Uuid.fromString(id)
    ];
    return CassandraClient.execute(query, params)
      .then((result) => !!result); // le formateur n'est pas sur que !!result soit malin
  },

  deleteCharacter(characterIdToDelete) {
    const query = 'DELETE FROM workshop.characters WHERE id=?';
    return CassandraClient.execute(query, [characterIdToDelete])
      .then((result) => !!result);
  }
};