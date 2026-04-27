from pydantic import BaseModel, EmailStr


class FamilyUserRead(BaseModel):
    id: int
    name: str | None = None
    email: EmailStr

    model_config = {
        "from_attributes": True,
    }


class FamilyCreate(BaseModel):
    name: str


class FamilyRead(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True,
    }


class FamilyInviteCreate(BaseModel):
    email: EmailStr


class FamilyInviteRead(BaseModel):
    id: int
    family_id: int
    email: EmailStr
    status: str

    model_config = {
        "from_attributes": True,
    }


class FamilyMemberRead(BaseModel):
    id: int
    family_id: int
    user_id: int
    role: str
    user: FamilyUserRead

    model_config = {
        "from_attributes": True,
    }
