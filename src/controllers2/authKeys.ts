interface JwtConfig {
    jwtSecretKey: string;
  }
  
  const config: JwtConfig = {
    jwtSecretKey: "jwt_secret",
  };
  
  export default config;
  