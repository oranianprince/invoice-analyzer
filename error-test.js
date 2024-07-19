process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });
  
  throw new Error('Test Error');