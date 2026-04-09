export const FindOne = async ({
  module,
  filter,
  options = undefined,
  select = "",
}) => {
  let result = module.findOne(filter);
  if (select.length) {
    result.select(select);
    return await result.exec();
  }

  return await result;
};

// --------------------------------------------
export const InsertOne = async ({ module, data }) => {
  const result = module.insertOne(data);
  return await result;
};

// ------------------------------------------------
export const FindOneByIdAndUpdate = async ({ module, id, data }) => {
  const result = module.findByIdAndUpdate(id, data, {
    returnDocument: "after",
  });
  return await result;
};

// ------------------------------------------

export const FindOneByIdAndDelete = async ({ module, id }) => {
  const result = module.findByIdAndDelete(id);
  return await result;
};
