function convertMeta(oldOrg) {
  const newMeta = {};
  newMeta.createdAt = oldOrg.createdAt ? new Date(oldOrg.createdAt) : null;
  newMeta.updatedAt = oldOrg.updatedAt ? new Date(oldOrg.updatedAt) : null;
  newMeta.deletedAt = oldOrg.deletedAt ? new Date(oldOrg.deletedAt) : null;
  newMeta.deleted = !!oldOrg.deletedAt;
  newMeta.createdBy = oldOrg.createdBy ? oldOrg.createdBy : null;
  newMeta.updatedBy = oldOrg.updatedBy ? oldOrg.updatedBy : null;
  newMeta.__v = 0;
  return newMeta;
}

module.exports = { convertMeta };
