const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

const orderIdExists = (req, res, next) => {
  const {orderId} = req.params
  const foundOrder = orders.find((order) => order.id === orderId)
  if (foundOrder) {
    res.locals.order = foundOrder
    return next()
  }
  next({status: 404, message: `OrderId does not exist: ${orderId}`})
}

function bodyHasDeliverProperty(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo && deliverTo.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
}

function bodyHasNumberProperty(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber && mobileNumber.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
}


function bodyHasDishProperty(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes && dishes.length > 0 && Array.isArray(dishes)) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include at least one dish",
  });
}

function isQuantityValid(req, res, next){
    const {data: {dishes} = {}} = req.body

    for(let i = 0; i < dishes.length; i++){
        const dish = dishes[i]
        const quantity = dish.quantity
        if(!quantity || quantity <= 0 || !Number.isInteger(quantity)){
           return next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`
            })
        }
    }
    return next()
}

function doIdsMatch(req, res, next){
    const {data: {id} = {} } = req.body
    const orderId = res.locals.order.id

    if(id && id !== orderId){
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        })
    }
    next()
}

function read(req, res, next) {
  res.json({data: res.locals.order})
}

function isStatusPending(req, res, next){
    const status = res.locals.order.status

    if(status !== 'pending'){
        next({
            status: 400,
            message:'An order cannot be deleted unless it is pending'
        })
    }
    next()
}

function isStatusInvalid(req, res, next){
    const {data: {status} = {} } = req.body

    if(status === 'invalid' || !status || status.length === 0){
        return next({
            status: 400,
            message: 'An order must have a valid status to be changed'
        })
    }
    next() 
}
function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
} 

function update(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const order = res.locals.order
  
  const orginalDeliverTo = order.deliverTo
  const orginalMobileNumber = order.mobileNumber
  const orginalStatus = order.status
  const orginalDishes = order.dishes
  
  if(orginalDeliverTo !== deliverTo ||
    orginalMobileNumber !== mobileNumber ||
    orginalStatus !== status ||
    orginalDishes !== dishes
    ) {
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes
    }
  res.json({data: order})
}

function list(req, res) {
  res.json({data: orders})
}

function destroy(req, res, next) {
  const {orderId} = req.params
  const index = orders.findIndex((order) => order.id === orderId)
  if (index > -1) {
    orders.splice(index)
  }
  res.sendStatus(204)
}


module.exports = {
  list,
  update: [
    orderIdExists, 
    doIdsMatch, 
    bodyHasDishProperty, 
    bodyHasDeliverProperty, 
    bodyHasNumberProperty, 
    isQuantityValid, 
    isStatusInvalid, 
    update],
  create: [
    bodyHasDeliverProperty, 
    bodyHasNumberProperty, 
    bodyHasDishProperty, 
    isQuantityValid, 
    create],
  read: [
    orderIdExists, 
    read],
  delete: [
    orderIdExists, 
    isStatusPending, 
    destroy]
}