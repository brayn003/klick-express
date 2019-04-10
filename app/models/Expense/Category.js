const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const ExpenseCategorySchema = new mongoose.Schema({
  organization: { type: 'ObjectId', ref: 'Organization', required: true },
  name: { type: String, required: true },
  description: { type: String },
}, {
  collection: 'expense_category',
  timestamps: true,
  userAudits: true,
});

ExpenseCategorySchema.statics.getAll = async function (params) {
  const { organization, name } = params;
  const criteria = {};
  if (name) criteria.name = { $regex: new RegExp(name, 'i') };
  if (organization) criteria.organization = organization;
  const categories = await this.paginate(criteria, { lean: true });
  return categories;
};

ExpenseCategorySchema.statics.createOne = async function (params) {
  const category = await this.create(params);
  return category;
};

ExpenseCategorySchema.plugin(mongoosePaginate);
const ExpenseCategory = mongoose.model('ExpenseCategory', ExpenseCategorySchema);
module.exports = ExpenseCategory;
