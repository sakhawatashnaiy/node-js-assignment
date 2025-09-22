const express  = require('express');
const app = express();
app.use(express.json());

   const allProducts = [
          {
              id : 1,
              product : 'Product 1',
              description : 'This is Product 1',
              price : 100,
           },
             {
              id : 2,
              product : 'Product 1',
              description : 'This is Product 2',
              price : 100,
           },
             {
              id : 3,
              product : 'Product 3',
              description : 'This is Product 3',
              price : 100,
           },
             {
              id : 4,
              product : 'Product 4',
              description : 'This is Product 4',
              price : 100,
           },
             {
              id : 5,
              product : 'Product 5',
              description : 'This is Product 5',
              price : 100,
           },
  ]

app.get('/', (req, res) => {
    res.send('hello world');
});
    
 app.get('/products' , (req , res)=>{
      res.send(allProducts);
 });

   const user = true;
    
    app.post('/addproducts', (req, res)=>{
        if(user){
            const product = req.body;
            allProducts.push(product);
            res.status(201).send({
                message: 'Product added successfully!',
                product : 'this is first product!'
            });
        } else {
            res.status(403).send('Product addition failed!');

        }
    });
    
      app.delete('/products/2', (req , res)=>{
           if(user){
              const productid = req.body.id;
              const productIndex = allProducts.findIndex(p => p.id === productid);
              if(productIndex !== -1){
                  allProducts.splice(productIndex, 1);
                  res.status(200).send({
                      message: 'Product deleted successfully!'
                  });
              } else {
                  res.status(404).send({
                      message: 'Product not found!'
                  });
              }
           }
      })
   
 app.listen(6000 , (req ,  res) => {
       console.log('Server is running on port 6000');
 })