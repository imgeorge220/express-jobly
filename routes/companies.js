const express = require("express");
const jsonschema = require("jsonschema");

const router = new express.Router();

const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");

const postSchema = require("../schemas/companyPostSchema.json");
const patchSchema = require("../schemas/companyPatchSchema.json");

router.get("/", async (req, res, next) => {
  try {
    if (Object.keys(req.query).length !== 0) {
      let result = await Company.filterByQueries(req.query);
      return res.json(result);
    }

    let result = await Company.all();
    return res.json(result);
  }
  catch (err) {
    return next(err);
  }
});

router.get("/:handle", async (req, res, next) => {
  try {
    let company = await Company.getByHandle(req.params.handle);
    return res.json(company);
  }
  catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const validData = jsonschema.validate(req.body, postSchema);
    if (!validData.valid) {
      let listOfErrors = validData.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400)
    }

    let company = new Company(req.body);
    let newComp = await company.addToDb();

    return res.status(201).json(newComp);
  }
  catch (err) {
    return next(err);
  }
});

router.patch("/:handle", async (req, res, next) => {
  try {
    const validData = jsonschema.validate(req.body, patchSchema);
    if (!validData.valid) {
      let listOfErrors = validData.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400)
    }
    let result = await Company.update(req.params.handle, req.body);
    return res.json(result);
  }
  catch (err) {
    return next(err);
  }
});

router.delete("/:handle", async (req, res, next) => {
  try {
    let result = await Company.deleteFromDb(req.params.handle);
    return res.json(result);
  }
  catch (err) {
    return next(err);
  }
})



module.exports = router;