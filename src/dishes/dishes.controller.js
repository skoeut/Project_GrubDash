const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function dishIdMatches(req, res, next) {
  const { dishId } = req.params;
  if (req.body.data.id === dishId) {
    return next();
  }
  next({
    status: 400,
    message: `Invalid dish id: ${req.body.data.id}, Route: ${dishId}`,
  });
}

function bodyHasNameProperty(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name && name.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "A 'name' property is required.",
  });
}

function bodyHasImageProperty(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "An 'image_url' property is required.",
  });
}

function bodyHasDescriptionProperty(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description && description.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "A 'description' property is required.",
  });
}

function bodyHasPriceProperty(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price && price > 0 && Number.isInteger(price)) {
    return next();
  }
  next({
    status: 400,
    message: "A valid 'price' property is required.",
  });
}

function doesDishIdMatchRouteId (req, res, next){
    const dishId = res.locals.dish.id
    const {data: {id} = {} } = req.body

    if(id){
        if(id === dishId){
            return next()
        }else{
            return next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
            })
        }
    }else{
        return next()
    }
}

function list(req, res) {
  res.json({data: dishes})
}

function read(req, res) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  res.json({ data: foundDish });
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
} 

function update(req, res) {
  const {data: {name, description, price, image_url} ={} } = req.body
   const dish = res.locals.dish
   
  const originalName = dish.name
  const originalDescription = dish.description
  const originalPrice = dish.price
  const originalImage_url = dish.image_url
  
  if(  
    originalName !== name ||
    originalDescription !== description ||
    originalPrice !== price ||
    originalImage_url !== image_url
  ) {
     dish.name = name;
     dish.description  = description;
     dish.price = price;
     dish.image_url = image_url
   }
  res.status(200).json({data: dish})
 }
  
  
module.exports = {
  list,
  create: [
    bodyHasNameProperty, 
    bodyHasImageProperty, 
    bodyHasDescriptionProperty, 
    bodyHasPriceProperty, 
    create],
  read: [dishExists, read],
  update: [
    dishExists, 
    doesDishIdMatchRouteId, 
    bodyHasNameProperty, 
    bodyHasDescriptionProperty, 
    bodyHasDescriptionProperty, 
    bodyHasImageProperty, 
    bodyHasPriceProperty, 
    update]
}