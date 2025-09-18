from jose import jwt
SECRET_KEY = "yoursecretkey"
ALGORITHM = "HS256"
user_data = {"sub": "testuser"}
token = jwt.encode(user_data, SECRET_KEY, algorithm=ALGORITHM)
print(token)
