

export default {
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiration: '5h',
  };

//   Set mysecret key to anything in a .env file