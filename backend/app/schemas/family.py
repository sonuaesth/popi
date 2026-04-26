from pydantic import BaseModel, EmailStr


class FamilyCreate(BaseModel):
    name: str


class FamilyRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class FamilyInviteCreate(BaseModel):
    email: EmailStr


class FamilyInviteRead(BaseModel):
    id: int
    family_id: int
    email: EmailStr
    status: str

    class Config:
        from_attributes = True


class FamilyMemberRead(BaseModel):
    id: int
    family_id: int
    user_id: int
    role: str

    class Config:
        from_attributes = True
