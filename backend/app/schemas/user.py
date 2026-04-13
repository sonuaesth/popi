from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    name: str | None = None
    password: str


class UserRead(BaseModel):
    id: int
    name: str | None = None
    email: EmailStr

    model_config = {
        "from_attributes": True,
    }
