// Common js module

// console.log('Hello from node js!');/

const add = (a,b) =>{
     return a+b;
}

 const mult = (a,b) =>{
     return a*b;
}

  const sub = (a,b) =>{
      return a-b;
  }
  const div = (a,b) =>{
         return a/b;
  }

module.exports = {add, mult, sub, div};