from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    name: str | None = None
    password: str


class UserRead(BaseModel):
    id: int
    name: str | None = None
    email: EmailStr
    active_profile_mode: str

    model_config = {
        "from_attributes": True,
    }

class UserModeUpdate(BaseModel):
    active_profile_mode: str
