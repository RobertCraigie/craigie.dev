from typing import Tuple
from typing_extensions import Unpack, TypeVarTuple, reveal_type


FieldT = TypeVarTuple('FieldT')


class User:
    id: int = 0
    name: str = ''
    email: str
    hashed_password: str

    @classmethod
    def select(cls, *fields: Unpack[FieldT]) -> Tuple[Unpack[FieldT]]:
        ...


user = User.select(User.id, User.name)
reveal_type(user)
